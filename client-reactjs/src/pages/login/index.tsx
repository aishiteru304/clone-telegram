import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import LoginSchema, { LoginFormValues } from "../../schemas/loginSchema";
import { Button, Form, Input, message } from "antd";
import { login } from "./api";
import useLocalStorage from "../../hooks/useLocalStorage";
import { ACCESSTOKEN_KEY, INFORMATION_KEY } from "../../app/constant";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LoginPage = () => {
    const { setLocalStorage, getLocalStorage } = useLocalStorage()
    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(LoginSchema),
    });
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const handleLogin = (data: LoginFormValues) => {
        setIsLoading(true)
        login(data)
            .then(res => {
                setLocalStorage({ value: { accessToken: res.data.data.accessToken }, key: ACCESSTOKEN_KEY })
                setLocalStorage({ value: { userId: res.data.data.id, fullName: res.data.data.fullName }, key: INFORMATION_KEY })
                window.location.href = "/"
            })
            .catch(err => {
                if (err?.status == 401) {
                    message.error(err?.response?.data?.message)
                }
                console.log(err)
            })
            .finally(() => setIsLoading(false))
    }

    useEffect(() => {
        const accessToken = getLocalStorage(ACCESSTOKEN_KEY)
        if (accessToken) {
            navigate("/")
        }
    }, [])

    return (

        <section className="flex flex-col items-center mt-20 max-w-2xl mx-auto">
            <img src="/logo.jpg" />
            <Form onFinish={handleSubmit(handleLogin)} layout="vertical" className="w-full max-w-xl mx-auto">
                <Form.Item
                    validateStatus={errors.phone ? 'error' : ''}
                    help={errors.phone?.message}
                >
                    <p className='mb-2 font-medium text-textBold'>Phone</p>
                    <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => <Input {...field} placeholder="Enter phone number" className='h-12' />}
                    />
                </Form.Item>

                <Form.Item
                    validateStatus={errors.password ? 'error' : ''}
                    help={errors.password?.message}
                >
                    <p className='mb-2 font-medium text-textBold'>Password</p>
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => <Input.Password {...field} placeholder="Enter password" className='h-12' />}
                    />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block className='h-12' loading={isLoading}>
                        Sign In
                    </Button>
                </Form.Item>
                <p>Dont have a account <Link to="/register">Sign up</Link></p>
            </Form>
        </section>

    )
}

export default LoginPage