import {
  ApiOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import {
  Alert,
  Button,
  Checkbox,
  Divider,
  Form,
  Input,
  message,
  Modal,
} from 'antd';
import React, { useState } from 'react';
import {
  getLoginUserUsingGET,
  resetPasswordNoCodeUsingPOST,
  userLoginUsingPOST,
  userRegisterUsingPOST,
} from '@/services/api-backend/userController';

/* ─── 校验规则 ─── */
const accountRules = [
  { required: true, message: '请输入账号' },
  { min: 2, max: 16, message: '账号长度 2-16 位' },
];
const pwdPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,16}$/;
const passwordRules = [
  { required: true, message: '请输入密码' },
  { pattern: pwdPattern, message: '密码为字母+数字组合，6-16 位' },
];

/* ─── 注册弹窗 ─── */
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserOutlined style={{ color: '#667eea' }} />
          <span>创建新账号</span>
        </div>
      }
      open={open}
      footer={null}
      onCancel={() => { form.resetFields(); onClose(); }}
      width={420}
      centered
    >
      <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 8 }}>
        <Form.Item name="userAccount" label="账号" rules={accountRules}>
          <Input
            prefix={<UserOutlined style={{ color: '#c0c4d6' }} />}
            placeholder="请输入账号（2-16位）"
            size="large"
            style={{ borderRadius: 8 }}
          />
        </Form.Item>
        <Form.Item name="userPassword" label="密码" rules={passwordRules}>
          <Input.Password
            prefix={<LockOutlined style={{ color: '#c0c4d6' }} />}
            placeholder="字母+数字组合，6-16位"
            size="large"
            style={{ borderRadius: 8 }}
          />
        </Form.Item>
        <Form.Item
          name="checkPassword"
          label="确认密码"
          rules={[{ required: true, message: '请再次输入密码' }]}
        >
          <Input.Password
            prefix={<SafetyCertificateOutlined style={{ color: '#c0c4d6' }} />}
            placeholder="请再次输入密码"
            size="large"
            style={{ borderRadius: 8 }}
          />
        </Form.Item>
        <Alert
          type="info"
          showIcon
          message="密码须包含字母和数字，长度 6-16 位"
          style={{ marginBottom: 16, borderRadius: 8, fontSize: 12 }}
        />
        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
            style={{
              borderRadius: 8,
              height: 44,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            立即注册
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

/* ─── 忘记密码弹窗 ─── */
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SafetyCertificateOutlined style={{ color: '#667eea' }} />
          <span>重置密码</span>
        </div>
      }
      open={open}
      footer={null}
      onCancel={handleClose}
      width={420}
      centered
    >
      <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 8 }}>
        <Form.Item name="userAccount" label="账号" rules={accountRules}>
          <Input
            prefix={<UserOutlined style={{ color: '#c0c4d6' }} />}
            placeholder="请输入注册时的账号"
            size="large"
            style={{ borderRadius: 8 }}
          />
        </Form.Item>
        <Form.Item name="newPassword" label="新密码" rules={passwordRules}>
          <Input.Password
            prefix={<LockOutlined style={{ color: '#c0c4d6' }} />}
            placeholder="字母+数字，6-16位"
            size="large"
            style={{ borderRadius: 8 }}
          />
        </Form.Item>
        <Form.Item
          name="checkPassword"
          label="确认新密码"
          rules={[{ required: true, message: '请再次输入新密码' }]}
        >
          <Input.Password
            prefix={<SafetyCertificateOutlined style={{ color: '#c0c4d6' }} />}
            placeholder="请再次输入新密码"
            size="large"
            style={{ borderRadius: 8 }}
          />
        </Form.Item>
        <Alert
          type="info"
          showIcon
          message="密码须包含字母和数字，长度 6-16 位"
          style={{ marginBottom: 16, borderRadius: 8, fontSize: 12 }}
        />
        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
            style={{
              borderRadius: 8,
              height: 44,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            重置密码
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

/* ─── 主登录页 ─── */
const Login: React.FC = () => {
  const [form] = Form.useForm();
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string>('');
  const [registerVisible, setRegisterVisible] = useState(false);
  const [forgotVisible, setForgotVisible] = useState(false);
  const { setInitialState } = useModel('@@initialState');

  const handleLogin = async (values: any) => {
    const { userAccount, userPassword } = values;
    if (!userAccount || userAccount.length < 2 || userAccount.length > 16) {
      setLoginError('账号长度应为 2-16 位');
      return;
    }
    if (!userPassword || !pwdPattern.test(userPassword)) {
      setLoginError('密码需为字母和数字组合，6-16 位');
      return;
    }
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await userLoginUsingPOST({ userAccount, userPassword });
      if (res?.data) {
        // 基于 session 再确认一次，避免仅登录接口成功但会话未建立导致后续“未登录”
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      {/* 背景装饰圆 */}
      <div style={{
        position: 'fixed', top: '-80px', right: '-80px',
        width: 300, height: 300, borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '-100px', left: '-100px',
        width: 400, height: 400, borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)', pointerEvents: 'none',
      }} />

      {/* 卡片 */}
      <div style={{
        width: '100%', maxWidth: 420,
        background: '#fff',
        borderRadius: 20,
        padding: '40px 36px 32px',
        boxShadow: '0 20px 60px rgba(102,126,234,0.35)',
        position: 'relative',
      }}>
        {/* Logo 区域 */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
            boxShadow: '0 8px 24px rgba(102,126,234,0.4)',
          }}>
            <ApiOutlined style={{ fontSize: 32, color: '#fff' }} />
          </div>
          <h1 style={{
            fontSize: 24, fontWeight: 700, color: '#1a1a2e',
            margin: 0, letterSpacing: 1,
          }}>
            SUAPI 开放平台
          </h1>
          <p style={{ color: '#8891a5', marginTop: 6, marginBottom: 0, fontSize: 14 }}>
            海量 API，即开即用
          </p>
        </div>

        {/* 错误提示 */}
        {loginError && (
          <Alert
            message={loginError}
            type="error"
            showIcon
            closable
            onClose={() => setLoginError('')}
            style={{ marginBottom: 16, borderRadius: 8 }}
          />
        )}

        {/* 登录表单 */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleLogin}
          initialValues={{ remember: true }}
        >
          <Form.Item name="userAccount" rules={accountRules} style={{ marginBottom: 14 }}>
            <Input
              prefix={<UserOutlined style={{ color: '#c0c4d6' }} />}
              placeholder="请输入账号（2-16位）"
              size="large"
              style={{ borderRadius: 10, height: 46 }}
            />
          </Form.Item>
          <Form.Item
            name="userPassword"
            rules={[{ required: true, message: '请输入密码' }]}
            style={{ marginBottom: 12 }}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#c0c4d6' }} />}
              placeholder="请输入密码"
              size="large"
              style={{ borderRadius: 10, height: 46 }}
            />
          </Form.Item>

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 20,
          }}>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox style={{ color: '#6b6f83', fontSize: 13 }}>记住我</Checkbox>
            </Form.Item>
            <a
              onClick={() => setForgotVisible(true)}
              style={{ fontSize: 13, color: '#667eea' }}
            >
              忘记密码？
            </a>
          </div>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loginLoading}
              block
              style={{
                borderRadius: 10,
                height: 48,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                fontWeight: 700,
                fontSize: 16,
                letterSpacing: 2,
                boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
              }}
            >
              登 录
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ color: '#bfc3d0', borderColor: '#eef0f6', fontSize: 13 }}>
          还没有账号？
        </Divider>

        <Button
          block
          size="large"
          onClick={() => setRegisterVisible(true)}
          style={{
            borderRadius: 10,
            height: 46,
            border: '1.5px solid #667eea',
            color: '#667eea',
            fontWeight: 600,
            fontSize: 15,
            background: 'transparent',
            boxShadow: 'none',
          }}
        >
          立即注册
        </Button>
      </div>

      {/* 页脚 */}
      <div style={{
        marginTop: 24, color: 'rgba(255,255,255,0.6)',
        fontSize: 13, textAlign: 'center',
      }}>
        © {new Date().getFullYear()} SUAPI · All rights reserved
      </div>

      <RegisterModal open={registerVisible} onClose={() => setRegisterVisible(false)} />
      <ForgotModal open={forgotVisible} onClose={() => setForgotVisible(false)} />
    </div>
  );
};

export default Login;
