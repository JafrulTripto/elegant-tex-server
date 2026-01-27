import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import useAxiosClient from "../../axios-client";
import { Radio, Card, Skeleton, theme } from "antd";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const OrderBarChart = () => {
  const [chartData, setChartData] = useState({});
  const [chartDataLoading, setChartDataLoading] = useState(false);
  const [switchValue, setSwitchValue] = useState('order');
  const axiosClient = useAxiosClient();
  const { token } = theme.useToken();

  const switchOptions = [
    { label: 'Order', value: 'order' },
    { label: 'Amount', value: 'amount' },
  ];

  useEffect(() => {
    setChartDataLoading(true)
    axiosClient.get('/dashboard/barChartData').then((response) => {
      setChartData(response.data);
      setChartDataLoading(false);
    })
      .catch((error) => {
        setChartDataLoading(false)
        console.error('Error fetching data:', error);
      });
  }, []);

  const onChangeSwitch = ({ target: { value } }) => {
    setSwitchValue(value);
  };

  const labels = Object.keys(chartData);
  const getValues = (chartData) => {
    if (switchValue === 'order') {
      return Object.values(chartData).map(item => item.total_count);
    } else if (switchValue === 'amount') {
      return Object.values(chartData).map(item => item.total_amount);
    } else {
      throw new Error('Invalid type. Please pass "count" or "amount".');
    }
  }

  const formatValue = (value) => {
    if (switchValue === 'order') return value;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { family: 'Inter' },
          color: token.colorTextDescription,
          usePointStyle: true,
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatValue(context.parsed.y);
            }
            return label;
          }
        }
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        ticks: {
          // Auto-scale by removing hardcoded stepSize
          callback: function (value) {
            if (switchValue === 'amount' && value >= 1000) {
              return '$' + (value / 1000).toFixed(0) + 'k';
            }
            return formatValue(value);
          },
          font: { family: 'Inter' },
          color: token.colorTextDescription
        },
        grid: {
          color: token.colorBorderSecondary,
          borderDash: [2, 2]
        },
        border: { display: false }
      },
      x: {
        ticks: {
          font: { family: 'Inter' },
          color: token.colorTextDescription
        },
        grid: { display: false }
      }
    },
  };

  const data = {
    labels,
    datasets: [
      {
        label: switchValue === 'order' ? 'Total Orders' : 'Total Amount',
        data: getValues(chartData),
        // Use Green for Amount to distinguish visual context, Blue for Orders
        backgroundColor: switchValue === 'order' ? token.colorPrimary : '#10b981',
        borderRadius: 4,
        barPercentage: 0.6,
      },
    ],
  };

  return (
    <Card
      bordered={false}
      className="hover:shadow-lg transition-shadow duration-300 h-full"
      title={<span style={{ color: token.colorTextHeading }}>Orders This Month</span>}
      extra={
        <Radio.Group
          options={switchOptions}
          onChange={onChangeSwitch}
          value={switchValue}
          size="small"
          buttonStyle="solid"
        />
      }
    >
      <div style={{ height: "400px" }}>
        <Skeleton loading={chartDataLoading} active paragraph={{ rows: 10 }}>
          <Bar options={options} data={data} />
        </Skeleton>
      </div>
    </Card>
  );
}

export default OrderBarChart;
