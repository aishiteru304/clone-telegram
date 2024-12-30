import { Button, Modal } from 'antd'
import { TypeMessage } from '../../app/enums';
import socket from '../../socket';

const ModalFile = ({ dataModal, isShowModal, onClose, }: { dataModal: any, isShowModal: boolean, onClose: () => void }) => {

    const handleSendFile = () => {

        if (dataModal.file) {
            const reader = new FileReader();

            reader.onload = () => {
                const base64File = reader.result; // File dưới dạng Base64
                const type = dataModal.file?.type?.startsWith('image/') ? TypeMessage.IMAGE : TypeMessage.VIDEO
                const data = { file: base64File, type, conversationId: dataModal.conversationId, accessToken: dataModal.accessToken, receiverIds: dataModal.receiverIds }
                socket.emit('createMessage', data);
            };

            reader.readAsDataURL(dataModal.file);

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
            {dataModal.file?.type?.startsWith('image/') && (
                <img src={URL.createObjectURL(dataModal.file)!} alt="Preview" className="w-24 h-auto mx-auto" />
            )}
            {dataModal.file?.type?.startsWith('video/') && (
                <video src={URL.createObjectURL(dataModal.file)!} controls className="w-full h-auto" />
            )}
        </Modal>
    )
}

export default ModalFile