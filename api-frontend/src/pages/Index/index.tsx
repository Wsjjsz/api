import { listInterfaceInfoByPageUsingGET } from '@/services/api-backend/interfaceInfoController';
import {
  ApiOutlined,
  AppstoreOutlined,
  AuditOutlined,
  BranchesOutlined,
  BugOutlined,
  BuildOutlined,
  CloudOutlined,
  ClusterOutlined,
  CodeOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  FireOutlined,
  GlobalOutlined,
  LinkOutlined,
  LockOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  ToolOutlined,
  WifiOutlined,
} from '@ant-design/icons';
import { Link } from '@umijs/max';
import { Button, List, message, Pagination, Tag, Tooltip, Typography } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './index.less';

const gradients = [
  'linear-gradient(135deg,#4468ff 0%,#6d59d9 100%)',
  'linear-gradient(135deg,#0093e9 0%,#50b1ff 100%)',
  'linear-gradient(135deg,#27ae60 0%,#2ecc71 100%)',
  'linear-gradient(135deg,#f2994a 0%,#f2c94c 100%)',
  'linear-gradient(135deg,#ee5f95 0%,#ff8a66 100%)',
  'linear-gradient(135deg,#3366ff 0%,#00b4db 100%)',
  'linear-gradient(135deg,#00c9a7 0%,#43e97b 100%)',
  'linear-gradient(135deg,#8e54e9 0%,#4776e6 100%)',
  'linear-gradient(135deg,#ff6a88 0%,#ff99ac 100%)',
  'linear-gradient(135deg,#f7971e 0%,#ffd200 100%)',
  'linear-gradient(135deg,#3a7bd5 0%,#00d2ff 100%)',
  'linear-gradient(135deg,#11998e 0%,#38ef7d 100%)',
  'linear-gradient(135deg,#6a11cb 0%,#2575fc 100%)',
  'linear-gradient(135deg,#fc5c7d 0%,#6a82fb 100%)',
  'linear-gradient(135deg,#00b09b 0%,#96c93d 100%)',
  'linear-gradient(135deg,#ff4b2b 0%,#ff416c 100%)',
  'linear-gradient(135deg,#1d976c 0%,#93f9b9 100%)',
  'linear-gradient(135deg,#355c7d 0%,#6c5b7b 100%)',
  'linear-gradient(135deg,#614385 0%,#516395 100%)',
  'linear-gradient(135deg,#159957 0%,#155799 100%)',
];

const cardIconList = [
  ThunderboltOutlined,
  CloudOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  LinkOutlined,
  CodeOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  BranchesOutlined,
  ClusterOutlined,
  AppstoreOutlined,
  BuildOutlined,
  ToolOutlined,
  WifiOutlined,
  LockOutlined,
  BugOutlined,
  AuditOutlined,
  FireOutlined,
  ExperimentOutlined,
  ApiOutlined,
];

