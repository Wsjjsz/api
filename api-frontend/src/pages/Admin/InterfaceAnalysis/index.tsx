import {
  getInterfaceInvokeOverviewUsingGET,
  listTopInvokeInterfaceInfoUsingGET,
} from '@/services/api-backend/analysisController';
import { PieChartOutlined, TrophyOutlined } from '@ant-design/icons';
import '@umijs/max';
import { Card, Empty, List, message, Progress, Spin, Statistic, Tag } from 'antd';
import ReactECharts from 'echarts-for-react';
import React, { useEffect, useMemo, useState } from 'react';
import styles from '../adminTheme.less';

const InterfaceAnalysis: React.FC = () => {
  const [data, setData] = useState<API.InterfaceInfoVO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalInterfaceNum, setTotalInterfaceNum] = useState<number>(0);
  const [totalInvokeNum, setTotalInvokeNum] = useState<number>(0);

  const loadData = async () => {
    setLoading(true);
    try {
      const [topRes, overviewRes] = await Promise.all([
        listTopInvokeInterfaceInfoUsingGET(),
        getInterfaceInvokeOverviewUsingGET(),
      ]);
      if (topRes.data) {
        setData(topRes.data);
      } else {
        setData([]);
      }
      setTotalInterfaceNum(Number(overviewRes?.data?.totalInterfaceNum || 0));
      setTotalInvokeNum(Number(overviewRes?.data?.totalInvokeNum || 0));
    } catch (e: any) {
      message.error(e?.message || '加载接口分析数据失败');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const topData = useMemo(
    () => [...data].sort((a, b) => (b.totalNum || 0) - (a.totalNum || 0)).slice(0, 5),
    [data],
  );

  const chartData = useMemo(
    () =>
      topData.map((item) => ({
        value: item.totalNum || 0,
        name: item.name || '未命名接口',
      })),
    [topData],
  );

  const totalInvoke = chartData.reduce((sum, item) => sum + item.value, 0);
  const maxInvoke = chartData[0]?.value || 0;
  const minInvoke = chartData[chartData.length - 1]?.value || 0;
  const avgInvoke = chartData.length ? Math.round(totalInvoke / chartData.length) : 0;
  const topShare = totalInvoke ? Number(((maxInvoke / totalInvoke) * 100).toFixed(1)) : 0;
  const invokeGap = Math.max(0, maxInvoke - minInvoke);

  const pieOption = {
    color: ['#4468ff', '#6d59d9', '#32c5ff', '#4cc38a', '#f7b955'],
    title: {
      text: 'TOP 5 调用占比',
      subtext: '按调用次数统计',
      left: 'center',
      top: 10,
      textStyle: {
        color: '#1f2d4d',
        fontSize: 17,
        fontWeight: 700,
      },
      subtextStyle: {
        color: '#7b85a0',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}<br/>调用 {c} 次（{d}%）',
    },
    legend: {
      bottom: 6,
      icon: 'circle',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        color: '#4d5876',
      },
    },
    series: [
      {
        name: '调用次数',
        type: 'pie',
        radius: ['42%', '70%'],
        center: ['50%', '52%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}\n{c} 次',
          color: '#2f3b5f',
          fontSize: 12,
        },
        data: chartData,
      },
    ],
  };

  const barOption = {
    grid: {
      left: 16,
      right: 16,
      top: 38,
      bottom: 8,
      containLabel: true,
    },
    title: {
      text: 'TOP 5 调用对比',
      left: 0,
      top: 6,
      textStyle: {
        color: '#1f2d4d',
        fontSize: 16,
        fontWeight: 700,
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    xAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          color: 'rgba(88, 113, 255, 0.12)',
        },
      },
    },
    yAxis: {
      type: 'category',
      data: chartData.map((item) => item.name),
      axisLabel: {
        color: '#425174',
      },
    },
    series: [
      {
        type: 'bar',
        data: chartData.map((item) => item.value),
        barWidth: 18,
        itemStyle: {
          borderRadius: [0, 8, 8, 0],
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#5a7bff' },
              { offset: 1, color: '#6d59d9' },
            ],
          },
        },
      },
    ],
  };

  return (
    <div className={styles.adminWorkspace}>
      <div className={styles.heroPanel}>
        <div className={styles.heroRow}>
          <div className={styles.heroMain}>
            <div className={styles.heroIcon}>
              <PieChartOutlined style={{ fontSize: 24 }} />
            </div>
            <div>
              <h1 className={styles.heroTitle}>接口调用分析</h1>
              <p className={styles.heroSubtitle}>
                展示 TOP5 接口热度与调用结构，辅助容量与治理决策
              </p>
            </div>
          </div>
          <div className={styles.metricRow}>
            <div className={styles.metricPill}>总接口 {totalInterfaceNum} 个</div>
            <div className={styles.metricPill}>全部接口总调用 {totalInvokeNum} 次</div>
          </div>
        </div>
      </div>

      <div className={styles.analysisStatsGrid}>
        <Card className={styles.analysisStatCard} bordered={false}>
          <Statistic title="TOP5 总调用" value={totalInvoke} suffix="次" />
          <div className={styles.analysisStatHint}>统计范围：当前上榜接口</div>
        </Card>
        <Card className={styles.analysisStatCard} bordered={false}>
          <Statistic title="平均调用" value={avgInvoke} suffix="次" />
          <div className={styles.analysisStatHint}>TOP5 平均调用强度</div>
        </Card>
        <Card className={styles.analysisStatCard} bordered={false}>
          <Statistic title="头部集中度" value={topShare} suffix="%" />
          <div className={styles.analysisStatHint}>TOP1 占 TOP5 的比例</div>
        </Card>
        <Card className={styles.analysisStatCard} bordered={false}>
          <Statistic title="最大调用差" value={invokeGap} suffix="次" />
          <div className={styles.analysisStatHint}>TOP1 与 TOP5 调用差值</div>
        </Card>
      </div>

      <div className={`${styles.surfaceCard} ${styles.analysisWrap}`}>
        <Spin spinning={loading}>
          {topData.length > 0 ? (
            <div className={styles.analysisMainGrid}>
              <Card
                className={`${styles.analysisCard} ${styles.analysisChartCard}`}
                bordered={false}
              >
                <ReactECharts option={pieOption} style={{ height: 360 }} />
              </Card>

              <Card
                className={`${styles.analysisCard} ${styles.analysisChartCard}`}
                bordered={false}
              >
                <ReactECharts option={barOption} style={{ height: 360 }} />
              </Card>

              <Card
                className={`${styles.analysisCard} ${styles.analysisRankCard}`}
                bordered={false}
              >
                <div className={styles.rankHeader}>
                  <span>
                    <TrophyOutlined /> 热度排行（TOP5）
                  </span>
                  <Tag color="blue">实时统计</Tag>
                </div>
                <List
                  dataSource={topData}
                  renderItem={(item, index) => {
                    const totalNum = item.totalNum || 0;
                    const percent = totalInvoke
                      ? Number(((totalNum / totalInvoke) * 100).toFixed(1))
                      : 0;
                    return (
                      <List.Item className={styles.rankItem}>
                        <div className={styles.rankLeft}>
                          <div className={styles.rankIndex}>{index + 1}</div>
                          <div>
                            <div className={styles.rankName}>{item.name || '未命名接口'}</div>
                            <div className={styles.rankMeta}>占比 {percent}%</div>
                          </div>
                        </div>
                        <div className={styles.rankRight}>
                          <div className={styles.rankCount}>{totalNum} 次</div>
                          <Progress
                            percent={percent}
                            showInfo={false}
                            strokeColor={{
                              '0%': '#5a7bff',
                              '100%': '#6d59d9',
                            }}
                            trailColor="rgba(96, 120, 204, 0.16)"
                          />
                        </div>
                      </List.Item>
                    );
                  }}
                />
              </Card>
            </div>
          ) : (
            <div className={styles.emptyWrap}>
              <Empty description="暂无调用数据，先去调用几个接口试试吧～" />
            </div>
          )}
        </Spin>
      </div>
    </div>
  );
};

export default InterfaceAnalysis;
