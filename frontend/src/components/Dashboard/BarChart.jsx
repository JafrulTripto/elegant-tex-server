import React, {useEffect, useState} from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {Bar} from 'react-chartjs-2';
import useAxiosClient from "../../axios-client";
import {Spin} from "antd";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


const BarChart = () => {
  const [chartData, setChartData] = useState({});
  const [chartDataLoading, setChartDataLoading] = useState(false);
  const axiosClient = useAxiosClient();

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

  const labels = Object.keys(chartData);

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
          stepSize: 10, // Set the step size to 1 to display integers only
        },
      },
    },

  };

  const data = {
    labels,
    datasets: [
      {
        label: "Order",
        data: Object.values(chartData),
        backgroundColor: '#1D5D9B',
        borderColor: ''
      },
    ],
  };
  return (!chartDataLoading ? <Bar options={options} data={data}/> : <div className="flex justify-center align-middle"><Spin/></div>);
}

export default BarChart;
