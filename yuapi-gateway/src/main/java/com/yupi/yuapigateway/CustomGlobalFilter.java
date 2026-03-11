package com.yupi.yuapigateway;

import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpResponse;
import cn.hutool.json.JSONUtil;
import com.yupi.yuapiclientsdk.utils.SignUtils;
import com.yupi.yuapicommon.model.entity.InterfaceInfo;
import com.yupi.yuapicommon.model.entity.User;
import com.yupi.yuapicommon.service.InnerInterfaceInfoService;
import com.yupi.yuapicommon.service.InnerUserInterfaceInfoService;
import com.yupi.yuapicommon.service.InnerUserService;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.dubbo.config.annotation.DubboReference;
import org.reactivestreams.Publisher;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferFactory;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.http.server.reactive.ServerHttpResponseDecorator;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.NetworkInterface;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * 全局过滤
 *
 * @author <a href="https://github.com/liyupi">程序员鱼皮</a>
 * @from <a href="https://yupi.icu">编程导航知识星球</a>
 */
@Slf4j
@Component
public class CustomGlobalFilter implements GlobalFilter, Ordered {

    private static final String INNER_TOKEN_HEADER = "X-Inner-Token";
    private static final String INNER_USER_PATH = "/api/inner/user/get/invoke";
    private static final String INNER_INTERFACE_PATH = "/api/inner/interface/get";
    private static final String INNER_INVOKE_COUNT_PATH = "/api/inner/userInterface/invokeCount";

    @DubboReference(check = false, timeout = 5000)
    private InnerUserService innerUserService;

    @DubboReference(check = false, timeout = 5000)
    private InnerInterfaceInfoService innerInterfaceInfoService;

    @DubboReference(check = false, timeout = 5000)
    private InnerUserInterfaceInfoService innerUserInterfaceInfoService;

    @Value("${yuapi.inner-host:http://localhost:7529}")
    private String innerHost;

    @Value("${yuapi.inner-token:yuapi-inner-token}")
    private String innerToken;

    @Value("${yuapi.prefer-http-inner:true}")
    private boolean preferHttpInner;

    private static final List<String> IP_WHITE_LIST = Arrays.asList("127.0.0.1", "::1", "0:0:0:0:0:0:0:1");

    /**
     * 这些路径属于平台管理接口，不走网关签名鉴权，直接转发到主后端
     */
    private static final List<String> NO_AUTH_PATH_PREFIX_LIST = Arrays.asList(
            "/api/user/",
            "/api/interfaceInfo/",
            "/api/post/",
            "/api/userInterfaceInfo/",
            "/api/analysis/",
            "/api/v3/",
            "/api/doc.html",
            "/api/webjars/"
    );

    private static final String INTERFACE_HOST = "http://localhost:8123";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // 1. 请求日志
        ServerHttpRequest request = exchange.getRequest();
        String requestPath = request.getPath().value();
        String path = INTERFACE_HOST + requestPath;
        String method = request.getMethod().toString();
        log.info("请求唯一标识：" + request.getId());
        log.info("请求路径：" + path);
        log.info("请求方法：" + method);
        log.info("请求参数：" + request.getQueryParams());
        log.info("请求来源地址：" + request.getRemoteAddress());

        // 2. 管理端 API 直接放行，不走签名鉴权
        if (isNoAuthPath(requestPath)) {
            return chain.filter(exchange);
        }

        // 3. 访问控制 - IP 白名单
        ServerHttpResponse response = exchange.getResponse();
        String sourceAddress = getClientIp(request);
        if (!isAllowedSource(sourceAddress)) {
            return deny(response, "IP_NOT_ALLOWED:" + sourceAddress);
        }

        // 4. 用户鉴权（判断 ak、sk 是否合法）
        HttpHeaders headers = request.getHeaders();
        String accessKey = headers.getFirst("accessKey");
        String nonce = headers.getFirst("nonce");
        String timestamp = headers.getFirst("timestamp");
        String sign = headers.getFirst("sign");
        String body = headers.getFirst("body");
        if (accessKey == null || nonce == null || timestamp == null || sign == null) {
            return deny(response, "MISSING_AUTH_HEADERS");
        }
        if (body == null) {
            body = "";
        }

