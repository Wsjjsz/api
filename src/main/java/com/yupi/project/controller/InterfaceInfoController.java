package com.yupi.project.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.project.annotation.AuthCheck;
import com.yupi.project.common.*;
import com.yupi.project.constant.CommonConstant;
import com.yupi.project.constant.UserConstant;
import com.yupi.project.exception.BusinessException;
import com.yupi.project.model.dto.interfaceinfo.InterfaceInfoAddRequest;
import com.yupi.project.model.dto.interfaceinfo.InterfaceInfoInvokeRequest;
import com.yupi.project.model.dto.interfaceinfo.InterfaceInfoQueryRequest;
import com.yupi.project.model.dto.interfaceinfo.InterfaceInfoUpdateRequest;
import com.yupi.project.model.enums.InterfaceInfoStatusEnum;
import com.yupi.project.model.vo.InterfaceInvokeStatVO;
import com.yupi.project.service.InterfaceInfoService;
import com.yupi.project.service.UserInterfaceInfoService;
import com.yupi.project.service.UserService;
import com.yupi.project.provider.NameService;
import com.yupi.yuapicommon.model.entity.InterfaceInfo;
import com.yupi.yuapicommon.model.entity.User;
import com.yupi.yuapicommon.model.entity.UserInterfaceInfo;
import cn.hutool.core.util.CharsetUtil;
import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpResponse;
import cn.hutool.http.HttpUtil;
import cn.hutool.json.JSONUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * 接口管理
 *
 * @author <a href="https://github.com/liyupi">程序员鱼皮</a>
 * @from <a href="https://yupi.icu">编程导航知识星球</a>
 */
@RestController
@RequestMapping("/interfaceInfo")
@Slf4j
public class InterfaceInfoController {

    @Resource
    private InterfaceInfoService interfaceInfoService;

    @Resource
    private UserService userService;

    @Resource
    private UserInterfaceInfoService userInterfaceInfoService;

    @DubboReference(check = false)
    private NameService nameService;

    @GetMapping("/name/random")
    public String getRandomName() {
        return nameService.getRandomName();
    }

    // region 增删改查

