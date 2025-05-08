import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Progress, message, Skeleton } from 'antd';
import { UserOutlined, ClockCircleOutlined, RiseOutlined, FireOutlined } from '@ant-design/icons';
import { getGaStatistic } from '@/services/ant-design-pro/dashboard';

interface DashboardAnalyticsProps {
  startDate: string;
  endDate: string;
}

const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({ startDate, endDate }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [gaStatistic, setGaStatistic] = useState<API.GaStatistic>({
    activeUsers: 0,
    newUsers: 0,
    averageSessionDuration: 0,
    engagementRate: 0,
  });

  const formatSessionDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const fetchStatistic = async () => {
    try {
      setLoading(true);
      const response = await getGaStatistic({ startDate, endDate });
      if (response.data) {
        setGaStatistic(response.data);
      } else {
        message.error('Failed to fetch GA data');
        setGaStatistic({
          activeUsers: 0,
          newUsers: 0,
          averageSessionDuration: 0,
          engagementRate: 0,
        });
      }
    } catch (error) {
      message.error('Network error');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistic();
  }, [startDate, endDate]);

  // Skeleton config
  const StatisticSkeleton = () => (
    <div style={{ padding: '8px 0' }}>
      <Skeleton.Input active size="small" style={{ width: '60%', marginBottom: 8 }} />
      <Skeleton.Input active size="large" style={{ width: '80%' }} />
    </div>
  );

  return (
    <div style={{ padding: '12px 0' }}>
      <Row gutter={[16, 16]}>
        {/* Active Users */}
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{ height: '100%' }}
            loading={loading}
            bodyStyle={loading ? { padding: 12 } : {}}
          >
            {loading ? (
              <StatisticSkeleton />
            ) : (
              <Statistic
                title="Active Users"
                value={gaStatistic.activeUsers}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            )}
          </Card>
        </Col>

        {/* New Users */}
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{ height: '100%' }}
            loading={loading}
            bodyStyle={loading ? { padding: 12 } : {}}
          >
            {loading ? (
              <StatisticSkeleton />
            ) : (
              <Statistic
                title="New Users"
                value={gaStatistic.newUsers}
                prefix={<FireOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            )}
          </Card>
        </Col>

        {/* Avg. Session Duration */}
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{ height: '100%' }}
            loading={loading}
            bodyStyle={loading ? { padding: 12 } : {}}
          >
            {loading ? (
              <StatisticSkeleton />
            ) : (
              <Statistic
                title="Avg. Session Duration"
                value={formatSessionDuration(gaStatistic.averageSessionDuration)}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            )}
          </Card>
        </Col>

        {/* Engagement Rate */}
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{ height: '100%' }}
            loading={loading}
            bodyStyle={loading ? { padding: 12 } : {}}
          >
            {loading ? (
              <StatisticSkeleton />
            ) : (
              <>
                <Statistic
                  title="Engagement Rate"
                  value={gaStatistic.engagementRate * 100}
                  suffix="%"
                  prefix={<RiseOutlined />}
                  valueStyle={{ color: '#13c2c2' }}
                />
                <Progress
                  percent={gaStatistic.engagementRate * 100}
                  showInfo={false}
                  strokeColor="#13c2c2"
                  style={{ marginTop: 8 }}
                />
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardAnalytics;
