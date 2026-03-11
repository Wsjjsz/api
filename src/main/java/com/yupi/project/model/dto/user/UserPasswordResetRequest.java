package com.yupi.project.model.dto.user;

import lombok.Data;

import java.io.Serializable;

/**
 * 忘记密码 - 请求重置（预留，当前仅做账号存在性校验）
 */
@Data
public class UserPasswordResetRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 用户账号
     */
    private String userAccount;
}

