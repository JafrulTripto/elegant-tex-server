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
import {Radio, Spin} from "antd";

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
  const switchOptions = [
    {label: 'Order', value: 'order'},
    {label: 'Amount', value: 'amount'},
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

  const onChangeSwitch = ({target: {value}}) => {
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
          stepSize: switchValue === 'order' ? 10 : 20000, // Set the step size to 1 to display integers only
        },
      },
    },

  };

  const data = {
    labels,
    datasets: [
      {
        label: switchValue,
        data: getValues(chartData),
        backgroundColor: 'rgb(65, 179, 162, 0.3)',
        borderColor: '#41B3A2',
        borderWidth:1
      },
    ],
  };
  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <div className="flex flex-row justify-between">
        <div>
          <h5 className="mb-2 text-xl font-medium leading-tight text-neutral-800">
            Orders this Month
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
      <div className="" style={{height: "400px"}}>
        {!chartDataLoading ? <Bar options={options} data={data}/> :
          <div className="flex justify-center align-middle"><Spin/></div>}
      </div>
    </div>
  );
}

export default OrderBarChart;
