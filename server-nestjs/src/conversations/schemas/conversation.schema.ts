import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { TypeConversation } from 'src/enums/type-conversation.enum';
import { Message } from 'src/message/schemas/message.schema';
import { User } from 'src/user/schemas/user.schema';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({ timestamps: true })
export class Conversation {
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
    members: User[];

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }] })
    messages: Message[];

    @Prop({ default: false })
    isBlock: boolean

    @Prop({ default: "" })
    name: string;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
    hidden: User[];

    @Prop({ default: "" })
    background: string;

    @Prop({ enum: TypeConversation })
    type: TypeConversation;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);