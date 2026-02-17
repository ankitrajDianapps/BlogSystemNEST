import { Expose, Transform, Type } from "class-transformer";
import mongoose from "mongoose";

export class authorSerializer {
    @Expose()
    _id: string

    @Expose()
    userName: string

    @Expose()
    bio: string

    @Expose()
    role: string
}

export class createPostSerializer {

    @Expose()
    _id: string

    @Expose()
    title: string

    @Expose()
    slug: string

    @Expose()
    content: string

    @Expose()
    excerpt: string

    @Expose()
    @Type(() => authorSerializer)
    author: any

    @Expose()
    status: string

    @Expose()
    tags: string

    @Expose()
    category: string

    @Expose()
    viewCount: number

    @Expose()
    publishedAt: Date

    @Expose()
    createdAt: Date

    @Expose()
    updatedAt: Date


}



export class getAllPublishedPostsSerializer extends createPostSerializer { }

export class getPostsSerializer extends createPostSerializer { }


export class updatedPostSerializer extends createPostSerializer { }