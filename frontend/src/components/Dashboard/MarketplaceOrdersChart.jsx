import React, {useEffect, useState} from 'react';
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
import {Doughnut} from 'react-chartjs-2';
import useAxiosClient from "../../axios-client";
import {Spin, Radio} from "antd";

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

  const generateColors = (numColors) => {
    const baseColors = [
      { r: 246, g: 114, b: 128 }, // rgb(246, 114, 128)
      { r: 63, g: 114, b: 175 },  // rgb(63, 114, 175)
      { r: 202, g: 247, b: 227 }, // rgb(202, 247, 227)
      { r: 201, g: 182, b: 228 }, // rgb(201, 182, 228)
      { r: 251, g: 168, b: 52 },  // rgb(251, 168, 52)
    ];

    const shadesPerColor = Math.ceil(numColors / baseColors.length);
    const colors = [];

    for (let i = 0; i < numColors; i++) {
      const baseColor = baseColors[Math.floor(i / shadesPerColor)];
      const shadeFactor = (i % shadesPerColor) * 20; // Larger increment for more differentiable shades

      // Calculate new color values, ensuring they are within valid range
      const r = Math.max(0, Math.min(255, baseColor.r - shadeFactor));
      const g = Math.max(0, Math.min(255, baseColor.g - shadeFactor));
      const b = Math.max(0, Math.min(255, baseColor.b - shadeFactor));

      // Calculate opacity based on shadeFactor for more differentiation
      const opacity = 1 - (shadeFactor / 255);
      const color = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      colors.push(color);
    }

    return colors;
  };



  // Extract data from the chartData state
  const labels = chartData.map((item) => item.marketplace_name);
  const data = chartData.map((item) => item.total_orders);
  const backgroundColor = generateColors(labels.length);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: false,
        text: "Order's this Month",
      },
    }

  };

  const barChartData = {
    labels,
    datasets: [
      {
        label: "Order",
        data: data,
        hoverOffset: 4,
        backgroundColor: backgroundColor
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
            />
          </div>
        </div>

        <div style={{height: "400px"}}>
          <div className="flex justify-between">


          </div>

          {!chartDataLoading ? <Doughnut options={options} data={barChartData}/> :  <div className="flex justify-center align-middle"><Spin/></div>}
        </div>
      </div>

   );
}

export default MarketplaceOrdersChart;
