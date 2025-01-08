import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Form, Input, Modal } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import SearchSchema, { SearchValues } from '../../schemas/searchSchema';
import { useState } from 'react';
import React from 'react';
import { IoMdCloseCircleOutline } from "react-icons/io";

const CreateGroupModal = ({ isShowGroupModal, onClose }: { isShowGroupModal: boolean, onClose: () => void }) => {

    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(SearchSchema),
    });
    const [phoneMember, setPhoneMember] = useState<string[]>([])

    const handleAddMember = (data: SearchValues) => {
        setPhoneMember((prev) => Array.from(new Set([...prev, data.phone])));
        reset()
    }

    const handleCreateGroup = () => {
        console.log(phoneMember)
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