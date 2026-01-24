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

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { family: 'Inter' }
        }
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        ticks: {
          stepSize: switchValue === 'order' ? 10 : 20000,
          font: { family: 'Inter' }
        },
        grid: {
          color: '#f1f5f9'
        }
      },
      x: {
        ticks: { font: { family: 'Inter' } },
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
        backgroundColor: token.colorPrimary,
        borderRadius: 4,
        barPercentage: 0.6,
      },
    ],
  };

  return (
    <Card
      bordered={false}
      className="hover:shadow-lg transition-shadow duration-300 h-full"
      title={<span className="text-lg font-semibold text-slate-700">Orders This Month</span>}
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
