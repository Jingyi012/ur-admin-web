import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Tag, Typography, Skeleton, Progress, Statistic } from 'antd';
import { Bar, Pie, Column, Liquid, WordCloud, Treemap } from '@ant-design/charts';
import { EnvironmentOutlined, GlobalOutlined, UserOutlined, StarOutlined } from '@ant-design/icons';
import { GetGaCityCountryUserStats } from '@/services/ant-design-pro/dashboard';

const { Title, Text } = Typography;

interface UserOriginAnalyticsProps {
  startDate: string;
  endDate: string;
}

const UserOriginAnalytics: React.FC<UserOriginAnalyticsProps> = ({ startDate, endDate }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [rawData, setRawData] = useState<API.GaUserOriginStatistic[]>([]);

  // Derived data - recalculates whenever rawData changes
  const processedData = React.useMemo(() => {
    if (!rawData.length) return { topCities: [], countryData: [], totalUsers: 0 };

    const totalUsers = rawData.reduce((sum, item) => sum + item.activeUsers, 0);

    const topCities = [...rawData].sort((a, b) => b.activeUsers - a.activeUsers).slice(0, 5);

    const countries = rawData.reduce(
      (acc, curr) => {
        acc[curr.country] = (acc[curr.country] || 0) + curr.activeUsers;
        return acc;
      },
      {} as Record<string, number>,
    );

    const countryData = Object.entries(countries).map(([country, activeUsers]) => ({
      country,
      activeUsers,
      percent: Math.round((activeUsers / totalUsers) * 100),
    }));

    return { topCities, countryData, totalUsers };
  }, [rawData]); // Recalculates only when rawData changes

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await GetGaCityCountryUserStats({ startDate, endDate });
      setRawData(response.data || []);
    } catch (error) {
      console.error('Fetch error:', error);
      setRawData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  // Visualization Configs
  const cityBarConfig = {
    data: processedData.topCities,
    xField: 'city',
    yField: 'activeUsers',
    colorField: 'city',
    legend: false,
    height: 300,
    axis: {
      x: { title: 'City' },
      y: { title: 'Active Users' },
    },

    barStyle: {
      radius: [0, 4, 4, 0],
    },
  };

  const countryPieConfig = {
    data: processedData.countryData,
    angleField: 'activeUsers',
    colorField: 'country',
    radius: 0.8,
    innerRadius: 0.6,
    height: 300,
    label: {
      text: 'activeUsers',
      position: 'outside',
    },
    tooltip: {
      title: (data) => `Active Users`,
      items: [
        (data) => ({
          name: data.country,
          value: data.activeUsers,
        }),
      ],
    },
    interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
    statistic: {
      title: false,
      content: {
        style: {
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: '18px',
        },
        content: 'Countries',
      },
    },
  };

  return (
    <div style={{ padding: '16px 0' }}>
      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <>
          {/* Summary Cards */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Cities"
                  value={rawData.length}
                  prefix={<EnvironmentOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Countries"
                  value={processedData.countryData.length}
                  prefix={<GlobalOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Active Users"
                  value={processedData.totalUsers}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* Main Visualizations */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card
                title={
                  <>
                    <EnvironmentOutlined style={{ marginRight: 8 }} />
                    Top Cities by Active Users
                  </>
                }
                bordered={false}
              >
                <Column {...cityBarConfig} />
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card
                title={
                  <>
                    <GlobalOutlined style={{ marginRight: 8 }} />
                    User Distribution by Country
                  </>
                }
                bordered={false}
              >
                <Pie {...countryPieConfig} />
              </Card>
            </Col>
          </Row>

          {/* Secondary Visualizations */}
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            {/* <Col xs={24} md={12}>
              <Card
                title={
                  <>
                    <StarOutlined style={{ marginRight: 8 }} />
                    City Engagement Word Cloud
                  </>
                }
                bordered={false}
              >
                <Treemap {...treemapConfig} />
              </Card>
            </Col> */}

            <Col xs={24} /*md={12}*/>
              <Card title="Top City Metrics" bordered={false}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  {processedData.topCities.map((city) => (
                    <div key={city.city} style={{ marginBottom: 12 }}>
                      <Text strong>
                        {city.city}, {city.country}
                      </Text>
                      <Progress
                        percent={Math.round((city.activeUsers / processedData.totalUsers) * 100)}
                        strokeColor={{
                          '0%': '#1890ff',
                          '100%': '#52c41a',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default UserOriginAnalytics;
