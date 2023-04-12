import {useEffect, useState} from "react";
import useAxiosClient from "../axios-client";
import {toast} from "react-toastify";

export const useOrderCountToday = () => {

    const axiosClient = useAxiosClient();
    const [orderCountToday, setOrderCountToday] = useState(null);
    const [orderCountLoading, setOrderCountLoading] = useState(false);


    useEffect(() => {
        const fetchOrderCountToday = () => {
            setOrderCountLoading(true);
            axiosClient.get(`/dashboard/getOrderCountToday`).then((response) => {
                setOrderCountToday(response.data)
                setOrderCountLoading(false);
            }).catch((error) => {
                const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
                setOrderCountLoading(false)
                toast.error(message);
            });
        }
        fetchOrderCountToday();
    }, [axiosClient])

    return {orderCountToday, orderCountLoading}
}
