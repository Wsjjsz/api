package com.yupi.project.mapper;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.project.model.dto.userinterfaceinfo.UserInterfaceInfoQueryRequest;
import com.yupi.project.model.vo.UserInterfaceInfoManageVO;
import com.yupi.apicommon.model.entity.UserInterfaceInfo;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 用户接口信息 Mapper
 *
 * @author <a href="https://github.com/liyupi">程序员鱼皮</a>
 * @from <a href="https://yupi.icu">编程导航知识星球</a>
 */
public interface UserInterfaceInfoMapper extends BaseMapper<UserInterfaceInfo> {

    List<UserInterfaceInfo> listTopInvokeInterfaceInfo(int limit);

    Long getTotalInvokeNum();

    IPage<UserInterfaceInfoManageVO> pageUserInterfaceInfoManage(
            Page<UserInterfaceInfoManageVO> page,
            @Param("query") UserInterfaceInfoQueryRequest query
    );
}


