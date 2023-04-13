import axios from "axios";
import { useMemo } from "react";
import {useStateContext} from "./contexts/ContextProvider.jsx";

const useAxiosClient = () => {
  const {setToken, token} = useStateContext();

  async function refreshToken() {
    try {
      const expiryTime = localStorage.getItem("TOKEN_EXPIRATION");
      const token = localStorage.getItem("ACCESS_TOKEN");

      const timeLeft = new Date(expiryTime) - new Date();
      if (expiryTime && timeLeft < 60 * 15000) {
        const res = await axiosClient.post("/auth/refresh", {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setToken(res.data.access_token, res.data.expires_in);
      }
    } catch (error) {
      setToken(null)
    }
  }

  const axiosClient = useMemo(() => {
    const client = axios.create({
      baseURL: `${process.env.REACT_APP_API_BASE_URL}`
    });

    client.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    })

    client.interceptors.response.use((res) => {
      if (res.config.url !== '/auth/refresh') {
        refreshToken()
      }
      return res;
    }, (error) => {
      try {
        const { response } = error;
        console.log(response.status)
        if (response.status === 401 && response.config.url !== '/auth/refresh') {
          setToken(null);
        }
      } catch (e) {
        console.error(e);
      }
      throw error;
    })

    return client;
  }, []);

  return axiosClient;
};

export default useAxiosClient;
