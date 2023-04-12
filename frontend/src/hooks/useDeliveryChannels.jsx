import {useEffect, useState} from "react";
import useAxiosClient from "../axios-client";
import {toast} from "react-toastify";

export const useDeliveryChannels = () => {

  const axiosClient = useAxiosClient();

  const [deliveryChannels, setDeliveryChannels] = useState([]);
  const [deliveryChannelsLoading, setDeliveryChannelsLoading] = useState(false);

  const fetchDeliveryChannels = () => {
      setDeliveryChannelsLoading(true);
    axiosClient.get(`/settings/deliveryChannels/index`).then((response) => {
      setDeliveryChannels([...response.data.data])
        setDeliveryChannelsLoading(false);
    }).catch((error) => {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      setDeliveryChannelsLoading(false);
      toast.error(message);
    });
  }
  useEffect(()=> {
      fetchDeliveryChannels();
  },[])

  return {deliveryChannels, deliveryChannelsLoading, fetchDeliveryChannels}
}
