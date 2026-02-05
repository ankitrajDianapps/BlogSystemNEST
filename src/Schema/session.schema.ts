import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { Document } from "mongoose";

@Schema()
export class Session extends Document {

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
    userId: mongoose.Types.ObjectId;

    @Prop({ required: true, type: String })
    refreshToken: string;

    @Prop({ default: true, type: Boolean })
    isValid: Boolean;

    @Prop({ type: String })
    IpAddress: string;


}

export const SessionSchema = SchemaFactory.createForClass(Session)