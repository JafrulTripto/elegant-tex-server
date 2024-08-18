import React, {useEffect, useState} from 'react';
import {Radio, Spin} from "antd";
import useAxiosClient from "../../axios-client";
import {Line} from "react-chartjs-2";
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
    {label: 'Amount', value: 'Amount'},
    {label: 'Count', value: 'count'},
  ];

  const onChangeSwitch = ({target: {value}}) => {
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
    const colorArray = ['#d7263d', '#1b998b', '#2e294e', '#c5d86d', '#f46036'];
    return apiData.map((marketplace, index) => {
      const { monthly_stats } = marketplace;

      // Extract month labels
      const labels = monthly_stats.map(stat => `Month ${stat.month}`);

      // Extract data based on switchValue
      const data = monthly_stats.map(stat => switchValue === 'count' ? stat.order_count : stat.total_amount);

      // Use the color array to pick a color for each dataset
      const backgroundColor = colorArray[index % colorArray.length];
       // Same color for border
      return {
        label: marketplace.marketplace_name,
        data: data,
        backgroundColor: backgroundColor,
        borderColor: backgroundColor,
        borderWidth: 2
      };
    });
  }

  function getMonthLabels(data) {
    const months = new Set();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    data.forEach(marketplace => {
      marketplace.monthly_stats.forEach(monthly => {
        months.add(monthly.month);
      });
    });

    // Convert Set to array and sort by month number
    return Array.from(months).sort((a, b) => a - b).map(month => monthNames[month - 1]);
  }


  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: false,
        text: "Order's this Month",
      },
    },
    scales: {
      y: {
        ticks: {
          stepSize: switchValue === 'count' ? 50 : 100000, // Set the step size to 1 to display integers only
        },
      },
    },

  };

  const data = {
    type:'line',
    labels:getMonthLabels(chartData),
    datasets: generateChartData(chartData),
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <div className="flex flex-row justify-between">
        <div>
          <h5
            className="mb-2 text-xl font-medium leading-tight text-neutral-800">
            Top Marketplaces
          </h5>
        </div>
        <div>
          <Radio.Group
            options={switchOptions}
            onChange={onChangeSwitch}
            value={switchValue}
          />
        </div>
      </div>

      <div style={{height: "400px"}}>
        <div className="flex justify-between">


        </div>
        {!chartDataLoading ? <Line options={options} data={data}/> :
          <div className="flex justify-center align-middle"><Spin/></div>}
      </div>
    </div>
  )
}

export default TopMarketplacesLineChart;
