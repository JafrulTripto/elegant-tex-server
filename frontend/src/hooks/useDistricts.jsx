import { useEffect, useState } from "react";
import useAxiosClient from "../axios-client";
import { toast } from "react-toastify";

export const useDistricts = (divisionId) => {
  const axiosClient = useAxiosClient();
  const [districts, setDistricts] = useState([]);
  const [districtLoading, setDistrictLoading] = useState(false);

  useEffect(() => {
    if (divisionId) {
      setDistrictLoading(true);
      axiosClient
        .get(`/getDistrictsByDivision?divisionId=${divisionId}`)
        .then((response) => {
          setDistricts([...response.data]);
          setDistrictLoading(false);
        })
        .catch((error) => {
          const message =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();
          toast.error(message);
          setDistrictLoading(false);
        });
    } else {
      setDistricts([]);
    }
  }, [divisionId]);

  return { districts, districtLoading };
};
