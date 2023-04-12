import {useEffect, useState} from "react";
import useAxiosClient from "../axios-client";
import {toast} from "react-toastify";
import {useStateContext} from "../contexts/ContextProvider";

export const useProductColors = () => {

    const axiosClient = useAxiosClient();

    const [productColors, setProductColors] = useState([]);
    const [productColorLoading, setProductColorLoading] = useState(false);

    const fetchProductColors = () => {
        setProductColorLoading(true);
        axiosClient.get(`/settings/colors/index`).then((response) => {
            setProductColors([...response.data.data])
        }).catch((error) => {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            toast.error(message);
        }).finally(() => {
            setProductColorLoading(false)
        });
    }
    useEffect(() => {
        fetchProductColors();
    }, [])

    return {productColors, productColorLoading, fetchProductColors}
}
