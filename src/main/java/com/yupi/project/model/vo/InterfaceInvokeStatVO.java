package com.yupi.project.model.vo;

import lombok.Data;

import java.io.Serializable;

/**
 * 当前登录用户在某接口下的调用统计
 */
@Data
public class InterfaceInvokeStatVO implements Serializable {

    /**
     * 用户 id
     */
    private Long userId;

    /**
     * 用户昵称
     */
    private String userName;

    /**
     * 用户账号
     */
    private String userAccount;

    /**
     * 接口 id
     */
    private Long interfaceInfoId;

    /**
     * 我的总调用次数
     */
    private Integer totalNum;

    /**
     * 剩余调用次数
     */
    private Integer leftNum;

    /**
     * 0-正常，1-禁用
     */
    private Integer status;

    /**
     * 接口全局总调用次数（仅管理员可见）
     */
    private Integer interfaceTotalNum;

    private static final long serialVersionUID = 1L;
}
