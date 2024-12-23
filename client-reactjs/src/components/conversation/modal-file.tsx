import { Button, Modal } from 'antd'

const ModalFile = ({ file, isShowModal, onClose }: { file: File | null, isShowModal: boolean, onClose: () => void }) => {

    const handleSendFile = () => {
        if (file) {
            console.log('Gửi file:', file);
            onClose()
        }
    };

    return (
        <Modal
            open={isShowModal}
            footer={
                <div className="flex justify-end">
                    <Button type="primary" onClick={handleSendFile}>
                        Send
                    </Button>
                </div>
            }
            onCancel={onClose}
            title="File Preview"
        >
            {file?.type?.startsWith('image/') && (
                <img src={URL.createObjectURL(file)!} alt="Preview" className="w-24 h-auto mx-auto" />
            )}
            {file?.type?.startsWith('video/') && (
                <video src={URL.createObjectURL(file)!} controls className="w-full h-auto" />
            )}
        </Modal>
    )
}

export default ModalFile