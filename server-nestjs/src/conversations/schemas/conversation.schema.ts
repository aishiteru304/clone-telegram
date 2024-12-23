import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({ timestamps: true })
export class Conversation {
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
    members: User[];

    @Prop({ default: 0 })
    amountMessages: number


    @Prop({ default: false })
    isBlock: boolean

    @Prop({ default: "" })
    name: string
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);