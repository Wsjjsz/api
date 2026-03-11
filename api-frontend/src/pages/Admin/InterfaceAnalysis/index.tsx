import { PageContainer } from '@ant-design/pro-components';
import '@umijs/max';
import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Empty, message, Spin } from 'antd';
import { listTopInvokeInterfaceInfoUsingGET } from '@/services/api-backend/analysisController';

/**
 * 接口分析
 * @constructor
 */
const InterfaceAnalysis: React.FC = () => {

  const [data, setData] = useState<API.InterfaceInfoVO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await listTopInvokeInterfaceInfoUsingGET();
      if (res.data) {
        setData(res.data);
      } else {
        setData([]);
      }
    } catch (e: any) {
      // 未登录等错误会在全局拦截里跳转，这里只做兜底提示
      message.error(e?.message || '加载接口分析数据失败');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // 映射：{ value: 1048, name: 'Search Engine' },
  const chartData = data.map(item => {
    return {
      value: item.totalNum,
      name: item.name,
    }
  })

  const option = {
    title: {
      text: '调用次数最多的接口 TOP 3',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: '调用次数',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}\n{c} 次 ({d}%)',
        },
        labelLine: {
          show: true,
        },
        data: chartData,
        emphasis: {
          itemStyle: {
            shadowBlur: 12,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.4)',
          },
        },
      },
    ],
  };

  return (
    <PageContainer
      header={{
        title: '接口调用分析',
        subTitle: '了解哪些接口被调用得最多，辅助容量与权限规划',
      }}
    >
      <Card
        style={{ borderRadius: 16 }}
        bodyStyle={{ padding: 24 }}
      >
        <Spin spinning={loading}>
          {data && data.length > 0 ? (
            <ReactECharts
              option={option}
              style={{ height: 420 }}
            />
          ) : (
            <div style={{ padding: '40px 0' }}>
              <Empty description="暂无调用数据，先去调用几个接口试试吧～" />
            </div>
          )}
        </Spin>
      </Card>
    </PageContainer>
  );
};
export default InterfaceAnalysis;
