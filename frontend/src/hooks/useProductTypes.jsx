import {useCallback, useEffect, useState} from "react";
import useAxiosClient from "../axios-client";
import {toast} from "react-toastify";

export const useProductTypes = () => {

    const axiosClient = useAxiosClient();
    const [productTypes, setProductTypes] = useState([]);
    const [productTypesLoading, setProductTypesLoading] = useState(false);

    const fetchProductTypes = useCallback(async () => {
        setProductTypesLoading(true);
        await axiosClient.get(`/settings/productTypes/index`).then((response) => {
            setProductTypes([...response.data.data])
            setProductTypesLoading(false);
        }).catch((error) => {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            setProductTypesLoading(false);
            toast.error(message);
        });
    }, [axiosClient])

    useEffect(() => {
        fetchProductTypes();
    }, [fetchProductTypes])

    return {productTypes, productTypesLoading, fetchProductTypes}
}
