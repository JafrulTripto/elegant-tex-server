import { useCallback, useEffect, useState } from "react";
import useAxiosClient from "../axios-client";
import { toast } from "react-toastify";

// Lightweight teams list (id + name) for populating selects.
export const useTeams = () => {

    const axiosClient = useAxiosClient();
    const [teams, setTeams] = useState([]);
    const [teamsLoading, setTeamsLoading] = useState(false);

    const fetchTeams = useCallback(async () => {
        setTeamsLoading(true);
        try {
            const response = await axiosClient.get(`/settings/teams/options`);
            setTeams([...(response.data.data || [])]);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            toast.error(message);
        } finally {
            setTeamsLoading(false);
        }
    }, [axiosClient]);

    useEffect(() => {
        fetchTeams();
    }, [fetchTeams]);

    return { teams, teamsLoading, fetchTeams };
}