    /**
     * 创建
     *
     * @param interfaceInfoAddRequest
     * @param request
     * @return
     */
    @PostMapping("/add")
    public BaseResponse<Long> addInterfaceInfo(@RequestBody InterfaceInfoAddRequest interfaceInfoAddRequest, HttpServletRequest request) {
        if (interfaceInfoAddRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        InterfaceInfo interfaceInfo = new InterfaceInfo();
        BeanUtils.copyProperties(interfaceInfoAddRequest, interfaceInfo);
        // 校验
        interfaceInfoService.validInterfaceInfo(interfaceInfo, true);
        User loginUser = userService.getLoginUser(request);
        interfaceInfo.setUserId(loginUser.getId());
        boolean result = interfaceInfoService.save(interfaceInfo);
        if (!result) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR);
        }
        long newInterfaceInfoId = interfaceInfo.getId();
        return ResultUtils.success(newInterfaceInfoId);
    }

    /**
     * 删除
     *
     * @param deleteRequest
     * @param request
     * @return
     */
    @PostMapping("/delete")
    public BaseResponse<Boolean> deleteInterfaceInfo(@RequestBody DeleteRequest deleteRequest, HttpServletRequest request) {
        if (deleteRequest == null || deleteRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        User user = userService.getLoginUser(request);
        long id = deleteRequest.getId();
        // 判断是否存在
        InterfaceInfo oldInterfaceInfo = interfaceInfoService.getById(id);
        if (oldInterfaceInfo == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR);
        }
        // 仅本人或管理员可删除
        if (!oldInterfaceInfo.getUserId().equals(user.getId()) && !userService.isAdmin(request)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }
        boolean b = interfaceInfoService.removeById(id);
        return ResultUtils.success(b);
    }

    /**
     * 更新
     *
     * @param interfaceInfoUpdateRequest
     * @param request
     * @return
     */
    @PostMapping("/update")
    public BaseResponse<Boolean> updateInterfaceInfo(@RequestBody InterfaceInfoUpdateRequest interfaceInfoUpdateRequest,
                                                     HttpServletRequest request) {
        if (interfaceInfoUpdateRequest == null || interfaceInfoUpdateRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        InterfaceInfo interfaceInfo = new InterfaceInfo();
        BeanUtils.copyProperties(interfaceInfoUpdateRequest, interfaceInfo);
        // 参数校验
        interfaceInfoService.validInterfaceInfo(interfaceInfo, false);
        User user = userService.getLoginUser(request);
        long id = interfaceInfoUpdateRequest.getId();
        // 判断是否存在
        InterfaceInfo oldInterfaceInfo = interfaceInfoService.getById(id);
        if (oldInterfaceInfo == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR);
        }
        // 仅本人或管理员可修改
        if (!oldInterfaceInfo.getUserId().equals(user.getId()) && !userService.isAdmin(request)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }
        boolean result = interfaceInfoService.updateById(interfaceInfo);
        return ResultUtils.success(result);
    }

    /**
     * 根据 id 获取
     *
     * @param id
     * @return
     */
    @GetMapping("/get")
    public BaseResponse<InterfaceInfo> getInterfaceInfoById(long id) {
        if (id <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        InterfaceInfo interfaceInfo = interfaceInfoService.getById(id);
        return ResultUtils.success(interfaceInfo);
    }

    /**
     * 获取列表（仅管理员可使用）
     *
     * @param interfaceInfoQueryRequest
     * @return
     */
    @AuthCheck(mustRole = "admin")
    @GetMapping("/list")
    public BaseResponse<List<InterfaceInfo>> listInterfaceInfo(InterfaceInfoQueryRequest interfaceInfoQueryRequest) {
        InterfaceInfo interfaceInfoQuery = new InterfaceInfo();
        if (interfaceInfoQueryRequest != null) {
            BeanUtils.copyProperties(interfaceInfoQueryRequest, interfaceInfoQuery);
        }
        QueryWrapper<InterfaceInfo> queryWrapper = new QueryWrapper<>(interfaceInfoQuery);
        List<InterfaceInfo> interfaceInfoList = interfaceInfoService.list(queryWrapper);
        return ResultUtils.success(interfaceInfoList);
    }

    /**
     * 分页获取列表
     *
     * @param interfaceInfoQueryRequest
     * @param request
     * @return
     */
    @GetMapping("/list/page")
    public BaseResponse<Page<InterfaceInfo>> listInterfaceInfoByPage(InterfaceInfoQueryRequest interfaceInfoQueryRequest, HttpServletRequest request) {
        if (interfaceInfoQueryRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        InterfaceInfo interfaceInfoQuery = new InterfaceInfo();
        BeanUtils.copyProperties(interfaceInfoQueryRequest, interfaceInfoQuery);
        long current = interfaceInfoQueryRequest.getCurrent();
        long size = interfaceInfoQueryRequest.getPageSize();
        String sortField = interfaceInfoQueryRequest.getSortField();
        String sortOrder = interfaceInfoQueryRequest.getSortOrder();
        String description = interfaceInfoQuery.getDescription();
        // description 需支持模糊搜索
        interfaceInfoQuery.setDescription(null);
        // 限制爬虫
        if (size > 50) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        QueryWrapper<InterfaceInfo> queryWrapper = new QueryWrapper<>(interfaceInfoQuery);
        queryWrapper.like(StringUtils.isNotBlank(description), "description", description);
        queryWrapper.orderBy(StringUtils.isNotBlank(sortField),
                sortOrder.equals(CommonConstant.SORT_ORDER_ASC), sortField);
        Page<InterfaceInfo> interfaceInfoPage = interfaceInfoService.page(new Page<>(current, size), queryWrapper);
        return ResultUtils.success(interfaceInfoPage);
    }

    // endregion

    /**
     * 发布
     *
     * @param idRequest
     * @param request
     * @return
     */
    @PostMapping("/online")
    @AuthCheck(mustRole = "admin")
    public BaseResponse<Boolean> onlineInterfaceInfo(@RequestBody IdRequest idRequest,
                                                     HttpServletRequest request) {
        if (idRequest == null || idRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        long id = idRequest.getId();
        // 判断是否存在
        InterfaceInfo oldInterfaceInfo = interfaceInfoService.getById(id);
        if (oldInterfaceInfo == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR);
        }
        // 基础校验：必须有 url + method，避免发布无效接口
        if (StringUtils.isAnyBlank(oldInterfaceInfo.getUrl(), oldInterfaceInfo.getMethod())) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "接口信息不完整，缺少 url 或 method");
        }
        // 仅本人或管理员可修改
        InterfaceInfo interfaceInfo = new InterfaceInfo();
        interfaceInfo.setId(id);
        interfaceInfo.setStatus(InterfaceInfoStatusEnum.ONLINE.getValue());
        boolean result = interfaceInfoService.updateById(interfaceInfo);
        return ResultUtils.success(result);
    }

    /**
     * 下线
     *
     * @param idRequest
     * @param request
     * @return
     */
    @PostMapping("/offline")
    @AuthCheck(mustRole = "admin")
    public BaseResponse<Boolean> offlineInterfaceInfo(@RequestBody IdRequest idRequest,
                                                      HttpServletRequest request) {
        if (idRequest == null || idRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        long id = idRequest.getId();
        // 判断是否存在
        InterfaceInfo oldInterfaceInfo = interfaceInfoService.getById(id);
        if (oldInterfaceInfo == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR);
        }
        // 仅本人或管理员可修改
        InterfaceInfo interfaceInfo = new InterfaceInfo();
        interfaceInfo.setId(id);
        interfaceInfo.setStatus(InterfaceInfoStatusEnum.OFFLINE.getValue());
        boolean result = interfaceInfoService.updateById(interfaceInfo);
        return ResultUtils.success(result);
    }

    /**
     * 获取当前登录用户在当前接口下的调用统计
     *
     * @param id 接口 id
     * @param request 请求
     * @return 统计信息
     */
    @GetMapping("/invoke/stat")
    public BaseResponse<InterfaceInvokeStatVO> getInvokeStat(long id, HttpServletRequest request) {
        if (id <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        User loginUser = userService.getLoginUser(request);
        InterfaceInfo oldInterfaceInfo = interfaceInfoService.getById(id);
        if (oldInterfaceInfo == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR);
        }
        QueryWrapper<UserInterfaceInfo> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("userId", loginUser.getId());
        queryWrapper.eq("interfaceInfoId", id);
        queryWrapper.eq("isDelete", 0);
        UserInterfaceInfo userInterfaceInfo = userInterfaceInfoService.getOne(queryWrapper, false);

        InterfaceInvokeStatVO statVO = new InterfaceInvokeStatVO();
        statVO.setUserId(loginUser.getId());
        statVO.setUserName(loginUser.getUserName());
        statVO.setUserAccount(loginUser.getUserAccount());
        statVO.setInterfaceInfoId(id);
        if (userInterfaceInfo == null) {
            statVO.setTotalNum(0);
            statVO.setLeftNum(0);
            statVO.setStatus(1);
        } else {
            statVO.setTotalNum(userInterfaceInfo.getTotalNum() == null ? 0 : userInterfaceInfo.getTotalNum());
            statVO.setLeftNum(userInterfaceInfo.getLeftNum() == null ? 0 : userInterfaceInfo.getLeftNum());
            statVO.setStatus(userInterfaceInfo.getStatus());
        }
        // 接口全局总调用次数仅管理员可见
        if (UserConstant.ADMIN_ROLE.equals(loginUser.getUserRole())) {
            statVO.setInterfaceTotalNum(getInterfaceTotalInvokeNum(id));
        }
        return ResultUtils.success(statVO);
    }

    private int getInterfaceTotalInvokeNum(long interfaceInfoId) {
        QueryWrapper<UserInterfaceInfo> totalQueryWrapper = new QueryWrapper<>();
        totalQueryWrapper.select("IFNULL(SUM(totalNum), 0) AS totalNum");
        totalQueryWrapper.eq("interfaceInfoId", interfaceInfoId);
        totalQueryWrapper.eq("isDelete", 0);
        Map<String, Object> totalMap = userInterfaceInfoService.getMap(totalQueryWrapper);
        if (totalMap == null) {
            return 0;
        }
        Object totalNumObj = totalMap.get("totalNum");
        if (totalNumObj instanceof Number) {
            return ((Number) totalNumObj).intValue();
        }
        if (totalNumObj == null) {
            return 0;
        }
        try {
            return Integer.parseInt(String.valueOf(totalNumObj));
        } catch (NumberFormatException e) {
            log.warn("parse interface total invoke num failed, interfaceInfoId={}, value={}", interfaceInfoId, totalNumObj);
            return 0;
        }
    }

    /**
     * 测试调用
     *
     * @param interfaceInfoInvokeRequest
     * @param request
     * @return
     */
    @PostMapping("/invoke")
    public BaseResponse<Object> invokeInterfaceInfo(@RequestBody InterfaceInfoInvokeRequest interfaceInfoInvokeRequest,
                                                     HttpServletRequest request) {
        if (interfaceInfoInvokeRequest == null || interfaceInfoInvokeRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        long id = interfaceInfoInvokeRequest.getId();
        String userRequestParams = interfaceInfoInvokeRequest.getUserRequestParams();
        // 判断是否存在
        InterfaceInfo oldInterfaceInfo = interfaceInfoService.getById(id);
        if (oldInterfaceInfo == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR);
        }
        if (oldInterfaceInfo.getStatus() == InterfaceInfoStatusEnum.OFFLINE.getValue()) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "接口已关闭");
        }
        // 在线调试要求登录
        User loginUser = userService.getLoginUser(request);
        long userId = loginUser.getId();
        // 先检查可用次数，避免无次数时仍调用目标接口
        checkInvokeQuota(id, userId);
        HttpInvokeResult invokeResult = invokeByDirectHttp(oldInterfaceInfo.getUrl(), oldInterfaceInfo.getMethod(), userRequestParams);
        if (!invokeResult.isSuccess()) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR,
                    "接口调用失败，状态码：" + invokeResult.getStatusCode() + "，响应：" + invokeResult.getBody());
        }
        // 调用成功后扣减次数 + 统计总调用次数
        boolean invokeCountResult = userInterfaceInfoService.invokeCount(id, userId);
        if (!invokeCountResult) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "调用成功，但次数扣减失败，请刷新后重试");
        }
        return ResultUtils.success(invokeResult.getBody());
    }

    private void checkInvokeQuota(long interfaceInfoId, long userId) {
        QueryWrapper<UserInterfaceInfo> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("interfaceInfoId", interfaceInfoId);
        queryWrapper.eq("userId", userId);
        queryWrapper.eq("isDelete", 0);
        queryWrapper.last("limit 1");
        UserInterfaceInfo userInterfaceInfo = userInterfaceInfoService.getOne(queryWrapper, false);
        if (userInterfaceInfo == null) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "暂无调用次数，请联系管理员分配");
        }
        Integer status = userInterfaceInfo.getStatus();
        if (status != null && status != 0) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "当前接口调用权限已禁用");
        }
        Integer leftNum = userInterfaceInfo.getLeftNum();
        if (leftNum == null || leftNum <= 0) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "剩余调用次数不足");
        }
    }

    private HttpInvokeResult invokeByDirectHttp(String interfaceUrl, String method, String userRequestParams) {
        if (StringUtils.isAnyBlank(interfaceUrl, method)) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "接口地址或请求方法为空");
        }
        String requestBody = normalizeRequestBody(userRequestParams);
        String requestMethod = method.trim().toUpperCase(Locale.ROOT);
        HttpResponse httpResponse;
        switch (requestMethod) {
            case "GET":
                String urlWithQuery = interfaceUrl;
                Map<String, Object> queryMap = parseJsonObjectToMap(requestBody);
                if (!queryMap.isEmpty()) {
                    urlWithQuery = HttpUtil.urlWithForm(interfaceUrl, queryMap, CharsetUtil.CHARSET_UTF_8, true);
                }
                httpResponse = HttpRequest.get(urlWithQuery).execute();
                break;
            case "POST":
                httpResponse = HttpRequest.post(interfaceUrl).body(requestBody).execute();
                break;
            case "PUT":
                httpResponse = HttpRequest.put(interfaceUrl).body(requestBody).execute();
                break;
            case "DELETE":
                httpResponse = HttpRequest.delete(interfaceUrl).body(requestBody).execute();
                break;
            default:
                throw new BusinessException(ErrorCode.PARAMS_ERROR, "暂不支持的请求方法: " + method);
        }
        String responseBody = httpResponse.body();
        if (StringUtils.isBlank(responseBody)) {
            responseBody = "[EMPTY_RESPONSE] status=" + httpResponse.getStatus();
        }
        return new HttpInvokeResult(httpResponse.getStatus(), responseBody);
    }

    private String normalizeRequestBody(String userRequestParams) {
        if (StringUtils.isBlank(userRequestParams)) {
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

    private static class HttpInvokeResult {
        private final int statusCode;
        private final String body;

        private HttpInvokeResult(int statusCode, String body) {
            this.statusCode = statusCode;
            this.body = body;
        }

        private int getStatusCode() {
            return statusCode;
        }

        private String getBody() {
            return body;
        }

        private boolean isSuccess() {
            return statusCode >= 200 && statusCode < 300;
        }
    }

}
