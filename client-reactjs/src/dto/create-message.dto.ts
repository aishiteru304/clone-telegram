export interface CreateMessageDto {
    conversationId: string;

    senderId: string;

    receiverIds: string[];

    type: string;

    message: string;

}