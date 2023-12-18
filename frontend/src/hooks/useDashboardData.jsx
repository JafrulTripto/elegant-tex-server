import {useEffect, useState} from "react";
import useAxiosClient from "../axios-client";
import {toast} from "react-toastify";

export const useDashboardData = () => {

  const axiosClient = useAxiosClient();
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardDataLoading, setDashboardDataLoading] = useState(false);


  useEffect(() => {
    const fetchOrderCounts = () => {
      setDashboardDataLoading(true);
      axiosClient.get(`/dashboard/getDashboardData`).then((response) => {
        setDashboardData(response.data)
        setDashboardDataLoading(false);
      }).catch((error) => {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        setDashboardDataLoading(false)
        toast.error(message);
      });
    }
    fetchOrderCounts();
  }, [axiosClient])

  return {dashboardData, dashboardDataLoading}
}
