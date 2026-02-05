import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Post extends Document {

    @Prop({ required: true, trim: true, type: String })
    title: string;

    @Prop({ required: true, trim: true, unique: true, type: String })
    slug: string;

    @Prop({ required: true, trim: true, type: String })
    content: string;

    @Prop({ trim: true, type: String })
    excerpt: string;

    @Prop({ ref: "User", required: true, type: mongoose.Schema.Types.ObjectId })
    author: mongoose.Types.ObjectId;

    @Prop({
        enum: ["draft", "published", "archived"], default: "published", type: String
    })
    status: string;

    @Prop({ trim: true, type: String })
    tags: string;

    @Prop({ trim: true, type: String })
    category: string;

    @Prop({ default: 0, type: Number })
    viewCount: Number;

    @Prop({ type: Date })
    publishedAt: Date
}


export const PostSchema = SchemaFactory.createForClass(Post)