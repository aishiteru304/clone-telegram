import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Conversation } from 'src/conversations/schemas/conversation.schema';
import { TypeMessage } from 'src/enums/type-message.enum';
import { User } from 'src/user/schemas/user.schema';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true })
export class Message {

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' })
    conversationId: Conversation;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    sender: User;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
    receiver: User[];

    @Prop({ enum: TypeMessage })
    type: TypeMessage

    @Prop()
    message: string;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
    seen: User[];

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
    blocker: User[];

}

export const MessageSchema = SchemaFactory.createForClass(Message);