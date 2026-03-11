import {
  getLoginUserUsingGET,
  updateUserUsingPOST,
  userLogoutUsingPOST,
} from '@/services/api-backend/userController';
import {
  CloseOutlined,
  DownOutlined,
  EditOutlined,
  LogoutOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { Avatar, Button, Descriptions, Form, Input, message, Select, Spin, Tag } from 'antd';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import styles from './index.less';

export type GlobalHeaderRightProps = {
  menu?: boolean;
};

const AvatarDropdown: React.FC<GlobalHeaderRightProps> = () => {
  /**
   * 退出登录，并且将当前的 url 保存
   */
  const { initialState, setInitialState } = useModel('@@initialState');
  const [profileOpen, setProfileOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const loading = (
    <span className={`${styles.action} ${styles.account}`}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  if (!initialState) {
    return loading;
  }

  const { loginUser } = initialState;

  if (!loginUser || !loginUser.userAccount) {
    return loading;
  }

  const formatDateTime = (time: any) => {
    if (!time) {
      return '未记录';
    }
    const date = time instanceof Date ? time : new Date(time);
    if (Number.isNaN(date.getTime())) {
      return String(time);
    }
    return date.toLocaleString('zh-CN', { hour12: false });
  };

  const role = (loginUser as any)?.userRole;
  const roleInfo =
    role === 'admin' ? { text: '管理员', key: 'admin' } : { text: '用户', key: 'user' };
  const gender = (loginUser as any)?.gender;
  const genderText = gender === 0 ? '男' : gender === 1 ? '女' : '未设置';

  const resetFormByUser = () => {
    form.setFieldsValue({
      userName: loginUser.userName || '',
      gender: gender === 0 || gender === 1 ? gender : undefined,
      userAvatar: loginUser.userAvatar || '',
    });
  };

  const handleOpenProfile = () => {
    resetFormByUser();
    setEditMode(false);
    setProfileOpen(true);
  };

  const handleLogout = async () => {
    try {
      await userLogoutUsingPOST();
    } catch (_) {}
    flushSync(() => {
      setInitialState((s) => ({ ...s, loginUser: undefined }));
    });
    message.success('已退出登录');
    history.push('/user/login');
  };

  const handleClosePanel = () => {
    setProfileOpen(false);
    setEditMode(false);
  };

  const handleCancelEdit = () => {
    resetFormByUser();
    setEditMode(false);
  };

  const handleSaveProfile = async () => {
    const userId = (loginUser as any)?.id;
    if (!userId) {
      message.error('用户信息缺失，无法保存');
      return;
    }
    try {
      const values = await form.validateFields();
      setSaving(true);
      const updateRes = await updateUserUsingPOST({
        id: userId,
        userName: values.userName?.trim(),
        gender: values.gender,
        userAvatar: values.userAvatar?.trim(),
      } as any);
      if (!updateRes?.data) {
        throw new Error(updateRes?.message || '更新失败');
      }
      const latestLoginUser = await getLoginUserUsingGET();
      if (latestLoginUser?.data) {
        flushSync(() => {
          setInitialState((s) => ({ ...s, loginUser: latestLoginUser.data }));
        });
      }
      message.success('个人信息已更新');
      setEditMode(false);
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      message.error(error?.message || '保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className={styles.accountActions}>
        <span
          className={`${styles.action} ${styles.account} ${styles.accountTrigger}`}
          onClick={handleOpenProfile}
        >
          <Avatar size="small" className={styles.avatar} src={loginUser.userAvatar} alt="avatar" />
          <span className={`${styles.name} anticon`}>
            {loginUser.userName || loginUser.userAccount}
          </span>
          <Tag
            className={`${styles.roleTag} ${
              roleInfo.key === 'admin' ? styles.roleAdmin : styles.roleUser
            }`}
          >
            {roleInfo.text}
          </Tag>
          <DownOutlined className={styles.dropdownArrow} />
        </span>
        <Button
          type="text"
          icon={<LogoutOutlined />}
          className={`${styles.action} ${styles.topLogoutButton}`}
          onClick={handleLogout}
        >
          退出登录
        </Button>
      </div>
      {profileOpen ? (
        <>
          <div className={styles.profilePanelMask} onClick={handleClosePanel} />
          <div className={styles.profilePanel}>
            <div className={styles.profilePanelHeader}>
              <div className={styles.profilePanelTitle}>个人信息</div>
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={handleClosePanel}
                className={styles.panelCloseButton}
              />
            </div>
            <div className={styles.profileHero}>
              <Avatar size={64} className={styles.profileHeroAvatar} src={loginUser.userAvatar} />
              <div className={styles.profileName}>{loginUser.userName || '未设置昵称'}</div>
              <div className={styles.profileAccount}>@{loginUser.userAccount}</div>
              <Tag
                className={`${styles.roleTag} ${styles.profileRoleTag} ${
                  roleInfo.key === 'admin' ? styles.roleAdmin : styles.roleUser
                }`}
              >
                {roleInfo.text}
              </Tag>
            </div>
            <div className={styles.profileBody}>
              {!editMode ? (
                <div className={styles.infoCard}>
                  <div className={styles.infoTitle}>资料详情</div>
                  <Descriptions
                    column={1}
                    size="small"
                    labelStyle={{ width: 88, color: '#7b8298' }}
                    contentStyle={{ color: '#1f2437', fontWeight: 500 }}
                  >
                    <Descriptions.Item label="账号">
                      {loginUser.userAccount || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="昵称">
                      {loginUser.userName || '未设置'}
                    </Descriptions.Item>
                    <Descriptions.Item label="性别">{genderText}</Descriptions.Item>
                    <Descriptions.Item label="角色">{roleInfo.text}</Descriptions.Item>
                    <Descriptions.Item label="创建时间">
                      {formatDateTime((loginUser as any)?.createTime)}
                    </Descriptions.Item>
                  </Descriptions>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    block
                    className={styles.profileActionButton}
                    onClick={() => {
                      resetFormByUser();
                      setEditMode(true);
                    }}
                  >
                    编辑资料
                  </Button>
                </div>
              ) : (
                <div className={styles.infoCard}>
                  <div className={styles.infoTitle}>编辑资料</div>
                  <Form form={form} layout="vertical">
                    <Form.Item
                      label="昵称"
                      name="userName"
                      rules={[
                        { required: true, message: '请输入昵称' },
                        { max: 20, message: '昵称最多 20 个字符' },
                      ]}
                    >
                      <Input placeholder="请输入昵称" />
                    </Form.Item>
                    <Form.Item label="性别" name="gender">
                      <Select
                        allowClear
                        placeholder="请选择性别"
                        options={[
                          { label: '男', value: 0 },
                          { label: '女', value: 1 },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item
                      label="头像链接"
                      name="userAvatar"
                      rules={[
                        { type: 'url', warningOnly: true, message: '请输入合法 URL（可留空）' },
                      ]}
                    >
                      <Input placeholder="https://example.com/avatar.png" />
                    </Form.Item>
                    <div className={styles.profileActionRow}>
                      <Button onClick={handleCancelEdit}>取消</Button>
                      <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        loading={saving}
                        onClick={handleSaveProfile}
                      >
                        保存
                      </Button>
                    </div>
                  </Form>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};

export default AvatarDropdown;
