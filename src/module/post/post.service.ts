import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../Schema/user.schema.js';
import { Post, PostSchema } from '../../Schema/post.schema.js';
import { createPostDTO } from './DTO/post.dto.js';
import { AppError } from '../../Utils/AppError.js';
import { Comment } from '../../Schema/comment.schema.js';

@Injectable()
export class PostService {
    constructor(
        @InjectModel(User.name) private uerModel: Model<User>,
        @InjectModel(Post.name) private postModel: Model<Post>,
        @InjectModel(Comment.name) private commentModel: Model<Comment>,

    ) { }


    async createPost(data: createPostDTO, user: User) {
        const title = data.title.toLowerCase().replace(/ {2,}/g, " ")
        data.title = title

        const randomStr = Math.random().toString(36).substring(2, 8);
        const slug = title.replaceAll(" ", "-") + "-by-" + user.userName + "-" + randomStr;

        //! problem -> what if a user tries to post with same title then slug becomes same
        const postWithSameSlug = await this.postModel.find({ slug: slug })
        if (postWithSameSlug.length > 0) {
            console.log("Post with same slug already exists")
            throw new AppError("Internal Server Error", 500)
        }

        console.log(data)
        console.log(user)
        const post = new this.postModel(
            {
                title: data.title,
                slug: slug,
                content: data.content,
                excerpt: data.excerpt,
                author: user._id,
                tags: data.tags,
                category: data.category,
                publishedAt: new Date()
            }
        )

        await post.save()
        return post;

    }
}
