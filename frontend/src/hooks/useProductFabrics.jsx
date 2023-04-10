import {useEffect, useState} from "react";
import useAxiosClient from "../axios-client";
import {toast} from "react-toastify";
import {useStateContext} from "../contexts/ContextProvider";

export const useProductFabrics = () => {

  const axiosClient = useAxiosClient();
  const [productFabrics, setProductFabrics] = useState([]);
  const {user} = useStateContext();

  const fetchProductFabrics = () => {
    axiosClient.get(`/settings/fabrics/index`).then((response) => {
      setProductFabrics([...response.data.data])
    }).catch((error) => {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      toast.error(message);
    });
  }
  useEffect(()=> {
    fetchProductFabrics();
  },[])

  return {productFabrics}
}
