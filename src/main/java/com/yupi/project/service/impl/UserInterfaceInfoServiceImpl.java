package com.yupi.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.yupi.project.common.ErrorCode;
import com.yupi.project.exception.BusinessException;
import com.yupi.project.mapper.UserInterfaceInfoMapper;
import com.yupi.project.model.dto.userinterfaceinfo.UserInterfaceInfoQueryRequest;
import com.yupi.project.model.vo.UserInterfaceInfoManageVO;
import com.yupi.project.service.UserInterfaceInfoService;
import com.yupi.apicommon.model.entity.UserInterfaceInfo;
import org.springframework.stereotype.Service;

/**
 * 用户接口信息服务实现类
 *
 * @author <a href="https://github.com/liyupi">程序员鱼皮</a>
 * @from <a href="https://yupi.icu">编程导航知识星球</a>
 */
@Service
public class UserInterfaceInfoServiceImpl extends ServiceImpl<UserInterfaceInfoMapper, UserInterfaceInfo>
    implements UserInterfaceInfoService{

    @Override
    public void validUserInterfaceInfo(UserInterfaceInfo userInterfaceInfo, boolean add) {
        if (userInterfaceInfo == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        // 创建时，所有参数必须非空
        if (add) {
            if (userInterfaceInfo.getInterfaceInfoId() == null || userInterfaceInfo.getInterfaceInfoId() <= 0
                    || userInterfaceInfo.getUserId() == null || userInterfaceInfo.getUserId() <= 0) {
                throw new BusinessException(ErrorCode.PARAMS_ERROR, "接口或用户不存在");
            }
        }
        Integer leftNum = userInterfaceInfo.getLeftNum();
        if (leftNum != null && leftNum < 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "剩余次数不能小于 0");
        }
    }

    // [编程学习交流圈](https://www.code-nav.cn/) 快速入门编程不走弯路！30+ 原创学习路线和专栏、500+ 编程学习指南、1000+ 编程精华文章、20T+ 编程资源汇总

    @Override
    public boolean invokeCount(long interfaceInfoId, long userId) {
        // 判断
        if (interfaceInfoId <= 0 || userId <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        UpdateWrapper<UserInterfaceInfo> updateWrapper = new UpdateWrapper<>();
        updateWrapper.eq("interfaceInfoId", interfaceInfoId);
        updateWrapper.eq("userId", userId);
        updateWrapper.eq("isDelete", 0);
        updateWrapper.and(wrapper -> wrapper.eq("status", 0).or().isNull("status"));
        updateWrapper.gt("leftNum", 0);
        updateWrapper.setSql("leftNum = leftNum - 1, totalNum = IFNULL(totalNum, 0) + 1");
        return this.update(updateWrapper);
    }

    @Override
    public Page<UserInterfaceInfoManageVO> pageUserInterfaceInfoManage(UserInterfaceInfoQueryRequest queryRequest) {
        if (queryRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        long current = queryRequest.getCurrent();
        long pageSize = queryRequest.getPageSize();
        if (pageSize > 50) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        Page<UserInterfaceInfoManageVO> page = new Page<>(current, pageSize);
        this.baseMapper.pageUserInterfaceInfoManage(page, queryRequest);
        return page;
    }

}
