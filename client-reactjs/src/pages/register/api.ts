import axiosWithHeader from "../../axiosConfig";
import { RegisterFormValues } from "../../schemas/registerSchema";

export const register = (data: RegisterFormValues) => {
    return axiosWithHeader.post("/user/register", { fullName: data.fullName, phone: data.phone, password: data.password })
}