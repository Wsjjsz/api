package com.yupi.project.model.dto.user;

import lombok.Data;

import java.io.Serializable;

/**
 * 忘记密码 - 无验证码直接重置密码
 */
@Data
public class UserPasswordResetNoCodeRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 用户账号
     */
    private String userAccount;

    /**
     * 新密码
     */
    private String newPassword;

    /**
     * 确认密码
     */
    private String checkPassword;
}

