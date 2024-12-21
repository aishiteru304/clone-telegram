import axiosWithHeader from "../../axiosConfig";
import { SearchValues } from "../../schemas/searchSchema";

export const getIdByPhoneNumber = (data: SearchValues) => {
    return axiosWithHeader.get(`/user/information/id/${data.phone}`)
}