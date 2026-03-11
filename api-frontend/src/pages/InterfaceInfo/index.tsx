import {
  getInterfaceInfoByIdUsingGET,
  invokeInterfaceInfoUsingPOST,
} from '@/services/api-backend/interfaceInfoController';
import {
  ApiOutlined,
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CodeOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { Link, request, useModel, useParams } from '@umijs/max';
import { Button, Card, Descriptions, Form, Input, message, Spin, Tag } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import styles from './index.less';

const getMethodClassName = (method?: string) => {
  const upperMethod = (method || 'GET').toUpperCase();
  if (upperMethod === 'GET') {
    return styles.methodGet;
  }
  if (upperMethod === 'POST') {
    return styles.methodPost;
  }
  if (upperMethod === 'PUT') {
    return styles.methodPut;
  }
  if (upperMethod === 'DELETE') {
    return styles.methodDelete;
  }
  if (upperMethod === 'PATCH') {
    return styles.methodPatch;
  }
  return styles.methodDefault;
};

const formatCount = (num?: number) => Number(num ?? 0).toLocaleString();

const formatDateTime = (time?: string) => {
  if (!time) {
    return '-';
  }
  const date = new Date(time);
  if (Number.isNaN(date.getTime())) {
    return String(time);
  }
  return date.toLocaleString('zh-CN', { hour12: false });
};

const getDefaultValueByType = (type?: string) => {
  const lowerType = (type || '').toLowerCase();
  if (
    lowerType.includes('int') ||
    lowerType.includes('long') ||
    lowerType.includes('float') ||
    lowerType.includes('double') ||
    lowerType.includes('number')
  ) {
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

  const loadInvokeStat = useCallback(async (interfaceId: number) => {
    setInvokeStatLoading(true);
    try {
      const res = await request<BaseResponse<InterfaceInvokeStat>>(
        '/api/interfaceInfo/invoke/stat',
        {
          method: 'GET',
          params: { id: interfaceId },
        },
      );
      setInvokeStat(res?.data);
    } catch (error) {
      setInvokeStat(undefined);
    }
    setInvokeStatLoading(false);
  }, []);

  const loadData = useCallback(async () => {
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
        userRequestParams: hasRequestParams
          ? buildInvokeParamsTemplate(interfaceInfo?.requestParams)
          : undefined,
      });
      await loadInvokeStat(Number(params.id));
    } catch (error: any) {
      message.error('请求失败：' + error.message);
    }
    setLoading(false);
  }, [form, loadInvokeStat, params.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onFinish = async (values: any) => {
    if (!params.id) {
      message.error('接口不存在');
      return;
    }
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
      if (
        result === undefined ||
        result === null ||
        (typeof result === 'string' && result.trim() === '')
      ) {
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
  const methodClassName = getMethodClassName(method);
  const hasRequestParams = hasRequestParamDefinition(data?.requestParams);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.heroPanel}>
          <Link to="/">
            <Button icon={<ArrowLeftOutlined />} size="small" className={styles.backButton}>
              返回首页
            </Button>
          </Link>

          <div className={styles.heroRow}>
            <div className={styles.heroMain}>
              <div className={styles.heroIcon}>
                <ApiOutlined style={{ fontSize: 28, color: '#fff' }} />
              </div>
              <div className={styles.heroContent}>
                <h1 className={styles.heroTitle}>
                  {loading ? '加载中…' : data?.name || '接口详情'}
                </h1>
                <p className={styles.heroSubtitle}>
                  {data?.description || '查看接口信息并在线调试调用结果'}
                </p>
              </div>
            </div>

            <div className={styles.heroInvokePanel}>
              {invokeStatLoading ? (
                <div className={styles.heroInvokeLoading}>
                  <Spin size="small" />
                </div>
              ) : invokeStat?.userId ? (
                <div className={styles.heroInvokeGrid}>
                  <div className={styles.heroInvokeItem}>
                    <span className={styles.heroInvokeLabel}>用户账号</span>
                    <span className={styles.heroInvokeValue}>{invokeStat.userAccount || '-'}</span>
                  </div>
                  <div className={styles.heroInvokeItem}>
                    <span className={styles.heroInvokeLabel}>该接口总调用</span>
                    <Tag
                      className={`${styles.countTag} ${styles.heroCountTag} ${styles.countPrimary}`}
                    >
                      {formatCount(invokeStat.totalNum)}
                    </Tag>
                  </div>
                  <div className={styles.heroInvokeItem}>
                    <span className={styles.heroInvokeLabel}>该接口剩余调用</span>
                    <Tag
                      className={`${styles.countTag} ${styles.heroCountTag} ${
                        (invokeStat.leftNum ?? 0) > 0 ? styles.countPositive : styles.countDanger
                      }`}
                    >
                      {formatCount(invokeStat.leftNum)}
                    </Tag>
                  </div>
                  {isAdmin && (
                    <div className={styles.heroInvokeItem}>
                      <span className={styles.heroInvokeLabel}>该接口总调用次数</span>
                      <Tag
                        className={`${styles.countTag} ${styles.heroCountTag} ${styles.countPrimary}`}
                      >
                        {invokeStat.interfaceTotalNum == null
                          ? '-'
                          : formatCount(invokeStat.interfaceTotalNum)}
                      </Tag>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.heroInvokeEmpty}>
                  当前未登录，登录后可查看调用次数与剩余次数。
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.contentWrap}>
          {loading ? (
            <div className={styles.loadingWrap}>
              <Spin size="large" />
            </div>
          ) : data ? (
            <div className={styles.cardStack}>
              <Card
                bordered={false}
                className={styles.surfaceCard}
                title={
                  <div className={styles.cardTitleWrap}>
                    <CodeOutlined className={styles.cardTitleIcon} />
                    <span>接口信息</span>
                    <Tag
                      className={`${styles.statusTag} ${styles.cardStatusTag} ${
                        data?.status ? styles.statusOn : styles.statusOff
                      }`}
                    >
                      {data?.status ? '● 运行中' : '○ 已关闭'}
                    </Tag>
                  </div>
                }
              >
                <Descriptions column={1} className={styles.descBlock}>
                  <Descriptions.Item label="描述">
                    {data.description || '暂无描述'}
                  </Descriptions.Item>
                  <Descriptions.Item label="请求地址">
                    <code className={styles.inlineCode}>{data.url}</code>
                  </Descriptions.Item>
                  <Descriptions.Item label="请求方法">
                    <Tag className={`${styles.methodTag} ${methodClassName}`}>{method}</Tag>
                  </Descriptions.Item>
                  {data.requestParams && (
                    <Descriptions.Item label="请求参数">
                      <pre className={styles.codeBlock}>{data.requestParams}</pre>
                    </Descriptions.Item>
                  )}
                  {data.requestHeader && (
                    <Descriptions.Item label="请求头">
                      <pre className={styles.codeBlock}>{data.requestHeader}</pre>
                    </Descriptions.Item>
                  )}
                  {data.responseHeader && (
                    <Descriptions.Item label="响应头">
                      <pre className={styles.codeBlock}>{data.responseHeader}</pre>
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="时间信息">
                    <div className={styles.timeRow}>
                      <div className={styles.timeCell}>
                        <span className={styles.timeCellLabel}>
                          <ClockCircleOutlined className={styles.timeIcon} />
                          创建时间
                        </span>
                        <span className={styles.timeCellValue}>
                          {formatDateTime(data.createTime)}
                        </span>
                      </div>
                      <div className={styles.timeCell}>
                        <span className={styles.timeCellLabel}>
                          <ClockCircleOutlined className={styles.timeIcon} />
                          更新时间
                        </span>
                        <span className={styles.timeCellValue}>
                          {formatDateTime(data.updateTime)}
                        </span>
                      </div>
                    </div>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Card
                bordered={false}
                className={styles.surfaceCard}
                title={
                  <div className={styles.cardTitleWrap}>
                    <SendOutlined className={styles.cardTitleIcon} />
                    <span>在线调试</span>
                  </div>
                }
              >
                <Form
                  form={form}
                  name="invoke"
                  layout="vertical"
                  onFinish={onFinish}
                  className={styles.invokeForm}
                >
                  {hasRequestParams ? (
                    <Form.Item
                      label={<span className={styles.formLabel}>请求参数 (JSON)</span>}
                      name="userRequestParams"
                    >
                      <Input.TextArea
                        rows={5}
                        placeholder='{"key": "value"}'
                        className={styles.jsonInput}
                      />
                    </Form.Item>
                  ) : (
                    <div className={styles.noticeBox}>该接口为随机调用，无需传参。</div>
                  )}
                  <Form.Item className={styles.submitRow}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={invokeLoading}
                      icon={<SendOutlined />}
                      className={styles.invokeButton}
                    >
                      发起调用
                    </Button>
                  </Form.Item>
                </Form>
              </Card>

              <Card
                bordered={false}
                className={styles.surfaceCard}
                title={
                  <div className={styles.cardTitleWrap}>
                    <CodeOutlined className={styles.cardTitleIcon} />
                    <span>返回结果</span>
                  </div>
                }
                loading={invokeLoading}
              >
                {invokeRes !== undefined ? (
                  <pre className={styles.resultBlock}>
                    {typeof invokeRes === 'string' ? invokeRes : JSON.stringify(invokeRes, null, 2)}
                  </pre>
                ) : (
                  <div className={styles.emptyResult}>暂无结果，点击「发起调用」后显示</div>
                )}
              </Card>
            </div>
          ) : (
            <div className={styles.notFound}>接口不存在</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterfaceInfoPage;
