import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class User extends Document {

    @Prop({
        required: true, trim: true, unique: true, type: String
    })
    userName: string;

    @Prop({ required: true, trim: true, lowercase: true, type: String, unique: true })
    email: string

    @Prop({ required: true, select: false, type: String })
    password: string;

    @Prop({ required: true, trim: true, type: String })
    fullName: string;

    @Prop({ trim: true, type: String })
    bio: string;

    @Prop({ enum: ["user", "admin", "author"], required: true, lowercase: true, type: String })
    role: string;

    @Prop({ trim: true, type: String })
    avatar: string;

    @Prop({ type: Date })
    lastLogin: Date
}

export const UserSchema = SchemaFactory.createForClass(User)