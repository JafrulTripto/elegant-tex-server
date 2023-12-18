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
import {Spin, Radio} from "antd";

ChartJS.register(
  CategoryScale,
  LinearScale,
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

  const switchOptions = [
    {label: 'Monthly', value: 'month'},
    {label: 'Yearly', value: 'year'},
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

  const onChangeSwitch = ({target: {value}}) => {
    setSwitchValue(value);
  };

  // Extract data from the chartData state
  const labels = chartData.map((item) => item.marketplace_name);
  const data = chartData.map((item) => item.total_orders);

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

  const barChartData = {
    labels,
    datasets: [
      {
        label: "Order",
        data: data,
        backgroundColor: '#ffc300',
        borderColor: "#fca311",
      },
    ],
  };
  return (
      <div className="bg-white rounded-lg shadow-md p-5">
        <div className="flex flex-row justify-between">
          <div>
            <h5
                className="mb-2 text-xl font-medium leading-tight text-neutral-800">
              Marketplace Order's
            </h5>
          </div>
          <div>
            <Radio.Group
                options={switchOptions}
                onChange={onChangeSwitch}
                value={switchValue}
                optionType="button"
                buttonStyle="solid"
            />
          </div>
        </div>

        <div style={{height: "500px"}}>
          <div className="flex justify-between">


          </div>

          {!chartDataLoading ? <Bar options={options} data={barChartData}/> :  <div className="flex justify-center align-middle"><Spin/></div>}
        </div>
      </div>

   );
}

export default MarketplaceOrdersChart;
