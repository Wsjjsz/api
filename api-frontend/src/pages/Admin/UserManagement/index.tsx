import {
  listUserInterfaceInfoManageByPageUsingGET,
  updateUserInterfaceInfoUsingPOST,
} from '@/services/api-backend/userInterfaceInfoController';
import { EditOutlined, TeamOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import '@umijs/max';
import { Button, Form, InputNumber, Modal, message } from 'antd';
import React, { useRef, useState } from 'react';
import styles from '../adminTheme.less';

type UserInterfaceInfoManageRecord = {
  id?: number;
  userId?: number;
  userName?: string;
  interfaceInfoId?: number;
  interfaceName?: string;
  totalNum?: number;
  leftNum?: number;
  status?: number;
  createTime?: string;
  updateTime?: string;
};

const UserManagement: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [totalCount, setTotalCount] = useState<number>(0);
  const [selectedCount, setSelectedCount] = useState<number>(0);
  const [editVisible, setEditVisible] = useState<boolean>(false);
  const [editLoading, setEditLoading] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<UserInterfaceInfoManageRecord>();
  const [form] = Form.useForm();

  const columns: ProColumns<UserInterfaceInfoManageRecord>[] = [
    {
      title: '用户名',
      dataIndex: 'userName',
      valueType: 'text',
      width: 180,
    },
    {
      title: '接口名',
      dataIndex: 'interfaceName',
      valueType: 'text',
      width: 260,
      ellipsis: true,
    },
    {
      title: '总调用',
      dataIndex: 'totalNum',
      valueType: 'digit',
      width: 120,
      search: false,
    },
    {
      title: '剩余调用',
      dataIndex: 'leftNum',
      valueType: 'digit',
      width: 120,
      search: false,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 120,
      fixed: 'right',
      search: false,
      render: (_, record) => {
        return (
          <Button
            size="small"
            icon={<EditOutlined />}
            className={`${styles.actionBtn} ${styles.actionEdit}`}
            onClick={() => {
              setCurrentRow(record);
              form.setFieldsValue({
                leftNum: record.leftNum ?? 0,
              });
              setEditVisible(true);
            }}
          >
            修改剩余
          </Button>
        );
      },
    },
  ];

  const handleUpdateLeftNum = async (values: { leftNum: number }) => {
    if (!currentRow?.id) {
      message.error('未选中记录');
      return;
    }
    setEditLoading(true);
    try {
      await updateUserInterfaceInfoUsingPOST({
        id: currentRow.id,
        leftNum: values.leftNum,
      });
      message.success('剩余次数已更新');
      setEditVisible(false);
      actionRef.current?.reload();
    } catch (error: any) {
      message.error(error?.message || '更新失败');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className={styles.adminWorkspace}>
      <div className={styles.heroPanel}>
        <div className={styles.heroRow}>
          <div className={styles.heroMain}>
            <div className={styles.heroIcon}>
              <TeamOutlined style={{ fontSize: 24 }} />
            </div>
            <div>
              <h1 className={styles.heroTitle}>用户管理</h1>
              <p className={styles.heroSubtitle}>先展示用户接口信息表，支持按用户和接口快速检索</p>
            </div>
          </div>
          <div className={styles.metricRow}>
            <div className={styles.metricPill}>总记录 {totalCount}</div>
            <div className={styles.metricPill}>已选 {selectedCount} 项</div>
          </div>
        </div>
      </div>

      <div className={`${styles.surfaceCard} ${styles.tableWrap}`}>
        <ProTable<UserInterfaceInfoManageRecord, API.PageParams>
          actionRef={actionRef}
          rowKey="id"
          headerTitle="用户接口信息表"
          scroll={{ x: 860 }}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
          }}
          search={{
            labelWidth: 100,
          }}
          request={async (params) => {
            try {
              const res: any = await listUserInterfaceInfoManageByPageUsingGET({
                ...params,
              });
              const records = res?.data?.records || [];
              const total = Number(res?.data?.total || 0);
              setTotalCount(total);
              return {
                data: records,
                success: true,
                total,
              };
            } catch (error: any) {
              message.error(error?.message || '加载用户接口信息失败');
              return {
                data: [],
                success: false,
                total: 0,
              };
            }
          }}
          columns={columns}
          rowSelection={{
            onChange: (_, selectedRows) => {
              setSelectedCount(selectedRows.length);
            },
          }}
        />
      </div>

      <Modal
        visible={editVisible}
        title="修改剩余次数"
        okText="保存"
        cancelText="取消"
        centered
        confirmLoading={editLoading}
        onCancel={() => setEditVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateLeftNum}>
          <Form.Item label="用户名">
            <div>{currentRow?.userName || '-'}</div>
          </Form.Item>
          <Form.Item label="接口名">
            <div>{currentRow?.interfaceName || '-'}</div>
          </Form.Item>
          <Form.Item
            label="剩余次数"
            name="leftNum"
            rules={[
              { required: true, message: '请输入剩余次数' },
              { type: 'number', min: 0, message: '剩余次数不能小于 0' },
            ]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
