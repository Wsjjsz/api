import { ApiOutlined, LogoutOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Link, history, useModel } from '@umijs/max';
import { Button, List, message, Pagination, Tag, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { listInterfaceInfoByPageUsingGET } from '@/services/api-backend/interfaceInfoController';
import { userLogoutUsingPOST } from '@/services/api-backend/userController';

const gradients = [
  'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
  'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)',
  'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)',
  'linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)',
  'linear-gradient(135deg,#fa709a 0%,#fee140 100%)',
];

const Index: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<API.InterfaceInfo[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const { initialState, setInitialState } = useModel('@@initialState');
  const loginUser = initialState?.loginUser;

  const loadData = async (page = 1, size = pageSize) => {
    setLoading(true);
    try {
      const res = await listInterfaceInfoByPageUsingGET({ current: page, pageSize: size });
      setList(res?.data?.records ?? []);
      setTotal(res?.data?.total ?? 0);
    } catch (e: any) {
      message.error('加载失败：' + (e.message || '请稍后重试'));
    }
    setLoading(false);
  };

  useEffect(() => { loadData(1, 8); }, []);

  const handleLogout = async () => {
    try {
      await userLogoutUsingPOST();
    } catch (_) {
      // 忽略注销接口错误，session 可能已过期，仍然清除本地状态
    }
    await setInitialState((s: any) => ({ ...s, loginUser: undefined }));
    message.success('已退出登录');
    history.push('/user/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(1200px 500px at 50% -200px, rgba(102,126,234,0.25), transparent 55%), #f2f4fb',
    }}>
      {/* 顶部 Hero 区 */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '48px 24px 60px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* 装饰圆 */}
        <div style={{
          position: 'absolute', top: -60, right: -60, width: 220, height: 220,
          borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
        }} />
        <div style={{
          position: 'absolute', bottom: -40, left: -40, width: 160, height: 160,
          borderRadius: '50%', background: 'rgba(255,255,255,0.06)',
        }} />

        {/* 用户信息 + 注销 */}
        <div style={{
          position: 'absolute', top: 16, right: 24,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          {loginUser && (
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
              👋 {loginUser.userName || loginUser.userAccount}
            </span>
          )}
          <Button
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            size="small"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              borderRadius: 20,
              backdropFilter: 'blur(4px)',
            }}
          >
            退出登录
          </Button>
        </div>

        {/* 标题 */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 72, height: 72, borderRadius: 20, marginBottom: 20,
          background: 'rgba(255,255,255,0.15)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          backdropFilter: 'blur(8px)',
        }}>
          <ApiOutlined style={{ fontSize: 36, color: '#fff' }} />
        </div>
        <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: 1 }}>
          SUAPI 开放平台
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, marginTop: 10, marginBottom: 0 }}>
          探索并使用海量优质 API，快速接入，即开即用
        </p>
      </div>

      {/* 内容区 */}
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '28px 8px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <Typography.Title level={5} style={{ margin: 0, color: '#3d3d5c' }}>
            全部接口 <Tag color="purple">{total}</Tag>
          </Typography.Title>
        </div>

        <List
          loading={loading}
          dataSource={list}
          grid={{ gutter: 14, xs: 1, sm: 2, md: 2, lg: 3, xl: 4, xxl: 4 }}
          renderItem={(item, index) => (
            <List.Item>
              <div style={{
                background: '#fff',
                borderRadius: 16,
                padding: '20px 22px',
                border: '1px solid rgba(102,126,234,0.12)',
                boxShadow: '0 2px 16px rgba(102,126,234,0.08)',
                transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                backdropFilter: 'blur(2px)',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(102,126,234,0.18)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(102,126,234,0.35)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'none';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 16px rgba(102,126,234,0.08)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(102,126,234,0.12)';
                }}
              >
                {/* 头部 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: gradients[index % gradients.length],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <ThunderboltOutlined style={{ color: '#fff', fontSize: 20 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Typography.Text strong ellipsis style={{ fontSize: 15, color: '#1a1a2e', display: 'block' }}>
                      {item.name}
                    </Typography.Text>
                    <Tag
                      style={{ marginTop: 4, borderRadius: 4, fontSize: 11, border: 'none' }}
                      color={item.status ? 'green' : 'default'}
                    >
                      {item.status ? '● 运行中' : '○ 已关闭'}
                    </Tag>
                  </div>
                </div>

                {/* 描述 */}
                <Typography.Paragraph
                  ellipsis={{ rows: 2 }}
                  style={{ color: '#8891a5', fontSize: 13, margin: 0, flex: 1 }}
                >
                  {item.description || '暂无描述'}
                </Typography.Paragraph>

                {/* 方法 + 查看按钮 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Tag color="blue" style={{ borderRadius: 4, fontFamily: 'monospace' }}>
                    {item.method || 'GET'}
                  </Tag>
                  <Link to={`/interface_info/${item.id}`}>
                    <Button
                      type="primary"
                      size="small"
                      style={{
                        borderRadius: 8,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        fontWeight: 600,
                        padding: '0 16px',
                      }}
                    >
                      查看详情 →
                    </Button>
                  </Link>
                </div>
              </div>
            </List.Item>
          )}
        />

        {total > pageSize && (
          <div style={{ textAlign: 'center', marginTop: 32 }}>
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
  );
};

export default Index;
