import {useEffect, useState} from "react";
import useAxiosClient from "../axios-client";
import {toast} from "react-toastify";
import {useStateContext} from "../contexts/ContextProvider";

export const useMerchants = () => {

  const axiosClient = useAxiosClient();
  const [merchants, setMerchants] = useState([]);
  const [isMerchantLoading, setIsMerchantLoading] = useState(true);

  const {user, permissions} = useStateContext();

  const fetchMerchants = () => {

    setIsMerchantLoading(true);
    axiosClient.get(`/merchants/getMerchants`).then((response) => {
      setMerchants([...response.data.data])
      setIsMerchantLoading(false);
    }).catch((error) => {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      toast.error(message);
      setIsMerchantLoading(false);
    });
  }
  useEffect(() => {
    if (permissions.includes("VIEW_MERCHANTS")){
      fetchMerchants();
    }

  }, [])

  return {merchants, isMerchantLoading};
}
