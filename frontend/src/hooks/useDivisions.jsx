import {useCallback, useEffect, useState} from "react";
import useAxiosClient from "../axios-client";
import { toast } from "react-toastify";

export const useDivisions = () => {

  const axiosClient = useAxiosClient();
  const [divisions, setDivisions] = useState([]);
  const [divisionLoading, setDivisionLoading] = useState(false);

  const fetchDivisions = useCallback(() => {
      setDivisionLoading(true);
      axiosClient
          .get(`/getDivisions`)
          .then((response) => {
              setDivisions([...response.data]);
              setDivisionLoading(false);
          })
          .catch((error) => {
              const message =
                  (error.response && error.response.data && error.response.data.message) ||
                  error.message ||
                  error.toString();
              toast.error(message);
              setDivisionLoading(false);
          });
  },[axiosClient])

  useEffect(() => {
    fetchDivisions();
  }, [fetchDivisions]);

  return { divisions, divisionLoading };
};
