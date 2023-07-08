import {useCallback, useEffect, useState} from "react";
import useAxiosClient from "../axios-client";
import {toast} from "react-toastify";

export const useFabrics = () => {

    const axiosClient = useAxiosClient();

    const [fabrics, setFabrics] = useState([]);
    const [fabricsLoading, setFabricsLoading] = useState(false);

    const fetchFabrics = useCallback(async () => {
        setFabricsLoading(true);
        await axiosClient.get(`/settings/fabrics/index`).then((response) => {
            setFabrics([...response.data])
        }).catch((error) => {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            toast.error(message);
        }).finally(() => {
            setFabricsLoading(false)
        });
    }, [axiosClient])

    useEffect(() => {
        fetchFabrics();
    }, [fetchFabrics])

    return {fabrics, fabricsLoading, fetchFabrics}
}
