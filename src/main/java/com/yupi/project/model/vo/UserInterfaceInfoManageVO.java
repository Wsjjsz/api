package com.yupi.project.model.vo;

import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * 管理端用户接口信息视图
 */
@Data
public class UserInterfaceInfoManageVO implements Serializable {

    private Long id;

    private Long userId;

    /**
     * 用户名（昵称）
     */
    private String userName;

    private Long interfaceInfoId;

    /**
     * 接口名
     */
    private String interfaceName;

    private Integer totalNum;

    private Integer leftNum;

    private Integer status;

    private Date createTime;

    private Date updateTime;

    private static final long serialVersionUID = 1L;
}
