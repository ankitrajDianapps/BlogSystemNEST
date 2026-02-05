import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { mongo } from "mongoose";


@Schema()
export class Like extends Document {

    @Prop({ required: true, ref: "User", type: mongoose.Schema.Types.ObjectId })
    user: mongoose.Types.ObjectId

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
    postId: mongoose.Types.ObjectId

    @Prop({
        required: true, type: Date
    })
    likedAt: Date

}



export const LikeSchema = SchemaFactory.createForClass(Like)