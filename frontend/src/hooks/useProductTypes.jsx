import {useEffect, useState} from "react";
import useAxiosClient from "../axios-client";
import {toast} from "react-toastify";
import {useStateContext} from "../contexts/ContextProvider";

export const useProductTypes = () => {

    const axiosClient = useAxiosClient();
    const [productTypes, setProductTypes] = useState([]);
    const [productTypesLoading, setProductTypesLoading] = useState(false);

    const fetchProductTypes = () => {
        setProductTypesLoading(true);
        axiosClient.get(`/settings/productTypes/index`).then((response) => {
            setProductTypes([...response.data.data])
            setProductTypesLoading(false);
        }).catch((error) => {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            setProductTypesLoading(false);
            toast.error(message);
        });
    }
    useEffect(() => {
        fetchProductTypes();
    }, [])

    return {productTypes, productTypesLoading, fetchProductTypes}
}
