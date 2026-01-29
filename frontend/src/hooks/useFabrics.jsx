import { useCallback, useEffect, useState, useRef } from "react";
import useAxiosClient from "../axios-client";
import { toast } from "react-toastify";

export const useFabrics = () => {

    const axiosClient = useAxiosClient();

    const [fabrics, setFabrics] = useState([]);
    const [fabricsLoading, setFabricsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const searchQueryRef = useRef('');

    const fetchFabrics = useCallback(async (pageNumber = 1, search = null) => {
        setFabricsLoading(true);

        if (pageNumber === 1 && typeof search === 'string') {
            searchQueryRef.current = search;
        }

        const currentSearch = (pageNumber === 1 && typeof search === 'string') ? search : searchQueryRef.current;

        try {
            const url = currentSearch
                ? `/settings/fabrics/index?page=${pageNumber}&search=${currentSearch}`
                : `/settings/fabrics/index?page=${pageNumber}`;

            const response = await axiosClient.get(url);
            const newFabrics = response.data.data || [];

            if (pageNumber === 1) {
                setFabrics(newFabrics);
                setPage(1);
            } else {
                setFabrics(prev => [...prev, ...(newFabrics || [])]);
                setPage(pageNumber);
            }

            setHasMore(!!response.data.next_page_url);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            // toast.error(message);
        } finally {
            setFabricsLoading(false);
        }
    }, [axiosClient]);

    const loadMore = useCallback(() => {
        if (!fabricsLoading && hasMore) {
            fetchFabrics(page + 1);
        }
    }, [fabricsLoading, hasMore, page, fetchFabrics]);

    useEffect(() => {
        fetchFabrics(1);
    }, [fetchFabrics]);

    return { fabrics, fabricsLoading, fetchFabrics, loadMore, hasMore, setFabrics };
}
