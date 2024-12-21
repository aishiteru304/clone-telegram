import * as Yup from 'yup';

const SearchSchema = Yup.object().shape({
    phone: Yup.string()
        .matches(/^[0-9]{10}$/, 'Số điện thoại không hợp lệ') // Chỉ chấp nhận 10 chữ số
        .required('Vui lòng nhập số điện thoại'),
});

export type SearchValues = Yup.InferType<typeof SearchSchema>;
export default SearchSchema