        long nonceValue;
        long timestampValue;
        try {
            nonceValue = Long.parseLong(nonce);
            timestampValue = Long.parseLong(timestamp);
        } catch (NumberFormatException e) {
            return deny(response, "INVALID_NONCE_OR_TIMESTAMP");
        }

        User invokeUser = getInvokeUserWithFallback(accessKey);
        if (invokeUser == null) {
            return deny(response, "INVOKE_USER_NOT_FOUND");
        }
//        if (!"yupi".equals(accessKey)) {
//            return handleNoAuth(response);
//        }
        if (nonceValue > 10000L) {
            return deny(response, "NONCE_TOO_LARGE");
        }
        // 时间和当前时间不能超过 5 分钟
        long currentTime = System.currentTimeMillis() / 1000;
        final Long FIVE_MINUTES = 60 * 5L;
        if (Math.abs(currentTime - timestampValue) >= FIVE_MINUTES) {
            return deny(response, "TIMESTAMP_EXPIRED");
        }
        // 实际情况中是从数据库中查出 secretKey
        String secretKey = invokeUser.getSecretKey();
        if (!isSignValid(sign, body, secretKey)) {
            return deny(response, "SIGN_NOT_MATCH");
        }
        // 5. 请求的模拟接口是否存在，以及请求方法是否匹配
        InterfaceInfo interfaceInfo = getInterfaceInfoWithFallback(path, method);
        if (interfaceInfo == null) {
            return deny(response, "INTERFACE_NOT_FOUND");
        }
        // todo 是否还有调用次数
        // 6. 请求转发，调用模拟接口 + 响应日志
        //        Mono<Void> filter = chain.filter(exchange);
        //        return filter;
        return handleResponse(exchange, chain, interfaceInfo.getId(), invokeUser.getId());

    }

    /**
     * 处理响应
     *
     * @param exchange
     * @param chain
     * @return
     */
    public Mono<Void> handleResponse(ServerWebExchange exchange, GatewayFilterChain chain, long interfaceInfoId, long userId) {
        try {
            ServerHttpResponse originalResponse = exchange.getResponse();
            // 缓存数据的工厂
            DataBufferFactory bufferFactory = originalResponse.bufferFactory();
            AtomicBoolean counted = new AtomicBoolean(false);
            // 装饰，增强能力
            ServerHttpResponseDecorator decoratedResponse = new ServerHttpResponseDecorator(originalResponse) {
                // 等调用完转发的接口后才会执行
                @Override
                public Mono<Void> writeWith(Publisher<? extends DataBuffer> body) {
                    log.info("body instanceof Flux: {}", (body instanceof Flux));
                    Mono<Void> writeMono;
                    if (body instanceof Flux) {
                        Flux<? extends DataBuffer> fluxBody = Flux.from(body);
                        writeMono = super.writeWith(
                                fluxBody.map(dataBuffer -> {
                                    byte[] content = new byte[dataBuffer.readableByteCount()];
                                    dataBuffer.read(content);
                                    DataBufferUtils.release(dataBuffer);//释放掉内存
                                    String data = new String(content, StandardCharsets.UTF_8);
                                    log.info("响应结果：" + data);
                                    return bufferFactory.wrap(content);
                                })
                        );
                    } else {
                        writeMono = super.writeWith(body);
                    }
                    return writeMono.doOnSuccess(unused -> invokeCountIfSuccess(interfaceInfoId, userId, counted, getStatusCode()));
                }
            };
            // 设置 response 对象为装饰过的
            return chain.filter(exchange.mutate().response(decoratedResponse).build());
        } catch (Exception e) {
            log.error("网关处理响应异常" + e);
            return chain.filter(exchange);
        }
    }

    @Override
    public int getOrder() {
        return -1;
    }

    public Mono<Void> handleNoAuth(ServerHttpResponse response) {
        return deny(response, "NO_AUTH");
    }

    public Mono<Void> handleInvokeError(ServerHttpResponse response) {
        response.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR);
        return response.setComplete();
    }

    private boolean isNoAuthPath(String requestPath) {
        return NO_AUTH_PATH_PREFIX_LIST.stream().anyMatch(requestPath::startsWith);
    }

    private String getClientIp(ServerHttpRequest request) {
        InetSocketAddress remoteAddress = request.getRemoteAddress();
        if (remoteAddress == null) {
            return "";
        }
        InetAddress address = remoteAddress.getAddress();
        if (address != null) {
            return address.getHostAddress();
        }
        return remoteAddress.getHostString();
    }

    private void invokeCountIfSuccess(long interfaceInfoId, long userId, AtomicBoolean counted, HttpStatus statusCode) {
        if (statusCode == null || !statusCode.is2xxSuccessful() || !counted.compareAndSet(false, true)) {
            return;
        }
        invokeCountWithFallback(interfaceInfoId, userId);
    }

    private User getInvokeUserWithFallback(String accessKey) {
        if (preferHttpInner) {
            return getInvokeUserByHttp(accessKey);
        }
        try {
            return innerUserService.getInvokeUser(accessKey);
        } catch (Exception e) {
            log.warn("getInvokeUser via dubbo error: {}", e.getMessage());
            if (!preferHttpInner) {
                return getInvokeUserByHttp(accessKey);
            }
            return null;
        }
    }

    private InterfaceInfo getInterfaceInfoWithFallback(String url, String method) {
        if (preferHttpInner) {
            return getInterfaceInfoByHttp(url, method);
        }
        try {
            return innerInterfaceInfoService.getInterfaceInfo(url, method);
        } catch (Exception e) {
            log.warn("getInterfaceInfo via dubbo error: {}", e.getMessage());
            if (!preferHttpInner) {
                return getInterfaceInfoByHttp(url, method);
            }
            return null;
        }
    }

    private void invokeCountWithFallback(long interfaceInfoId, long userId) {
        if (preferHttpInner) {
            invokeCountByHttp(interfaceInfoId, userId);
            return;
        }
        try {
            innerUserInterfaceInfoService.invokeCount(interfaceInfoId, userId);
            return;
        } catch (Exception e) {
            log.warn("invokeCount via dubbo error: {}", e.getMessage());
        }
        if (!preferHttpInner) {
            invokeCountByHttp(interfaceInfoId, userId);
        }
    }

    private User getInvokeUserByHttp(String accessKey) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("accessKey", accessKey);
        String responseBody = postInner(INNER_USER_PATH, requestBody);
        return parseSuccessData(responseBody, User.class);
    }

    private InterfaceInfo getInterfaceInfoByHttp(String url, String method) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("url", url);
        requestBody.put("method", method);
        String responseBody = postInner(INNER_INTERFACE_PATH, requestBody);
        return parseSuccessData(responseBody, InterfaceInfo.class);
    }

    private boolean invokeCountByHttp(long interfaceInfoId, long userId) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("interfaceInfoId", interfaceInfoId);
        requestBody.put("userId", userId);
        String responseBody = postInner(INNER_INVOKE_COUNT_PATH, requestBody);
        if (!isSuccess(responseBody)) {
            log.warn("invokeCount by http fallback failed, interfaceInfoId={}, userId={}", interfaceInfoId, userId);
            return false;
        }
        return true;
    }

    private String postInner(String path, Map<String, Object> payload) {
        String innerUrl = buildInnerUrl(path);
        if (StringUtils.isAnyBlank(innerUrl, innerToken)) {
            return null;
        }
        try {
            HttpResponse response = HttpRequest.post(innerUrl)
                    .header(INNER_TOKEN_HEADER, innerToken)
                    .body(JSONUtil.toJsonStr(payload))
                    .timeout(3000)
                    .execute();
            if (response.getStatus() != HttpStatus.OK.value()) {
                log.warn("inner http status not ok, url={}, status={}", innerUrl, response.getStatus());
                return null;
            }
            return response.body();
        } catch (Exception e) {
            log.error("inner http request error, url={}", innerUrl, e);
            return null;
        }
    }

    private String buildInnerUrl(String path) {
        if (StringUtils.isAnyBlank(innerHost, path)) {
            return null;
        }
        return StringUtils.removeEnd(innerHost.trim(), "/") + path;
    }

    private <T> T parseSuccessData(String responseBody, Class<T> dataClass) {
        if (!isSuccess(responseBody)) {
            return null;
        }
        Map<String, Object> responseMap = JSONUtil.toBean(responseBody, Map.class);
        Object data = responseMap.get("data");
        if (data == null) {
            return null;
        }
        return JSONUtil.toBean(JSONUtil.parseObj(data), dataClass);
    }

    private boolean parseSuccessBoolean(String responseBody) {
        if (!isSuccess(responseBody)) {
            return false;
        }
        Map<String, Object> responseMap = JSONUtil.toBean(responseBody, Map.class);
        Object data = responseMap.get("data");
        if (data == null) {
            return false;
        }
        if (data instanceof Boolean) {
            return (Boolean) data;
        }
        return Boolean.parseBoolean(String.valueOf(data));
    }

    private boolean isSuccess(String responseBody) {
        if (StringUtils.isBlank(responseBody) || !JSONUtil.isTypeJSON(responseBody)) {
            return false;
        }
        Map<String, Object> responseMap = JSONUtil.toBean(responseBody, Map.class);
        Object code = responseMap.get("code");
        if (!(code instanceof Number)) {
            return false;
        }
        return ((Number) code).intValue() == 0;
    }

    private boolean isSignValid(String sign, String body, String secretKey) {
        if (StringUtils.isBlank(sign) || StringUtils.isBlank(secretKey)) {
            return false;
        }
        String rawBody = body == null ? "" : body;
        if (StringUtils.equals(sign, SignUtils.genSign(rawBody, secretKey))) {
            return true;
        }
        String decodedBody = decodeHeaderBody(rawBody);
        return !StringUtils.equals(rawBody, decodedBody)
                && StringUtils.equals(sign, SignUtils.genSign(decodedBody, secretKey));
    }

    /**
     * 某些客户端会把 UTF-8 文本放进 HTTP Header，服务端读取时可能出现 ISO-8859-1 乱码。
     */
    private String decodeHeaderBody(String body) {
        if (StringUtils.isBlank(body)) {
            return body;
        }
        String decoded = body;
        try {
            String maybeUtf8 = new String(body.getBytes(StandardCharsets.ISO_8859_1), StandardCharsets.UTF_8);
            if (StringUtils.isNotBlank(maybeUtf8)) {
                decoded = maybeUtf8;
            }
        } catch (Exception ignored) {
            // ignore
        }
        if (decoded.contains("%") || decoded.contains("+")) {
            try {
                decoded = URLDecoder.decode(decoded, StandardCharsets.UTF_8.name());
            } catch (Exception ignored) {
                // ignore
            }
        }
        return decoded;
    }

    private boolean isAllowedSource(String ip) {
        if (ip == null || ip.isEmpty()) {
            return false;
        }
        if (IP_WHITE_LIST.contains(ip)) {
            return true;
        }
        try {
            InetAddress sourceAddress = InetAddress.getByName(ip);
            if (sourceAddress.isAnyLocalAddress() || sourceAddress.isLoopbackAddress()) {
                return true;
            }
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements()) {
                NetworkInterface networkInterface = interfaces.nextElement();
                Enumeration<InetAddress> inetAddresses = networkInterface.getInetAddresses();
                while (inetAddresses.hasMoreElements()) {
                    InetAddress localAddress = inetAddresses.nextElement();
                    if (ip.equals(localAddress.getHostAddress())) {
                        return true;
                    }
                }
            }
        } catch (Exception e) {
            log.warn("check source ip failed, ip={}", ip, e);
        }
        return false;
    }

    private Mono<Void> deny(ServerHttpResponse response, String reason) {
        log.warn("gateway deny, reason={}", reason);
        response.setStatusCode(HttpStatus.FORBIDDEN);
        response.getHeaders().setContentType(MediaType.TEXT_PLAIN);
        byte[] bytes = reason.getBytes(StandardCharsets.UTF_8);
        DataBuffer dataBuffer = response.bufferFactory().wrap(bytes);
        return response.writeWith(Mono.just(dataBuffer));
    }
}
