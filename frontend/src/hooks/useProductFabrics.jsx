import {useEffect, useState} from "react";
import useAxiosClient from "../axios-client";
import {toast} from "react-toastify";
import {useStateContext} from "../contexts/ContextProvider";

export const useProductFabrics = () => {

  const axiosClient = useAxiosClient();
  const [productFabrics, setProductFabrics] = useState([]);
  const [productFabricsLoading, setProductFabricsLoading] = useState(false);

  const fetchProductFabrics = () => {
      setProductFabricsLoading(true);
    axiosClient.get(`/settings/fabrics/index`).then((response) => {
      setProductFabrics([...response.data.data])
        setProductFabricsLoading(false)
    }).catch((error) => {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      setProductFabricsLoading(false)
      toast.error(message);
    });
  }
  useEffect(()=> {
    fetchProductFabrics();
  },[])

  return {productFabrics, productFabricsLoading, fetchProductFabrics}
}
