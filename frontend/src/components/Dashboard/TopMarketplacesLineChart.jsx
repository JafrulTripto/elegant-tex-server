import React, { useEffect, useState } from 'react';
import { Radio, Spin, Card, Skeleton } from "antd";
import useAxiosClient from "../../axios-client";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement, Title, Tooltip, Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const TopMarketplacesLineChart = (props) => {

  const [chartData, setChartData] = useState([]);
  const [chartDataLoading, setChartDataLoading] = useState(false);
  const [switchValue, setSwitchValue] = useState('count');
  const axiosClient = useAxiosClient();
  const switchOptions = [
    { label: 'Amount', value: 'Amount' },
    { label: 'Count', value: 'count' },
  ];

  const onChangeSwitch = ({ target: { value } }) => {
    setSwitchValue(value);
  };

  useEffect(() => {
    setChartDataLoading(true)
    axiosClient.get(`/dashboard/getTopMarketplacesMonthlyStats`).then((response) => {
      setChartData(response.data);
      setChartDataLoading(false);
    })
      .catch((error) => {
        setChartDataLoading(false)
        console.error('Error fetching data:', error);
      });
  }, []);

  function generateChartData(apiData) {
    const colorArray = ['#007AFF', '#10b981', '#f59e0b', '#06b6d4', '#ef4444'];
    return apiData.map((marketplace, index) => {
      const { monthly_stats } = marketplace;
      const labels = monthly_stats.map(stat => `Month ${stat.month}`);
      const data = monthly_stats.map(stat => switchValue === 'count' ? stat.order_count : stat.total_amount);
      const backgroundColor = colorArray[index % colorArray.length];

      return {
        label: marketplace.marketplace_name,
        data: data,
        backgroundColor: backgroundColor,
        borderColor: backgroundColor,
        borderWidth: 2,
        tension: 0.3, // Smooth lines
        pointRadius: 3
      };
    });
  }

  function getMonthLabels(data) {
    const months = new Set();
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    data.forEach(marketplace => {
      marketplace.monthly_stats.forEach(monthly => {
        months.add(monthly.month);
      });
    });
    return Array.from(months).sort((a, b) => a - b).map(month => monthNames[month - 1]);
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { family: 'Inter' } }
      },
      title: { display: false },
    },
    scales: {
      y: {
        ticks: {
          stepSize: switchValue === 'count' ? 50 : 100000,
          font: { family: 'Inter' }
        },
        grid: { color: '#f1f5f9' },
        border: { display: false }
      },
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Inter' } }
      }
    },
  };

  const data = {
    type: 'line',
    labels: getMonthLabels(chartData),
    datasets: generateChartData(chartData),
  };

  return (
    <Card
      bordered={false}
      className="hover:shadow-lg transition-shadow duration-300 h-full"
      title={<span className="text-lg font-semibold text-slate-700">Top Marketplaces Trend</span>}
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
          <Line options={options} data={data} />
        </Skeleton>
      </div>
    </Card>
  )
}

export default TopMarketplacesLineChart;
