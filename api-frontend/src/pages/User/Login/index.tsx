import {
  getLoginUserUsingGET,
  resetPasswordNoCodeUsingPOST,
  userLoginUsingPOST,
  userRegisterUsingPOST,
} from '@/services/api-backend/userController';
import {
  ApiOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { Alert, Button, Checkbox, Divider, Form, Input, message, Modal } from 'antd';
import React, { useState } from 'react';
import styles from './index.less';

const accountPattern = /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};:,.?/|]{6,16}$/;
const accountRules = [
  { required: true, message: '请输入账号' },
  { pattern: accountPattern, message: '账号需 6-16 位，可包含字母、数字、特殊字符' },
];

const pwdPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;

const passwordRules = [
  { required: true, message: '请输入密码' },
  { pattern: pwdPattern, message: '密码需 8-16 位，且包含字母和数字' },
];

const RegisterModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (vals: any) => {
    const { userAccount, userPassword, checkPassword } = vals;
    if (userPassword !== checkPassword) {
      form.setFields([{ name: 'checkPassword', errors: ['两次密码不一致'] }]);
      return;
    }
    setLoading(true);
    try {
      const res = await userRegisterUsingPOST({ userAccount, userPassword, checkPassword });
      if (res?.data) {
        message.success('注册成功，请登录！');
        form.resetFields();
        onClose();
      } else {
        message.error('注册失败，账号可能已存在');
      }
    } catch (e: any) {
      message.error('注册失败：' + (e.message || '请稍后重试'));
    }
    setLoading(false);
  };

  return (
    <Modal
      title={
        <div className={styles.modalTitle}>
          <UserOutlined style={{ color: '#4468ff' }} />
          <span>创建新账号</span>
        </div>
      }
      open={open}
      footer={null}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      width={420}
      centered
      wrapClassName={styles.modalOverlay}
    >
      <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 8 }}>
        <Form.Item name="userAccount" label="账号" rules={accountRules}>
          <Input
            prefix={<UserOutlined style={{ color: '#a9b0c6' }} />}
            placeholder="6-16位，字母/数字/特殊字符"
            size="large"
          />
        </Form.Item>
        <Form.Item name="userPassword" label="密码" rules={passwordRules}>
          <Input.Password
            prefix={<LockOutlined style={{ color: '#a9b0c6' }} />}
            placeholder="8-16位，需包含字母和数字"
            size="large"
          />
        </Form.Item>
        <Form.Item
          name="checkPassword"
          label="确认密码"
          rules={[
            { required: true, message: '请再次输入密码' },
            { pattern: pwdPattern, message: '密码需 8-16 位，且包含字母和数字' },
          ]}
        >
          <Input.Password
            prefix={<SafetyCertificateOutlined style={{ color: '#a9b0c6' }} />}
            placeholder="请再次输入 8-16 位密码"
            size="large"
          />
        </Form.Item>
        <Alert
          type="info"
          showIcon
          message="账号：6-16位，可含字母/数字/特殊字符；密码：8-16位，需含字母和数字"
          style={{ marginBottom: 16, fontSize: 12 }}
        />
        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
            className={styles.modalSubmitButton}
          >
            立即注册
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

const ForgotModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const onFinish = async (vals: any) => {
    const { userAccount, newPassword, checkPassword } = vals;
    if (newPassword !== checkPassword) {
      form.setFields([{ name: 'checkPassword', errors: ['两次密码不一致'] }]);
      return;
    }
    setLoading(true);
    try {
      const res = await resetPasswordNoCodeUsingPOST({ userAccount, newPassword, checkPassword });
      if (res?.data) {
        message.success('密码重置成功，请用新密码登录');
        form.resetFields();
        onClose();
      } else {
        message.error('重置失败，账号不存在');
      }
    } catch (e: any) {
      message.error('重置失败：' + (e.message || '请稍后重试'));
    }
    setLoading(false);
  };

  return (
    <Modal
      title={
        <div className={styles.modalTitle}>
          <SafetyCertificateOutlined style={{ color: '#4468ff' }} />
          <span>重置密码</span>
        </div>
      }
      open={open}
      footer={null}
      onCancel={handleClose}
      width={420}
      centered
      wrapClassName={styles.modalOverlay}
    >
      <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 8 }}>
        <Form.Item name="userAccount" label="账号" rules={accountRules}>
          <Input
            prefix={<UserOutlined style={{ color: '#a9b0c6' }} />}
            placeholder="账号：6-16位，字母/数字/特殊字符"
            size="large"
          />
        </Form.Item>
        <Form.Item name="newPassword" label="新密码" rules={passwordRules}>
          <Input.Password
            prefix={<LockOutlined style={{ color: '#a9b0c6' }} />}
            placeholder="8-16位，需包含字母和数字"
            size="large"
          />
        </Form.Item>
        <Form.Item
          name="checkPassword"
          label="确认新密码"
          rules={[
            { required: true, message: '请再次输入新密码' },
            { pattern: pwdPattern, message: '密码需 8-16 位，且包含字母和数字' },
          ]}
        >
          <Input.Password
            prefix={<SafetyCertificateOutlined style={{ color: '#a9b0c6' }} />}
            placeholder="请再次输入 8-16 位密码"
            size="large"
          />
        </Form.Item>
        <Alert
          type="info"
          showIcon
          message="账号：6-16位，可含字母/数字/特殊字符；密码：8-16位，需含字母和数字"
          style={{ marginBottom: 16, fontSize: 12 }}
        />
        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
            className={styles.modalSubmitButton}
          >
            重置密码
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string>('');
  const [registerVisible, setRegisterVisible] = useState(false);
  const [forgotVisible, setForgotVisible] = useState(false);
  const { setInitialState } = useModel('@@initialState');

  const handleLogin = async (values: any) => {
    const { userAccount, userPassword } = values;
    if (!userAccount || !accountPattern.test(userAccount)) {
      setLoginError('账号需 6-16 位，可包含字母、数字、特殊字符');
      return;
    }
    if (!userPassword || !pwdPattern.test(userPassword)) {
      setLoginError('密码需 8-16 位，且包含字母和数字');
      return;
    }
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await userLoginUsingPOST({ userAccount, userPassword });
      if (res?.data) {
        const loginUserRes = await getLoginUserUsingGET();
        if (!loginUserRes?.data) {
          setLoginError('登录态建立失败，请使用同一域名访问（建议 localhost）后重试');
          return;
        }
        await setInitialState((s: any) => ({ ...s, loginUser: loginUserRes.data }));
        const urlParams = new URL(window.location.href).searchParams;
        message.success('登录成功，欢迎回来！');
        history.push(urlParams.get('redirect') || '/');
        return;
      }
      setLoginError('账号或密码错误，请重试');
    } catch (e: any) {
      setLoginError('登录失败，请检查账号密码');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.loginShell}>
        <section className={styles.brandPanel}>
          <div className={styles.brandInner}>
            <div className={styles.brandBadge}>
              <ApiOutlined />
              <span>SUAPI Platform</span>
            </div>
            <h1 className={styles.brandTitle}>更快连接 API</h1>
            <p className={styles.brandSubtitle}>统一管理与调用，让接入更直接。</p>
            <div className={styles.featureList}>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>
                  <ApiOutlined />
                </span>
                接口统一管理
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>
                  <SafetyCertificateOutlined />
                </span>
                安全鉴权调用
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>
                  <LockOutlined />
                </span>
                全链路可追踪
              </div>
            </div>
          </div>
        </section>

        <section className={styles.formPanel}>
          <div className={styles.logoArea}>
            <div className={styles.logoIcon}>
              <div className={styles.creativeLogo}>
                <span className={styles.creativeLogoRing} />
                <span className={styles.creativeLogoCore} />
                <span className={`${styles.creativeLogoNode} ${styles.creativeLogoNodeTop}`} />
                <span className={`${styles.creativeLogoNode} ${styles.creativeLogoNodeRight}`} />
                <span className={`${styles.creativeLogoNode} ${styles.creativeLogoNodeBottom}`} />
              </div>
            </div>
            <h2 className={styles.formTitle}>欢迎登录</h2>
            <p className={styles.formSubtitle}>登录后即可调用接口并管理你的应用</p>
          </div>

          {loginError && (
            <Alert
              message={loginError}
              type="error"
              showIcon
              closable
              onClose={() => setLoginError('')}
              className={styles.errorAlert}
            />
          )}

          <Form
            form={form}
            className={styles.mainForm}
            layout="vertical"
            onFinish={handleLogin}
            initialValues={{ remember: true }}
          >
            <Form.Item name="userAccount" rules={accountRules}>
              <Input
                prefix={<UserOutlined style={{ color: '#a9b0c6' }} />}
                placeholder="账号：6-16位，字母/数字/特殊字符"
                size="large"
              />
            </Form.Item>
            <Form.Item name="userPassword" rules={passwordRules}>
              <Input.Password
                prefix={<LockOutlined style={{ color: '#a9b0c6' }} />}
                placeholder="密码：8-16位，需包含字母和数字"
                size="large"
              />
            </Form.Item>

            <div className={styles.rememberRow}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox className={styles.rememberCheck}>记住我</Checkbox>
              </Form.Item>
              <Button
                type="link"
                className={styles.inlineLinkButton}
                onClick={() => setForgotVisible(true)}
              >
                忘记密码？
              </Button>
            </div>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loginLoading}
                block
                className={styles.submitBtn}
              >
                登 录
              </Button>
            </Form.Item>
          </Form>
          <Divider className={styles.registerDivider}>还没有账号？</Divider>
          <Button
            block
            size="large"
            onClick={() => setRegisterVisible(true)}
            className={styles.ghostBtn}
          >
            立即注册
          </Button>
        </section>
      </div>

      <div className={styles.pageFooter}>
        © {new Date().getFullYear()} SUAPI · All rights reserved
      </div>

      <RegisterModal open={registerVisible} onClose={() => setRegisterVisible(false)} />
      <ForgotModal open={forgotVisible} onClose={() => setForgotVisible(false)} />
    </div>
  );
};

export default Login;
