import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";


@Schema({ timestamps: true })
export class Comment extends Document {

    @Prop({
        ref: "Post", required: true, type: mongoose.Schema.Types.ObjectId
    })
    post: mongoose.Types.ObjectId

    @Prop({
        ref: "User", required: true, type: mongoose.Schema.Types.ObjectId
    })
    user: mongoose.Types.ObjectId

    @Prop({ type: mongoose.Schema.Types.ObjectId })
    parentCommentId: mongoose.Types.ObjectId

    @Prop({ trim: true, required: true, type: String })
    content: string

    @Prop({ default: false, type: Boolean })
    isEdited: Boolean

    @Prop({ default: false, type: Boolean })
    isDeleted: Boolean
}

export const CommentSchema = SchemaFactory.createForClass(Comment)