import axiosWithHeader from "../../axiosConfig"

export const getInformationById = (id: string) => {
    return axiosWithHeader.get(`/user/information/${id}`)
}