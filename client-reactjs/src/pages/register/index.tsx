import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { Button, Form, Input, message } from "antd";
import { register } from "./api";
import { useState } from "react";
import RegisterSchema, { RegisterFormValues } from "../../schemas/registerSchema";
import { Link, useNavigate } from "react-router-dom";

const RegisterPage = () => {
    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(RegisterSchema),
    });
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const handleRegister = (data: RegisterFormValues) => {
        setIsLoading(true)
        register(data)
            .then(() => {
                message.success("User created successfully")
                navigate("/login")
            })
            .catch(err => {
                if (err?.status == 401) {
                    message.error(err?.response?.data?.message)
                }
                console.log(err)
            })
            .finally(() => setIsLoading(false))
    }

    return (

        <section className="flex flex-col items-center mt-20 max-w-2xl mx-auto">
            <img src="/logo.jpg" />
            <Form onFinish={handleSubmit(handleRegister)} layout="vertical" className="w-full max-w-xl mx-auto">
                <Form.Item
                    validateStatus={errors.fullName ? 'error' : ''}
                    help={errors.fullName?.message}
                >
                    <p className='mb-2 font-medium text-textBold'>Full Name</p>
                    <Controller
                        name="fullName"
                        control={control}
                        render={({ field }) => <Input {...field} placeholder="Enter full name number" className='h-12' />}
                    />
                </Form.Item>
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
                        Sign Up
                    </Button>
                </Form.Item>
                <p>You have account <Link to="/register">Sign in</Link></p>
            </Form>
        </section>

    )
}

export default RegisterPage