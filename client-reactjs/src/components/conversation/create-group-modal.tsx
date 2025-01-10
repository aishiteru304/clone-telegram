import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Form, Input, message, Modal } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import SearchSchema, { SearchValues } from '../../schemas/searchSchema';
import { useEffect, useState } from 'react';
import React from 'react';
import { IoMdCloseCircleOutline } from "react-icons/io";
import socket from '../../socket';
import useLocalStorage from '../../hooks/useLocalStorage';
import { ACCESSTOKEN_KEY } from '../../app/constant';

const CreateGroupModal = ({ isShowGroupModal, onClose }: { isShowGroupModal: boolean, onClose: () => void }) => {

    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(SearchSchema),
    });
    const [phoneMember, setPhoneMember] = useState<string[]>([])
    const { getLocalStorage } = useLocalStorage()
    const accessToken = getLocalStorage(ACCESSTOKEN_KEY)

    const handleAddMember = (data: SearchValues) => {
        setPhoneMember((prev) => Array.from(new Set([...prev, data.phone])));
        reset()
    }

    useEffect(() => {
        // Lắng nghe sự kiện lỗi nếu có
        socket.on('error', (error) => {
            if (error.status == 400) {
                message.error(error?.message)
            }
        });
    }, [])

    const handleCreateGroup = () => {
        if (!accessToken) return
        socket.emit("createGroupConversation", { phones: phoneMember, accessToken: accessToken.accessToken })
        onClose()
        setPhoneMember([])
    }

    const handleDeletePhone = (phone: string) => {
        setPhoneMember((prev) => prev.filter((item) => item !== phone));
    }

    return (
        <Modal
            open={isShowGroupModal}
            footer={
                <div className="flex justify-end">

                    <Button type="primary" onClick={handleCreateGroup}>
                        Create
                    </Button>
                </div>
            }
            onCancel={onClose}
            title="Create Group"
        >
            <Form onFinish={handleSubmit(handleAddMember)} layout="vertical" className="items-center mt-6 flex-grow relative">
                <Form.Item
                    validateStatus={errors.phone ? 'error' : ''}
                    help={errors.phone?.message}
                >
                    <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => <Input {...field} placeholder="Enter phone number..." className='h-12' />}
                    />
                </Form.Item>

                <Form.Item className=" absolute top-0 right-0">
                    <Button type="primary" htmlType="submit" className='h-12'>
                        Add Member
                    </Button>
                </Form.Item>
            </Form>

            <React.Fragment>
                {
                    phoneMember.map((phone, index) => (
                        <li key={index} className='flex justify-between py-2'>
                            <p> {phone}</p>
                            <IoMdCloseCircleOutline className='text-xl cursor-pointer' onClick={() => handleDeletePhone(phone)} />
                        </li>
                    ))
                }
            </React.Fragment>
        </Modal>
    )
}

export default CreateGroupModal