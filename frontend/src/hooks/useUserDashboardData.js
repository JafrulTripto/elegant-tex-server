import {useEffect, useState} from "react";
import useAxiosClient from "../axios-client";
import {toast} from "react-toastify";
import {useStateContext} from "../contexts/ContextProvider";

export const useUserDashboardData = () => {

  const axiosClient = useAxiosClient();
  const [userDashboardData, setDashboardData] = useState(null);
  const [userDashboardDataLoading, setDashboardDataLoading] = useState(false);
  const {user} = useStateContext();

  useEffect(() => {
    const fetchOrderCounts = () => {
      setDashboardDataLoading(true);
      axiosClient.get(`/dashboard/getUserOrderStats?id=${user.id}`).then((response) => {
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

  return {userDashboardData, userDashboardDataLoading}
}
