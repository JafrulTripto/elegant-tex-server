import axios from "axios";
import { useMemo, useRef } from "react";
import { useStateContext } from "./contexts/ContextProvider.jsx";

const useAxiosClient = () => {
  const { setToken } = useStateContext();
  const isRefreshing = useRef(false);

  const axiosClient = useMemo(() => {
    const client = axios.create({
      baseURL: `${process.env.REACT_APP_API_BASE_URL}`
    });

    // Helper function inside useMemo to capture closure of client and isRefreshing
    const checkAndRefreshToken = async () => {
      if (isRefreshing.current) return;

      try {
        const expiryTime = localStorage.getItem("TOKEN_EXPIRATION");
        const storedToken = localStorage.getItem("ACCESS_TOKEN");

        if (!expiryTime || !storedToken) return;

        const timeLeft = new Date(expiryTime) - new Date();
        const fifteenMinutesInMs = 15 * 60 * 1000;

        if (timeLeft < fifteenMinutesInMs) {
          isRefreshing.current = true;
          // Use the current client instance
          const res = await client.post("/auth/refresh");
          setToken(res.data.access_token, res.data.expires_in);
        }
      } catch (error) {
        setToken(null);
      } finally {
        isRefreshing.current = false;
      }
    };

    client.interceptors.request.use((config) => {
      const storedToken = localStorage.getItem('ACCESS_TOKEN');
      if (storedToken) {
        config.headers.Authorization = `Bearer ${storedToken}`;
      }
      return config;
    })

    client.interceptors.response.use((res) => {
      // If we just got a successful response (and it wasn't the refresh call itself)
      // Check if we need to rotate the token proactively
      if (res.config.url !== '/auth/refresh') {
        checkAndRefreshToken();
      }
      return res;
    }, (error) => {
      try {
        const { response } = error;
        if (response && response.status === 401) {
          setToken(null);
        }
      } catch (e) {
        console.error(e);
      }
      throw error;
    })

    return client;
  }, [setToken]);

  return axiosClient;
};

export default useAxiosClient;
