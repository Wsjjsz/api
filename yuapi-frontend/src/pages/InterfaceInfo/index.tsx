import {
  ApiOutlined,
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CodeOutlined,
  SendOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Link, request, useModel, useParams } from '@umijs/max';
import { Button, Card, Descriptions, Form, Input, message, Spin, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import {
  getInterfaceInfoByIdUsingGET,
  invokeInterfaceInfoUsingPOST,
} from '@/services/suapi-backend/interfaceInfoController';

const methodColor: Record<string, string> = {
  GET: '#52c41a',
  POST: '#1890ff',
  PUT: '#faad14',
  DELETE: '#ff4d4f',
};

const getDefaultValueByType = (type?: string) => {
  const lowerType = (type || '').toLowerCase();
  if (lowerType.includes('int') || lowerType.includes('long') || lowerType.includes('float') || lowerType.includes('double') || lowerType.includes('number')) {
    return 0;
  }
  if (lowerType.includes('bool')) {
    return false;
  }
  if (lowerType.includes('array') || lowerType.includes('list')) {
    return [];
  }
  if (lowerType.includes('object') || lowerType.includes('map') || lowerType.includes('json')) {
    return {};
  }
  return '';
};

const buildInvokeParamsTemplate = (requestParams?: string) => {
  if (!requestParams || !requestParams.trim()) {
    return '{}';
  }
  try {
    const parsed = JSON.parse(requestParams);
    if (Array.isArray(parsed)) {
      const template: Record<string, any> = {};
      parsed.forEach((item: any) => {
        if (item && typeof item === 'object' && item.name) {
          template[item.name] = item.example ?? getDefaultValueByType(item.type);
        }
      });
      return JSON.stringify(template, null, 2);
    }
    if (parsed && typeof parsed === 'object') {
      if (parsed.example !== undefined) {
        return JSON.stringify(parsed.example, null, 2);
      }
      return JSON.stringify(parsed, null, 2);
    }
  } catch (e) {
    // requestParams 不是合法 JSON 时使用空模板兜底
  }
  return '{}';
};

const hasRequestParamDefinition = (requestParams?: string) => {
  if (!requestParams || !requestParams.trim()) {
    return false;
  }
  try {
    const parsed = JSON.parse(requestParams);
    if (Array.isArray(parsed)) {
      return parsed.some((item: any) => item && typeof item === 'object' && item.name);
    }
    if (parsed && typeof parsed === 'object') {
      if (Object.prototype.hasOwnProperty.call(parsed, 'example')) {
        const example = (parsed as any).example;
        if (example == null) {
          return false;
        }
        if (typeof example === 'object') {
          return Array.isArray(example) ? example.length > 0 : Object.keys(example).length > 0;
        }
        return String(example).trim().length > 0;
      }
      return Object.keys(parsed).length > 0;
    }
    return String(parsed).trim().length > 0;
  } catch (e) {
    return true;
  }
};

type InterfaceInvokeStat = {
  userId?: number;
  userName?: string;
  userAccount?: string;
  interfaceInfoId?: number;
  totalNum?: number;
  leftNum?: number;
  status?: number;
  interfaceTotalNum?: number;
};

type BaseResponse<T> = {
  code: number;
  data?: T;
  message?: string;
};

const InterfaceInfoPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<API.InterfaceInfo>();
  const [invokeRes, setInvokeRes] = useState<any>();
  const [invokeLoading, setInvokeLoading] = useState(false);
  const [invokeStat, setInvokeStat] = useState<InterfaceInvokeStat>();
  const [invokeStatLoading, setInvokeStatLoading] = useState(false);
  const params = useParams();
  const { initialState } = useModel('@@initialState');
  const [form] = Form.useForm();
  const isAdmin = initialState?.loginUser?.userRole === 'admin';

  const loadInvokeStat = async (interfaceId: number) => {
    setInvokeStatLoading(true);
    try {
      const res = await request<BaseResponse<InterfaceInvokeStat>>('/api/interfaceInfo/invoke/stat', {
        method: 'GET',
        params: { id: interfaceId },
      });
      setInvokeStat(res?.data);
    } catch (error) {
      setInvokeStat(undefined);
    }
    setInvokeStatLoading(false);
  };

  const loadData = async () => {
    if (!params.id) {
      message.error('参数不存在');
      return;
    }
    setLoading(true);
    try {
      const res = await getInterfaceInfoByIdUsingGET({ id: Number(params.id) });
      const interfaceInfo = res.data;
      setData(interfaceInfo);
      setInvokeRes(undefined);
      const hasRequestParams = hasRequestParamDefinition(interfaceInfo?.requestParams);
      form.setFieldsValue({
        userRequestParams: hasRequestParams ? buildInvokeParamsTemplate(interfaceInfo?.requestParams) : undefined,
      });
      await loadInvokeStat(Number(params.id));
    } catch (error: any) {
      message.error('请求失败：' + error.message);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [params.id]);

  const onFinish = async (values: any) => {
    if (!params.id) { message.error('接口不存在'); return; }
    if (params.id === '999') {
        setInvokeLoading(true);
        try {
            const res = await fetch('/api/interfaceInfo/name/random');
            const text = await res.text();
            setInvokeRes(text);
            message.success('调用成功');
        } catch (error: any) {
            message.error('调用失败：' + error.message);
        }
        setInvokeLoading(false);
        return;
    }
    if (!invokeStat?.userId) {
      message.warning('请先登录后再在线调试');
      return;
    }
    setInvokeLoading(true);
    try {
      const hasRequestParams = hasRequestParamDefinition(data?.requestParams);
      const submitValues = hasRequestParams ? values : { ...values, userRequestParams: undefined };
      const res = await invokeInterfaceInfoUsingPOST({ id: params.id, ...submitValues });
      const result = res?.data;
      if (result === undefined || result === null || (typeof result === 'string' && result.trim() === '')) {
        setInvokeRes('[EMPTY_RESPONSE]');
      } else {
        setInvokeRes(result);
      }
      await loadInvokeStat(Number(params.id));
      message.success('调用成功');
    } catch (error: any) {
      if (error?.message?.includes('未登录')) {
        setInvokeStat(undefined);
        message.warning('请先登录后再在线调试');
      } else {
        message.error('调用失败：' + error.message);
      }
    }
    setInvokeLoading(false);
  };

  const method = data?.method?.toUpperCase() || 'GET';
  const statusColor = data?.status ? '#52c41a' : '#aaa';
  const hasRequestParams = hasRequestParamDefinition(data?.requestParams);

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f8' }}>
      {/* Hero 头部 */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px 24px 56px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -50, right: -50, width: 200, height: 200,
          borderRadius: '50%', background: 'rgba(255,255,255,0.07)',
        }} />
        <div style={{
          position: 'absolute', bottom: -30, left: -30, width: 140, height: 140,
          borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
        }} />

        {/* 返回按钮 */}
        <Link to="/">
          <Button
            icon={<ArrowLeftOutlined />}
            size="small"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              borderRadius: 20,
              marginBottom: 24,
            }}
          >
            返回首页
          </Button>
        </Link>

        {/* 标题区 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'rgba(255,255,255,0.15)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <ApiOutlined style={{ fontSize: 28, color: '#fff' }} />
          </div>
          <div>
            <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 800, margin: 0 }}>
              {loading ? '加载中…' : (data?.name || '接口详情')}
            </h1>
            <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Tag style={{
                background: methodColor[method] || '#1890ff',
                color: '#fff', border: 'none',
                borderRadius: 6, fontFamily: 'monospace', fontWeight: 700,
              }}>
                {method}
              </Tag>
              <Tag style={{
                background: data?.status ? 'rgba(82,196,26,0.2)' : 'rgba(255,255,255,0.1)',
                color: data?.status ? '#b7eb8f' : 'rgba(255,255,255,0.5)',
                border: `1px solid ${statusColor}`,
                borderRadius: 6,
              }}>
                {data?.status ? '● 运行中' : '○ 已关闭'}
              </Tag>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容 */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 16px 60px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
        ) : data ? (
          <>
            {/* 接口信息卡片 */}
            <Card
              bordered={false}
              style={{
                borderRadius: 16,
                border: '1px solid rgba(102,126,234,0.14)',
                boxShadow: '0 2px 16px rgba(102,126,234,0.1)',
                marginBottom: 20,
              }}
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CodeOutlined style={{ color: '#667eea' }} />
                  <span style={{ fontWeight: 700, color: '#3d3d5c' }}>接口信息</span>
                </div>
              }
            >
              <Descriptions column={1} labelStyle={{ color: '#8891a5', width: 110 }} contentStyle={{ color: '#1a1a2e' }}>
                <Descriptions.Item label="描述">{data.description || '暂无描述'}</Descriptions.Item>
                <Descriptions.Item label="请求地址">
                  <code style={{
                    background: '#f5f6ff', padding: '2px 8px',
                    borderRadius: 4, color: '#667eea', wordBreak: 'break-all',
                  }}>
                    {data.url}
                  </code>
                </Descriptions.Item>
                <Descriptions.Item label="请求方法">
                  <Tag color={methodColor[method] || 'blue'} style={{ fontFamily: 'monospace' }}>{method}</Tag>
                </Descriptions.Item>
                {data.requestParams && (
                  <Descriptions.Item label="请求参数">
                    <pre style={{
                      background: '#f5f6ff', padding: 10, borderRadius: 8,
                      fontSize: 12, color: '#555', margin: 0, overflowX: 'auto',
                    }}>
                      {data.requestParams}
                    </pre>
                  </Descriptions.Item>
                )}
                {data.requestHeader && (
                  <Descriptions.Item label="请求头">
                    <pre style={{
                      background: '#f5f6ff', padding: 10, borderRadius: 8,
                      fontSize: 12, color: '#555', margin: 0, overflowX: 'auto',
                    }}>
                      {data.requestHeader}
                    </pre>
                  </Descriptions.Item>
                )}
                {data.responseHeader && (
                  <Descriptions.Item label="响应头">
                    <pre style={{
                      background: '#f5f6ff', padding: 10, borderRadius: 8,
                      fontSize: 12, color: '#555', margin: 0, overflowX: 'auto',
                    }}>
                      {data.responseHeader}
                    </pre>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="创建时间">
                  <ClockCircleOutlined style={{ marginRight: 4, color: '#aaa' }} />
                  {data.createTime}
                </Descriptions.Item>
                <Descriptions.Item label="更新时间">
                  <ClockCircleOutlined style={{ marginRight: 4, color: '#aaa' }} />
                  {data.updateTime}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* 我的调用信息 */}
            <Card
              bordered={false}
              style={{
                borderRadius: 16,
                border: '1px solid rgba(102,126,234,0.14)',
                boxShadow: '0 2px 16px rgba(102,126,234,0.1)',
                marginBottom: 20,
              }}
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <UserOutlined style={{ color: '#667eea' }} />
                  <span style={{ fontWeight: 700, color: '#3d3d5c' }}>我的调用信息</span>
                </div>
              }
              loading={invokeStatLoading}
            >
              {invokeStat?.userId ? (
                <Descriptions column={1} labelStyle={{ color: '#8891a5', width: 110 }} contentStyle={{ color: '#1a1a2e' }}>
                  <Descriptions.Item label="用户昵称">{invokeStat.userName || '-'}</Descriptions.Item>
                  <Descriptions.Item label="用户账号">{invokeStat.userAccount || '-'}</Descriptions.Item>
                  <Descriptions.Item label="我的总调用次数">{invokeStat.totalNum ?? 0}</Descriptions.Item>
                  <Descriptions.Item label="剩余调用次数">
                    <Tag color={(invokeStat.leftNum ?? 0) > 0 ? 'green' : 'red'}>
                      {invokeStat.leftNum ?? 0}
                    </Tag>
                  </Descriptions.Item>
                  {isAdmin && (
                    <Descriptions.Item label="接口总调用次数">
                      <Tag color="blue">{invokeStat.interfaceTotalNum ?? 0}</Tag>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              ) : (
                <div style={{ color: '#8891a5' }}>
                  当前未登录，登录后可查看你的调用次数与剩余次数。
                </div>
              )}
            </Card>

            {/* 在线调试卡片 */}
            <Card
              bordered={false}
              style={{
                borderRadius: 16,
                border: '1px solid rgba(102,126,234,0.14)',
                boxShadow: '0 2px 16px rgba(102,126,234,0.1)',
                marginBottom: 20,
              }}
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <SendOutlined style={{ color: '#667eea' }} />
                  <span style={{ fontWeight: 700, color: '#3d3d5c' }}>在线调试</span>
                </div>
              }
            >
              <Form form={form} name="invoke" layout="vertical" onFinish={onFinish}>
                {hasRequestParams ? (
                  <Form.Item
                    label={<span style={{ color: '#555' }}>请求参数 (JSON)</span>}
                    name="userRequestParams"
                  >
                    <Input.TextArea
                      rows={5}
                      placeholder='{"key": "value"}'
                      style={{
                        borderRadius: 10,
                        fontFamily: 'monospace',
                        fontSize: 13,
                        background: '#f5f6ff',
                        border: '1px solid #e8eaff',
                      }}
                    />
                  </Form.Item>
                ) : (
                  <div
                    style={{
                      marginBottom: 18,
                      color: '#667085',
                      background: '#f5f6ff',
                      border: '1px solid #e8eaff',
                      borderRadius: 10,
                      padding: '10px 12px',
                    }}
                  >
                    该接口为随机调用，无需传参。
                  </div>
                )}
                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={invokeLoading}
                    icon={<SendOutlined />}
                    style={{
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      fontWeight: 600,
                      height: 40,
                      padding: '0 32px',
                    }}
                  >
                    发起调用
                  </Button>
                </Form.Item>
              </Form>
            </Card>

            {/* 调用结果卡片 */}
            <Card
              bordered={false}
              style={{
                borderRadius: 16,
                border: '1px solid rgba(102,126,234,0.14)',
                boxShadow: '0 2px 16px rgba(102,126,234,0.1)',
              }}
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CodeOutlined style={{ color: '#667eea' }} />
                  <span style={{ fontWeight: 700, color: '#3d3d5c' }}>返回结果</span>
                </div>
              }
              loading={invokeLoading}
            >
              {invokeRes !== undefined ? (
                <pre style={{
                  background: '#f5f6ff',
                  padding: 16,
                  borderRadius: 10,
                  fontSize: 13,
                  color: '#3d3d5c',
                  minHeight: 80,
                  overflowX: 'auto',
                  margin: 0,
                }}>
                  {typeof invokeRes === 'string'
                    ? invokeRes
                    : JSON.stringify(invokeRes, null, 2)}
                </pre>
              ) : (
                <div style={{
                  textAlign: 'center', padding: '40px 0',
                  color: '#bbb', fontSize: 14,
                }}>
                  暂无结果，点击「发起调用」后显示
                </div>
              )}
            </Card>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 80, color: '#aaa' }}>接口不存在</div>
        )}
      </div>
    </div>
  );
};

export default InterfaceInfoPage;
