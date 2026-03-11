import CreateModal from '@/pages/Admin/InterfaceInfo/components/CreateModal';
import UpdateModal from '@/pages/Admin/InterfaceInfo/components/UpdateModal';
import {
  addInterfaceInfoUsingPOST,
  deleteInterfaceInfoUsingPOST,
  listInterfaceInfoByPageUsingGET,
  offlineInterfaceInfoUsingPOST,
  onlineInterfaceInfoUsingPOST,
  updateInterfaceInfoUsingPOST,
} from '@/services/api-backend/interfaceInfoController';
import {
  ApiOutlined,
  DeleteOutlined,
  EditOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, ProDescriptions, ProTable } from '@ant-design/pro-components';
import '@umijs/max';
import { Button, Drawer, message, Popconfirm, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import styles from '../adminTheme.less';

const TableList: React.FC = () => {
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.InterfaceInfo>();
  const [selectedRowsState, setSelectedRows] = useState<API.InterfaceInfo[]>([]);

  const handleAdd = async (fields: API.InterfaceInfo) => {
    const hide = message.loading('正在添加');
    try {
      await addInterfaceInfoUsingPOST({
        ...fields,
      });
      hide();
      message.success('创建成功');
      handleModalVisible(false);
      return true;
    } catch (error: any) {
      hide();
      message.error('创建失败，' + error.message);
      return false;
    }
  };

  const handleUpdate = async (fields: API.InterfaceInfo) => {
    if (!currentRow) {
      return false;
    }
    const hide = message.loading('修改中');
    try {
      await updateInterfaceInfoUsingPOST({
        id: currentRow.id,
        ...fields,
      });
      hide();
      message.success('操作成功');
      return true;
    } catch (error: any) {
      hide();
      message.error('操作失败，' + error.message);
      return false;
    }
  };

  const handleOnline = async (record: API.IdRequest) => {
    const hide = message.loading('发布中');
    if (!record) return true;
    try {
      await onlineInterfaceInfoUsingPOST({
        id: record.id,
      });
      hide();
      message.success('操作成功');
      actionRef.current?.reload();
      return true;
    } catch (error: any) {
      hide();
      message.error('操作失败，' + error.message);
      return false;
    }
  };

  const handleOffline = async (record: API.IdRequest) => {
    const hide = message.loading('发布中');
    if (!record) return true;
    try {
      await offlineInterfaceInfoUsingPOST({
        id: record.id,
      });
      hide();
      message.success('操作成功');
      actionRef.current?.reload();
      return true;
    } catch (error: any) {
      hide();
      message.error('操作失败，' + error.message);
      return false;
    }
  };

  const handleRemove = async (record: API.InterfaceInfo | API.InterfaceInfo[]) => {
    const list = Array.isArray(record) ? record : [record];
    if (!list.length) return true;

    const hide = message.loading(list.length > 1 ? '批量删除中' : '正在删除');
    try {
      await Promise.all(
        list
          .map((item) => item?.id)
          .filter((id): id is number => typeof id === 'number')
          .map((id) => deleteInterfaceInfoUsingPOST({ id })),
      );
      hide();
      message.success(list.length > 1 ? `已删除 ${list.length} 项` : '删除成功');
      actionRef.current?.reload();
      return true;
    } catch (error: any) {
      hide();
      message.error('删除失败，' + error.message);
      return false;
    }
  };

  const columns: ProColumns<API.InterfaceInfo>[] = [
    {
      title: '接口名称',
      dataIndex: 'name',
      valueType: 'text',
      width: 180,
      ellipsis: true,
      copyable: true,
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      valueType: 'textarea',
      width: 230,
      ellipsis: true,
    },
    {
      title: '请求方法',
      dataIndex: 'method',
      valueType: 'text',
      width: 120,
      render: (_, record) => {
        const method = (record.method || 'GET').toUpperCase();
        const methodClass =
          method === 'POST'
            ? styles.methodPost
            : method === 'PUT'
            ? styles.methodPut
            : method === 'DELETE'
            ? styles.methodDelete
            : styles.methodGet;
        return <Tag className={`${styles.methodTag} ${methodClass}`}>{method}</Tag>;
      },
    },
    {
      title: 'url',
      dataIndex: 'url',
      valueType: 'text',
      width: 300,
      ellipsis: true,
      copyable: true,
    },
    {
      title: '请求参数',
      dataIndex: 'requestParams',
      valueType: 'jsonCode',
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: '请求头',
      dataIndex: 'requestHeader',
      valueType: 'jsonCode',
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: '响应头',
      dataIndex: 'responseHeader',
      valueType: 'jsonCode',
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      hideInForm: true,
      width: 110,
      valueEnum: {
        0: {
          text: '关闭',
          status: 'Default',
        },
        1: {
          text: '开启',
          status: 'Processing',
        },
      },
      render: (_, record) => {
        const enabled = record.status === 1;
        return (
          <Tag className={`${styles.statusTag} ${enabled ? styles.statusOn : styles.statusOff}`}>
            {enabled ? '开启' : '关闭'}
          </Tag>
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      width: 208,
      render: (_, record) => (
        <div className={styles.operationWrap}>
          <Button
            size="small"
            icon={<EditOutlined />}
            className={`${styles.actionBtn} ${styles.actionEdit}`}
            onClick={() => {
              handleUpdateModalVisible(true);
              setCurrentRow(record);
            }}
          >
            编辑
          </Button>
          {record.status === 0 ? (
            <Button
              size="small"
              icon={<PlayCircleOutlined />}
              className={`${styles.actionBtn} ${styles.actionOnline}`}
              onClick={() => {
                handleOnline(record);
              }}
            >
              发布
            </Button>
          ) : (
            <Button
              size="small"
              icon={<PauseCircleOutlined />}
              className={`${styles.actionBtn} ${styles.actionOffline}`}
              onClick={() => {
                handleOffline(record);
              }}
            >
              下线
            </Button>
          )}
          <Popconfirm
            title="确认删除该接口？"
            okText="删除"
            cancelText="取消"
            onConfirm={() => handleRemove(record)}
          >
            <Button
              size="small"
              icon={<DeleteOutlined />}
              className={`${styles.actionBtn} ${styles.actionDelete}`}
            >
              删除
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.adminWorkspace}>
      <div className={styles.heroPanel}>
        <div className={styles.heroRow}>
          <div className={styles.heroMain}>
            <div className={styles.heroIcon}>
              <ApiOutlined style={{ fontSize: 24 }} />
            </div>
            <div>
              <h1 className={styles.heroTitle}>接口管理</h1>
              <p className={styles.heroSubtitle}>统一维护接口配置、发布状态与服务可用性</p>
            </div>
          </div>
          <div className={styles.metricRow}>
            <div className={styles.metricPill}>已选 {selectedRowsState.length} 项</div>
          </div>
        </div>
      </div>

      <div className={`${styles.surfaceCard} ${styles.tableWrap}`}>
        <ProTable<API.InterfaceInfo, API.PageParams>
          headerTitle="接口列表"
          actionRef={actionRef}
          rowKey="id"
          scroll={{ x: 1320 }}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
          }}
          search={{
            labelWidth: 110,
          }}
          toolBarRender={() => [
            <Button
              type="primary"
              key="primary"
              onClick={() => {
                handleModalVisible(true);
              }}
            >
              <PlusOutlined /> 新建接口
            </Button>,
          ]}
          request={async (params) => {
            const res: any = await listInterfaceInfoByPageUsingGET({
              ...params,
            });
            if (res?.data) {
              return {
                data: res?.data.records || [],
                success: true,
                total: res?.data.total || 0,
              };
            }
            return {
              data: [],
              success: false,
              total: 0,
            };
          }}
          columns={columns}
          rowSelection={{
            onChange: (_, selectedRows) => {
              setSelectedRows(selectedRows);
            },
          }}
        />
      </div>

      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择{' '}
              <a
                style={{
                  fontWeight: 600,
                }}
              >
                {selectedRowsState.length}
              </a>{' '}
              项
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            批量删除
          </Button>
          <Button type="primary">批量审批</Button>
        </FooterToolbar>
      )}

      <UpdateModal
        columns={columns}
        onSubmit={async (value) => {
          const success = await handleUpdate(value);
          if (success) {
            handleUpdateModalVisible(false);
            setCurrentRow(undefined);
            actionRef.current?.reload();
          }
        }}
        onCancel={() => {
          handleUpdateModalVisible(false);
          if (!showDetail) {
            setCurrentRow(undefined);
          }
        }}
        visible={updateModalVisible}
        values={currentRow || {}}
      />

      <Drawer
        width={600}
        visible={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.name && (
          <ProDescriptions<API.InterfaceInfo>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<API.InterfaceInfo>[]}
          />
        )}
      </Drawer>

      <CreateModal
        columns={columns}
        onCancel={() => {
          handleModalVisible(false);
        }}
        onSubmit={(values) => {
          handleAdd(values);
        }}
        visible={createModalVisible}
      />
    </div>
  );
};

export default TableList;
