import { Prop, SchemaFactory } from "@nestjs/mongoose";
import { prototype } from "events";
import mongoose, { Document, mongo } from "mongoose";


export class PostView extends Document {

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
    PostId: mongoose.Types.ObjectId

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
    userId: mongoose.Types.ObjectId

    @Prop({ type: String })
    ipAddress: string

    @Prop({ type: Date })
    viewedAt: Date

}



export const PostViewSchema = SchemaFactory.createForClass(PostView)