import { useCallback, useEffect, useState } from "react";
import useAxiosClient from "../axios-client";
import { toast } from "react-toastify";

export const useFabricTypes = () => {

    const axiosClient = useAxiosClient();
    const [fabricTypes, setFabricTypes] = useState([]);
    const [fabricTypesLoading, setFabricTypesLoading] = useState(false);

    const fetchFabricTypes = useCallback(async () => {
        setFabricTypesLoading(true);
        await axiosClient.get(`/settings/fabricTypes/index`).then((response) => {
            setFabricTypes([...response.data.data])
            setFabricTypesLoading(false);
        }).catch((error) => {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            setFabricTypesLoading(false);
            toast.error(message);
        });
    }, [axiosClient])

    useEffect(() => {
        fetchFabricTypes();
    }, [fetchFabricTypes])

    return { fabricTypes, fabricTypesLoading, fetchFabricTypes }
}
