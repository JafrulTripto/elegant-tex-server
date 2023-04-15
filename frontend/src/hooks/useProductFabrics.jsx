import {useCallback, useEffect, useState} from "react";
import useAxiosClient from "../axios-client";
import {toast} from "react-toastify";
export const useProductFabrics = () => {

  const axiosClient = useAxiosClient();
  const [productFabrics, setProductFabrics] = useState([]);
  const [productFabricsLoading, setProductFabricsLoading] = useState(false);

    const fetchProductFabrics = useCallback(async () => {
        setProductFabricsLoading(true);
        await axiosClient.get(`/settings/fabrics/index`).then((response) => {
            setProductFabrics([...response.data.data])
            setProductFabricsLoading(false)
        }).catch((error) => {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            setProductFabricsLoading(false)
            toast.error(message);
        });
    }, [axiosClient])

  useEffect(()=> {
    fetchProductFabrics();
  },[fetchProductFabrics])

  return {productFabrics, productFabricsLoading, fetchProductFabrics}
}
