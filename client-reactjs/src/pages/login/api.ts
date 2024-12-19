import axiosWithHeader from "../../axiosConfig";
import { LoginFormValues } from "../../schemas/loginSchema";

export const login = (data: LoginFormValues) => {
    return axiosWithHeader.post("/user/login", { phone: data.phone, password: data.password })
}