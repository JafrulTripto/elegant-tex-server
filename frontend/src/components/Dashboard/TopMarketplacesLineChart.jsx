import React, { useEffect, useState } from 'react';
import { Radio, Spin, Card, Skeleton, theme } from "antd";
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
  const { token } = theme.useToken();
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

  // Standardize labels to Jan-Dec
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function generateChartData(apiData) {
    const colorArray = ['#007AFF', '#10b981', '#f59e0b', '#06b6d4', '#ef4444'];

    return apiData.map((marketplace, index) => {
      // Create a map of existing data for quick lookup: { monthIndex: value }
      const dataMap = {};
      marketplace.monthly_stats.forEach(stat => {
        dataMap[stat.month] = switchValue === 'count' ? stat.order_count : stat.total_amount;
      });

      // Generate standardized data array for months 1-12
      const data = [];
      for (let m = 1; m <= 12; m++) {
        data.push(dataMap[m] || 0); // Use existing value or 0
      }

      const backgroundColor = colorArray[index % colorArray.length];

      return {
        label: marketplace.marketplace_name,
        data: data,
        backgroundColor: backgroundColor,
        borderColor: backgroundColor,
        borderWidth: 2,
        tension: 0.4, // Smooth lines
        pointRadius: 3,
        pointHoverRadius: 5,
      };
    });
  }

  const formatValue = (value) => {
    if (switchValue === 'count') return value;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
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
      title: { display: false },
    },
    scales: {
      y: {
        ticks: {
          // Remove hardcoded stepSize to allow auto-scaling
          callback: function (value) {
            // Abbreviate large numbers for Y-axis space
            if (switchValue !== 'count' && value >= 1000) {
              return '$' + (value / 1000).toFixed(0) + 'k';
            }
            return formatValue(value);
          },
          font: { family: 'Inter' },
          color: token.colorTextDescription
        },
        grid: { color: token.colorBorderSecondary, borderDash: [2, 2] },
        border: { display: false }
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { family: 'Inter' },
          color: token.colorTextDescription
        }
      }
    },
  };

  const data = {
    type: 'line',
    labels: monthNames, // Fix labels to standard 12 months
    datasets: generateChartData(chartData),
  };

  return (
    <Card
      bordered={false}
      className="hover:shadow-lg transition-shadow duration-300 h-full"
      title={<span style={{ color: token.colorTextHeading }}>Top Marketplaces Trend</span>}
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
