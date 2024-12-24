import axiosWithHeader from "../../axiosConfig";
import { SearchValues } from "../../schemas/searchSchema";

export const getIdByPhoneNumber = (data: SearchValues) => {
    return axiosWithHeader.get(`/user/information/id/${data.phone}`)
}

export const getConversations = () => {
    return axiosWithHeader.get(`/conversations`)
}

export const getConversationByMembers = (userIds: string[]) => {
    return axiosWithHeader.post(`/conversations/members`, { userIds })
}

export const getInformations = () => {
    return axiosWithHeader.get(`/user/information`)
}

export const getNotifications = () => {
    return axiosWithHeader.get(`notification`)
}