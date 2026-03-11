package com.yupi.yuapiclientsdk.client;

import cn.hutool.core.util.RandomUtil;
import cn.hutool.core.util.CharsetUtil;
import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpResponse;
import cn.hutool.http.HttpUtil;
import cn.hutool.json.JSONUtil;
import com.yupi.yuapiclientsdk.model.User;


import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import static com.yupi.yuapiclientsdk.utils.SignUtils.genSign;

/**
 * 调用第三方接口的客户端
 *
 * @author <a href="https://github.com/liyupi">程序员鱼皮</a>
 * @from <a href="https://yupi.icu">编程导航知识星球</a>
 */
public class YuApiClient {

    private static final String GATEWAY_HOST = "http://localhost:8090";

    private String accessKey;

    private String secretKey;

    public YuApiClient(String accessKey, String secretKey) {
        this.accessKey = accessKey;
        this.secretKey = secretKey;
    }

    public String getNameByGet(String name) {
        //可以单独传入http参数，这样参数会自动做URL编码，拼接在URL中
        HashMap<String, Object> paramMap = new HashMap<>();
        paramMap.put("name", name);
        String result = HttpUtil.get(GATEWAY_HOST + "/api/name/", paramMap);
        System.out.println(result);
        return result;
    }

    public String getNameByPost(String name) {
        //可以单独传入http参数，这样参数会自动做URL编码，拼接在URL中
        HashMap<String, Object> paramMap = new HashMap<>();
        paramMap.put("name", name);
        String result = HttpUtil.post(GATEWAY_HOST + "/api/name/", paramMap);
        System.out.println(result);
        return result;
    }

    private Map<String, String> getHeaderMap(String body) {
        Map<String, String> hashMap = new HashMap<>();
        hashMap.put("accessKey", accessKey);
        // 一定不能直接发送
//        hashMap.put("secretKey", secretKey);
        hashMap.put("nonce", RandomUtil.randomNumbers(4));
        hashMap.put("body", body);
        hashMap.put("timestamp", String.valueOf(System.currentTimeMillis() / 1000));
        hashMap.put("sign", genSign(body, secretKey));
        return hashMap;
    }

    public String getUsernameByPost(User user) {
        String json = JSONUtil.toJsonStr(user);
        HttpResponse httpResponse = HttpRequest.post(GATEWAY_HOST + "/api/name/user")
                .addHeaders(getHeaderMap(json))
                .body(json)
                .execute();
        System.out.println(httpResponse.getStatus());
        String result = httpResponse.body();
        System.out.println(result);
        return result;
    }

    /**
     * 按接口信息动态调用网关
     *
     * @param interfaceUrl       接口地址（可为完整地址或 /api 开头路径）
     * @param method             请求方法
     * @param userRequestParams  用户请求参数（JSON 字符串）
     * @return 响应体字符串
     */
    public String invokeInterface(String interfaceUrl, String method, String userRequestParams) {
        if (interfaceUrl == null || method == null) {
            throw new IllegalArgumentException("interfaceUrl 或 method 不能为空");
        }
        String requestPath = resolveRequestPath(interfaceUrl);
        String requestBody = normalizeRequestBody(userRequestParams);
        String requestMethod = method.trim().toUpperCase(Locale.ROOT);
        String targetUrl = GATEWAY_HOST + requestPath;

        HttpResponse httpResponse;
        switch (requestMethod) {
            case "GET":
                Map<String, Object> queryMap = parseJsonObjectToMap(requestBody);
                if (!queryMap.isEmpty()) {
                    targetUrl = HttpUtil.urlWithForm(targetUrl, queryMap, CharsetUtil.CHARSET_UTF_8, true);
                }
                httpResponse = HttpRequest.get(targetUrl)
                        .addHeaders(getHeaderMap(requestBody))
                        .execute();
                break;
            case "POST":
                httpResponse = HttpRequest.post(targetUrl)
                        .addHeaders(getHeaderMap(requestBody))
                        .body(requestBody)
                        .execute();
                break;
            case "PUT":
                httpResponse = HttpRequest.put(targetUrl)
                        .addHeaders(getHeaderMap(requestBody))
                        .body(requestBody)
                        .execute();
                break;
            case "DELETE":
                httpResponse = HttpRequest.delete(targetUrl)
                        .addHeaders(getHeaderMap(requestBody))
                        .body(requestBody)
                        .execute();
                break;
            default:
                throw new IllegalArgumentException("暂不支持的请求方法: " + method);
        }
        return httpResponse.body();
    }

    private String resolveRequestPath(String interfaceUrl) {
        String trimmed = interfaceUrl.trim();
        int pathStart = trimmed.indexOf("/api/");
        if (pathStart >= 0) {
            return trimmed.substring(pathStart);
        }
        if (trimmed.startsWith("/")) {
            return trimmed;
        }
        return "/" + trimmed;
    }

    private String normalizeRequestBody(String userRequestParams) {
        if (userRequestParams == null || userRequestParams.trim().isEmpty()) {
            return "{}";
        }
        return userRequestParams.trim();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseJsonObjectToMap(String json) {
        if (!JSONUtil.isTypeJSONObject(json)) {
            return new HashMap<>();
        }
        return JSONUtil.toBean(json, HashMap.class);
    }
}