const hashText = (text: string) => {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 131 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const buildCardVisuals = (items: API.InterfaceInfo[], page: number, size: number) => {
  const usedIconIndexes = new Set<number>();
  const usedGradientIndexes = new Set<number>();
  return items.map((item, index) => {
    const seedText = `${item.id ?? ''}|${item.name ?? ''}|${
      item.url ?? ''
    }|${page}|${size}|${index}`;
    const seed = hashText(seedText);

    let iconIndex = seed % cardIconList.length;
    while (usedIconIndexes.has(iconIndex) && usedIconIndexes.size < cardIconList.length) {
      iconIndex = (iconIndex + 1) % cardIconList.length;
    }
    usedIconIndexes.add(iconIndex);

    let gradientIndex = (seed * 7 + index) % gradients.length;
    while (usedGradientIndexes.has(gradientIndex) && usedGradientIndexes.size < gradients.length) {
      gradientIndex = (gradientIndex + 1) % gradients.length;
    }
    usedGradientIndexes.add(gradientIndex);

    return { iconIndex, gradientIndex };
  });
};

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

const Index: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<API.InterfaceInfo[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const loadData = useCallback(async (page = 1, size = 8) => {
    setLoading(true);
    try {
      const res = await listInterfaceInfoByPageUsingGET({ current: page, pageSize: size });
      setList(res?.data?.records ?? []);
      setTotal(res?.data?.total ?? 0);
    } catch (e: any) {
      message.error('加载失败：' + (e.message || '请稍后重试'));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData(1, 8);
  }, [loadData]);

  const cardVisuals = useMemo(
    () => buildCardVisuals(list, current, pageSize),
    [list, current, pageSize],
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.heroPanel}>
          <div className={styles.heroRow}>
            <div className={styles.heroMain}>
              <div className={styles.heroIcon}>
                <ApiOutlined style={{ fontSize: 24, color: '#fff' }} />
              </div>
              <div>
                <h1 className={styles.heroTitle}>接口广场</h1>
                <p className={styles.heroSubtitle}>统一发现与调用 API，快速接入你的业务流程</p>
              </div>
            </div>
            <div className={styles.metricRow}>
              <div className={styles.metricPill}>总接口 {total} 个</div>
              <div className={styles.metricPill}>当前页 {current}</div>
              <div className={styles.metricPill}>每页 {pageSize} 条</div>
            </div>
          </div>
        </div>

        <div className={styles.contentCard}>
          <div className={styles.sectionHeader}>
            <Typography.Title level={5} className={styles.sectionTitle}>
              全部接口
            </Typography.Title>
            <Tag className={styles.totalTag}>共 {total} 个</Tag>
          </div>

          <List
            loading={loading}
            dataSource={list}
            grid={{ gutter: 14, xs: 1, sm: 2, md: 2, lg: 3, xl: 4, xxl: 4 }}
            renderItem={(item, index) => {
              const methodText = (item.method || 'GET').toUpperCase();
              const methodClassName = getMethodClassName(methodText);
              const visual = cardVisuals[index] || {
                iconIndex: index % cardIconList.length,
                gradientIndex: index % gradients.length,
              };
              const IconComponent = cardIconList[visual.iconIndex];
              return (
                <List.Item className={styles.cardListItem}>
                  <article
                    className={styles.apiCard}
                    style={{ animationDelay: `${index * 26}ms` }}
                    title={item.name || '未命名接口'}
                  >
                    <Tag
                      className={`${styles.statusTag} ${
                        item.status ? styles.running : styles.closed
                      }`}
                    >
                      {item.status ? '● 运行中' : '○ 已关闭'}
                    </Tag>
                    <div className={styles.cardHeader}>
                      <div
                        className={styles.iconBox}
                        style={{ background: gradients[visual.gradientIndex] }}
                      >
                        <IconComponent style={{ color: '#fff', fontSize: 20 }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Tooltip title={item.name || '未命名接口'} placement="topLeft">
                          <Typography.Text strong ellipsis className={styles.cardTitle}>
                            {item.name || '未命名接口'}
                          </Typography.Text>
                        </Tooltip>
                      </div>
                    </div>

                    <Typography.Paragraph ellipsis={{ rows: 2 }} className={styles.cardDesc}>
                      {item.description || '暂无描述'}
                    </Typography.Paragraph>

                    <div className={styles.cardFooter}>
                      <Tag className={`${styles.methodTag} ${methodClassName}`}>{methodText}</Tag>
                      <Link to={`/interface_info/${item.id}`}>
                        <Button type="primary" size="small" className={styles.detailButton}>
                          查看详情
                        </Button>
                      </Link>
                    </div>
                  </article>
                </List.Item>
              );
            }}
          />

          {total > pageSize && (
            <div className={styles.paginationWrap}>
              <Pagination
                current={current}
                pageSize={pageSize}
                total={total}
                showSizeChanger
                pageSizeOptions={[8, 12, 16]}
                onChange={(page, size) => {
                  const nextSize = size || pageSize;
                  setCurrent(page);
                  setPageSize(nextSize);
                  loadData(page, nextSize);
                }}
                onShowSizeChange={(_, size) => {
                  setCurrent(1);
                  setPageSize(size);
                  loadData(1, size);
                }}
                showTotal={(t) => `共 ${t} 个接口`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
