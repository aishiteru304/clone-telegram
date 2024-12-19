import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useLocalStorage from "./useLocalStorage";
import { ACCESSTOKEN_KEY, INFORMATION_KEY } from "../app/constant";


const useHandleResponseError = () => {
    const navigate = useNavigate();
    const { removeLocalStorage } = useLocalStorage()

    const handleResponseError = useCallback((err: any) => {
        if (err?.status == 401) {
            removeLocalStorage(ACCESSTOKEN_KEY)
            removeLocalStorage(INFORMATION_KEY)
            navigate("/login")
        }
        console.log(err)
    }, [])

    return handleResponseError;
};

export default useHandleResponseError;
