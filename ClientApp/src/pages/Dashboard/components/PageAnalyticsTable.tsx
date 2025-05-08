import React, { useEffect, useState } from 'react';
import { Table, Tag, Progress, message } from 'antd';
import { ArrowUpOutlined, UserOutlined } from '@ant-design/icons';
import { GetGaPageViews } from '@/services/ant-design-pro/dashboard';
import { ProTable } from '@ant-design/pro-components';

interface DashboardAnalyticsProps {
  startDate: string;
  endDate: string;
}

const PageAnalyticsTable: React.FC<DashboardAnalyticsProps> = ({ startDate, endDate }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<API.GaPageViewsAnalytics[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await GetGaPageViews({ startDate, endDate });
      if (response.data) {
        setData(response.data);
      } else {
        message.error('Failed to fetch GA data');
        setData([]);
      }
    } catch (error) {
      message.error('Network error');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const sortedData = [...data].sort((a, b) => b.screenPageViews - a.screenPageViews);

  const columns = [
    {
      title: 'Page',
      dataIndex: 'pagePath',
      key: 'pagePath',
      render: (path: string) => (
        <Tag color="blue" style={{ fontSize: '12px' }}>
          {path.replace(/^\/|\/$/g, '') || 'Home'}
        </Tag>
      ),
    },
    {
      title: 'Views',
      dataIndex: 'screenPageViews',
      key: 'screenPageViews',
      sorter: (a: any, b: any) => a.screenPageViews - b.screenPageViews,
      render: (views: number) => (
        <span style={{ fontWeight: 600 }}>
          <ArrowUpOutlined style={{ color: '#52c41a', marginRight: 4 }} />
          {views}
        </span>
      ),
    },
    {
      title: 'Engagement',
      dataIndex: 'engagementRate',
      key: 'engagementRate',
      render: (rate: number) => (
        <Progress
          percent={Math.round(rate * 100)}
          size="small"
          strokeColor={{
            '0%': '#ffccc7',
            '100%': '#52c41a',
          }}
        />
      ),
    },
    {
      title: 'Active Users',
      dataIndex: 'activeUsers',
      key: 'activeUsers',
      render: (users: number) => (
        <span>
          <UserOutlined style={{ marginRight: 4 }} />
          {users}
        </span>
      ),
    },
    {
      title: 'New Users',
      dataIndex: 'newUsers',
      key: 'newUsers',
      render: (users: number) => (
        <Tag color={users > 0 ? 'green' : 'default'}>{users > 0 ? `+${users}` : users}</Tag>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={sortedData}
      pagination={{ pageSize: 5 }}
      rowKey="pagePath"
      bordered
      size="middle"
      style={{ borderRadius: 8, overflow: 'hidden' }}
      loading={loading}
    />
  );
};

export default PageAnalyticsTable;
