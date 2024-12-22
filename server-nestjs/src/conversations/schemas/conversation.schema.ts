import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema()
export class Conversation {
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
    members: User[];

    @Prop({ default: false })
    seen: boolean

    @Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } })
    memberFinally: User;

    @Prop({ default: false })
    isBlock: boolean
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);