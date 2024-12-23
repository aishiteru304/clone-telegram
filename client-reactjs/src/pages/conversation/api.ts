import axiosWithHeader from "../../axiosConfig"

export const getConversationById = (id: string) => {
    return axiosWithHeader.get(`/conversations/${id}`)
}