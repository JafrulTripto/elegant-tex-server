import {useCallback, useEffect, useState} from "react";
import useAxiosClient from "../axios-client";
import {toast} from "react-toastify";

export const useMaterials = () => {

    const axiosClient = useAxiosClient();

    const [materials, setMaterials] = useState([]);
    const [materialsLoading, setMaterialsLoading] = useState(false);

    const fetchMaterials = useCallback(async () => {
        setMaterialsLoading(true);
        await axiosClient.get(`/settings/materials/index`).then((response) => {
            setMaterials([...response.data])
        }).catch((error) => {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            toast.error(message);
        }).finally(() => {
            setMaterialsLoading(false)
        });
    }, [axiosClient])

    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials])

    return {materials, materialsLoading, fetchMaterials}
}
