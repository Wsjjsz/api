package com.yupi.project.controller;

import com.yupi.project.common.BaseResponse;
import com.yupi.project.common.ErrorCode;
import com.yupi.project.common.ResultUtils;
import com.yupi.project.exception.BusinessException;
import com.yupi.yuapicommon.model.entity.InterfaceInfo;
import com.yupi.yuapicommon.model.entity.User;
import com.yupi.yuapicommon.service.InnerInterfaceInfoService;
import com.yupi.yuapicommon.service.InnerUserInterfaceInfoService;
import com.yupi.yuapicommon.service.InnerUserService;
import lombok.Data;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import java.util.Locale;

/**
 * 网关内部调用接口（HTTP 兜底）
 */
@RestController
@RequestMapping("/inner")
public class InnerController {

    private static final String INNER_TOKEN_HEADER = "X-Inner-Token";

    @Value("${yuapi.inner-token:yuapi-inner-token}")
    private String innerToken;

    @Resource
    private InnerUserService innerUserService;

    @Resource
    private InnerInterfaceInfoService innerInterfaceInfoService;

    @Resource
    private InnerUserInterfaceInfoService innerUserInterfaceInfoService;

    @PostMapping("/user/get/invoke")
    public BaseResponse<User> getInvokeUser(@RequestHeader(INNER_TOKEN_HEADER) String token,
                                            @RequestBody AccessKeyRequest request) {
        validateInnerToken(token);
        if (request == null || StringUtils.isBlank(request.getAccessKey())) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        return ResultUtils.success(innerUserService.getInvokeUser(request.getAccessKey()));
    }

    @PostMapping("/interface/get")
    public BaseResponse<InterfaceInfo> getInterfaceInfo(@RequestHeader(INNER_TOKEN_HEADER) String token,
                                                        @RequestBody InterfaceQueryRequest request) {
        validateInnerToken(token);
        if (request == null || StringUtils.isAnyBlank(request.getUrl(), request.getMethod())) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        String method = request.getMethod().trim().toUpperCase(Locale.ROOT);
        return ResultUtils.success(innerInterfaceInfoService.getInterfaceInfo(request.getUrl(), method));
    }

    @PostMapping("/userInterface/invokeCount")
    public BaseResponse<Boolean> invokeCount(@RequestHeader(INNER_TOKEN_HEADER) String token,
                                             @RequestBody InvokeCountRequest request) {
        validateInnerToken(token);
        if (request == null || request.getInterfaceInfoId() == null || request.getUserId() == null
                || request.getInterfaceInfoId() <= 0 || request.getUserId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        boolean result = innerUserInterfaceInfoService.invokeCount(request.getInterfaceInfoId(), request.getUserId());
        return ResultUtils.success(result);
    }

    private void validateInnerToken(String token) {
        if (!StringUtils.equals(innerToken, token)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR, "inner token invalid");
        }
    }

    @Data
    private static class AccessKeyRequest {
        private String accessKey;
    }

    @Data
    private static class InterfaceQueryRequest {
        private String url;
        private String method;
    }

    @Data
    private static class InvokeCountRequest {
        private Long interfaceInfoId;
        private Long userId;
    }
}
