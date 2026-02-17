import { Expose, Transform, Type } from "class-transformer";
import mongoose from "mongoose";


export class userSerializer {

    @Expose()
    _id: string

    @Expose()
    userName: string

    @Expose()
    bio: string
}


export class createCommentSerializer {

    @Expose()
    _id: string;

    @Expose()
    @Type(() => userSerializer)
    user: any

    @Expose()
    content: string

    @Expose()
    parentCommentId: string

    @Expose()
    isEdited: boolean

    @Expose()
    isDeleted: boolean

    @Expose()
    createdAt: Date

    @Expose()
    updatedAt: Date
}

export class updateCommentSerializer extends createCommentSerializer { }