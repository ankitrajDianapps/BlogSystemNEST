import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsNotEmpty, IsString } from "class-validator";
import mongoose, { Document } from "mongoose";

@Schema()
export class Otp extends Document {

    @Prop({ type: String, required: true })
    otp: string

    @Prop({ type: mongoose.Types.ObjectId, required: true })
    userId: mongoose.Types.ObjectId;

    @Prop({ type: Boolean, required: true })
    isVerified: boolean

    @Prop({ type: Date, required: true, expires: 0 })
    expireAt: Date

}

export const OtpSchema = SchemaFactory.createForClass(Otp)