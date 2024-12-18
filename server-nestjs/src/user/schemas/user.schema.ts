import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ACCOUNT_ROLE } from 'src/enums/user-status-role';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
    @Prop({ required: true })
    fullName: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true, enum: ACCOUNT_ROLE, default: ACCOUNT_ROLE.USER })
    role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);