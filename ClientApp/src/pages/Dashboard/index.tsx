import { PageContainer, ProCard, ProFormDateRangePicker } from '@ant-design/pro-components';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import InfoCard from './components/InfoCard';
import { getDashboardStatistic } from '@/services/ant-design-pro/dashboard';
import { message } from 'antd';

const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>([
    dayjs().subtract(7, 'day'),
    dayjs(),
  ]);
  const [dashboardStatistic, setDashboardStatistic] = useState<API.DashboardStaistic>();
  const [loading, setLoading] = useState<boolean>(false);

  const handleDateChange = (dates: [Dayjs, Dayjs] | null, dateStrings: [string, string]) => {
    setDateRange(dates);
    // Handle date range change logic here if needed
  };

  const fetchStatistic = async () => {
    try {
      setLoading(true);
      const response = await getDashboardStatistic();
      if (response.data.succeeded) {
        setDashboardStatistic(response.data.data);
      } else {
        message.error('Failed to fetch statistic data.');
      }
    } catch {
      message.error('Failed to fetch statistic data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistic();
  }, []);

  return (
    <PageContainer>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <InfoCard
          title="Number of Products"
          index={dashboardStatistic?.totalProducts || 0}
          desc="Number of products in the current system"
          href="/products"
        />
        <InfoCard
          title="Number of News"
          index={dashboardStatistic?.totalNews || 0}
          desc="Number of news in the current system"
          href="/news"
        />
        <InfoCard
          title="Number of Projects"
          index={dashboardStatistic?.totalProjects || 0}
          desc="Number of projects in the current system"
          href="/projects"
        />
        <InfoCard
          title="Number of Incomplete Enquiry"
          index={dashboardStatistic?.totalPendingEnquiries || 0}
          desc="Number of incomplete enquiries in the current system"
          href="/enquiries"
        />
      </div>
      <ProCard
        title="Insights"
        style={{
          marginTop: 16,
        }}
      >
        <ProFormDateRangePicker
          name="dateRange"
          label="Select Date Range"
          style={{ marginBottom: 16 }}
          fieldProps={{
            value: dateRange, // Ensure the picker value is controlled by state
            onChange: handleDateChange,
          }}
        />
      </ProCard>
    </PageContainer>
  );
};

export default Dashboard;
