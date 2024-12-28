import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Conversation } from 'src/conversations/schemas/conversation.schema';
import { User } from 'src/user/schemas/user.schema';

export type NotifyDocument = HydratedDocument<Notify>;

@Schema()
export class Notify {

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    user: User;

    @Prop({
        type: [
            { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
        ],
    })
    conversation: Conversation[];

    @Prop({ default: 0 })
    requestFriend: number;
}

export const NotifySchema = SchemaFactory.createForClass(Notify);