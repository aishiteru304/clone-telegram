import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';

export type NotifyDocument = HydratedDocument<Notify>;

@Schema()
export class Notify {

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    user: User;

    @Prop({
        type: [
            {
                conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
                amount: { type: Number },
            },
        ],
    })
    conversation: { conversationId: mongoose.Types.ObjectId; amount: number }[];

    @Prop({ default: 0 })
    requestFriend: number;
}

export const NotifySchema = SchemaFactory.createForClass(Notify);