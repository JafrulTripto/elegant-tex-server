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

  // Calculate total for percentages
  const totalOrders = data.reduce((acc, curr) => acc + curr, 0);

  const textCenter = {
    id: 'textCenter',
    beforeDatasetsDraw(chart, args, pluginOptions) {
      const { ctx, data } = chart;
      const meta = chart.getDatasetMeta(0);

      if (meta.data.length > 0) {
        ctx.save();
        const xCoor = meta.data[0].x;
        const yCoor = meta.data[0].y;

        // Calculate total (or use pre-calculated)
        const total = data.datasets[0].data.reduce((a, b) => a + b, 0);

        ctx.font = 'bold 24px Inter';
        ctx.fillStyle = token.colorTextHeading;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw Total
        ctx.fillText(total, xCoor, yCoor - 10);

        ctx.font = '14px Inter';
        ctx.fillStyle = token.colorTextDescription;
        ctx.fillText('Total Orders', xCoor, yCoor + 15);

        ctx.restore();
      }
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: { family: 'Inter' },
          color: token.colorTextDescription,
          usePointStyle: true,
        }
      },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = totalOrders > 0 ? Math.round((value / totalOrders) * 100) + '%' : '0%';
            return `${label}: ${value} (${percentage})`;
          }
        }
      }
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
        cutout: '75%', // Thinner ring
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
          <Doughnut options={options} data={barChartData} plugins={[textCenter]} />
        </Skeleton>
      </div>
    </Card>
  );
}

export default MarketplaceOrdersChart;
