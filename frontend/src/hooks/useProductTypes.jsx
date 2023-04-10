import {useEffect, useState} from "react";
import useAxiosClient from "../axios-client";
import {toast} from "react-toastify";
import {useStateContext} from "../contexts/ContextProvider";

export const useProductTypes = () => {

  const axiosClient = useAxiosClient();
  const [productTypes, setProductTypes] = useState([]);
  const {user} = useStateContext();

  const fetchProductTypes = () => {
    axiosClient.get(`/settings/productTypes/index`).then((response) => {
      setProductTypes([...response.data.data])
    }).catch((error) => {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      toast.error(message);
    });
  }
  useEffect(()=> {
    fetchProductTypes();
  },[])

  return {productTypes}
}
