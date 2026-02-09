import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { mongo } from "mongoose";

@Schema({ timestamps: true })
export class TrendingPost {

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true, index: true })
    post: mongoose.Types.ObjectId;

    @Prop({ type: Date, required: true, index: true })
    trendingAt: Date;

    @Prop({ type: Number })
    total_views_on_trending_day: Number
}


export const TrendingPostSchema = SchemaFactory.createForClass(TrendingPost)