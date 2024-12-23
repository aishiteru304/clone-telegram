import * as Yup from 'yup';

const RegisterSchema = Yup.object().shape({
    fullName: Yup.string().required('Vui lòng nhập fullName'),
    phone: Yup.string()
        .matches(/^[0-9]{10}$/, 'Số điện thoại không hợp lệ') // Chỉ chấp nhận 10 chữ số
        .required('Vui lòng nhập số điện thoại'),
    password: Yup.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').required('Vui lòng nhập mật khẩu'),
});

export type RegisterFormValues = Yup.InferType<typeof RegisterSchema>;
export default RegisterSchema