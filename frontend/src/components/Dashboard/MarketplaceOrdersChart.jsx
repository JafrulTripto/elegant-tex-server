import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import useAxiosClient from "../../axios-client";
import { Spin, Radio, Card, Skeleton, theme } from "antd";

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MarketplaceOrdersChart = () => {
  const [chartData, setChartData] = useState([]);
  const [chartDataLoading, setChartDataLoading] = useState(false);
  const [switchValue, setSwitchValue] = useState('month');
  const axiosClient = useAxiosClient();
  const { token } = theme.useToken();

  const switchOptions = [
    { label: 'Monthly', value: 'month' },
    { label: 'Yearly', value: 'year' },
  ];

  useEffect(() => {
    setChartDataLoading(true)
    axiosClient.get(`/dashboard/getOrdersPerMarketplace?type=${switchValue}`).then((response) => {
      setChartData(response.data);
      setChartDataLoading(false);
    })
      .catch((error) => {
        setChartDataLoading(false)
        console.error('Error fetching data:', error);
      });
  }, [switchValue]);

  const onChangeSwitch = ({ target: { value } }) => {
    setSwitchValue(value);
  };

  const generateColors = (numColors) => {
    const baseColors = [
      '#007AFF', // Primary
      '#10b981', // Success
      '#f59e0b', // Warning
      '#ef4444', // Error
      '#06b6d4', // Info
      '#8b5cf6', // Violet
      '#ec4899', // Pink
    ];
    // Cycle through base colors if we have more data points than colors
    return Array.from({ length: numColors }, (_, i) => baseColors[i % baseColors.length]);
  };

  const labels = chartData.map((item) => item.marketplace_name);
  const data = chartData.map((item) => item.total_orders);
  const backgroundColor = generateColors(labels.length);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: { family: 'Inter' },
          color: token.colorTextDescription
        }
      },
      title: { display: false },
    }
  };

  const barChartData = {
    labels,
    datasets: [
      {
        label: "Order",
        data: data,
        hoverOffset: 4,
        backgroundColor: backgroundColor,
        borderWidth: 0,
      },
    ],
  };

  return (
    <Card
      bordered={false}
      className="hover:shadow-lg transition-shadow duration-300 h-full"
      title={<span style={{ color: token.colorTextHeading }}>Marketplace Orders</span>}
      extra={
        <Radio.Group
          options={switchOptions}
          onChange={onChangeSwitch}
          value={switchValue}
          size="small" // Compact Look
          buttonStyle="solid"
        />
      }
    >
      <div style={{ height: "400px" }}>
        <Skeleton loading={chartDataLoading} active paragraph={{ rows: 10 }}>
          <Doughnut options={options} data={barChartData} />
        </Skeleton>
      </div>
    </Card>
  );
}

export default MarketplaceOrdersChart;
