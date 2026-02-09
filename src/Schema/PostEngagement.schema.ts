import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Mongoose } from "mongoose";

@Schema({ timestamps: true })
export class PostEngagement {

    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
    postId: mongoose.Types.ObjectId;

    @Prop({ type: Date, required: true })
    date: Date;

    @Prop({ type: Number, default: 0 })
    viewCount: Number;

    @Prop({ type: Number, default: 0 })
    commentCount: Number

    @Prop({ type: Number, default: true })
    likeCount: Number
}


export const PostEngagementSchema = SchemaFactory.createForClass(PostEngagement)