import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../Schema/user.schema.js';
import mongoose, { Model } from 'mongoose';
import { Post } from '../../Schema/post.schema.js';
import { Comment } from '../../Schema/comment.schema.js';
import { createCommentDTO } from './DTO/comment.dto.js';
import { messages } from '../../common/enums/messages.enum.js';
import { AppError } from '../../Utils/AppError.js';

@Injectable()
export class CommentService {

    constructor(
        // @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Post.name) private postModel: Model<Post>,
        @InjectModel(Comment.name) private commentModel: Model<Comment>

    ) { }


    async addComment(comment: createCommentDTO, postId: mongoose.Types.ObjectId, parentCommentId: mongoose.Types.ObjectId, user: User): Promise<Comment> {


        // check if the postId provided by user  exists or not
        const post = await this.postModel.findOne({ _id: postId, status: "published" })
        if (!post) throw new AppError(messages.POST_NOT_FOUND, 400)

        // if parentCommentiId is present with request but that comment is deleted then we dont allow users to add commment on that parentComment

        if (parentCommentId) {
            const comment = await this.commentModel.findOne({ _id: parentCommentId, isDeleted: false })
            if (!comment) throw new AppError(messages.COMMENT_NOT_FOUND, 400)
        }

        const newComment = new this.commentModel({
            content: comment.content,
            post: post._id,
            user: user._id,
            parentCommentId: parentCommentId
        })

        await newComment.save()

        await newComment.populate("user", "userName avatar")
        await newComment.populate("post", "title")
        return newComment

    }



    async getAllComment(postId: mongoose.Types.ObjectId, parentCommentId: mongoose.Types.ObjectId): Promise<Comment[]> {


        if (parentCommentId && !mongoose.Types.ObjectId.isValid(parentCommentId)) throw new AppError(messages.INVALID_ID_FORMAT, 400)

        const post = await this.postModel.findOne({ _id: postId, status: "published" })
        if (!post) throw new AppError(messages.POST_NOT_FOUND, 400)

        //if post exist then determine the comments of that post
        const comment = await this.commentModel.find({ post: postId, parentCommentId: parentCommentId }).populate("user", "userName avatar bio")

        return comment
    }



    async updateComment(id: mongoose.Types.ObjectId, content: string, user: User): Promise<Comment | null> {

        //check is the comment with this id exist or not
        const comment = await this.commentModel.findOne({ _id: id, isDeleted: false })
        if (!comment) throw new AppError(messages.COMMENT_NOT_FOUND, 400)

        // lets check if the user updating its own comment or others
        if (comment.user._id.toString() != user._id.toString()) {
            throw new AppError(messages.UNAUTHORIZED_ACTION, 403)
        }

        //now update the comment
        const updatedComment = await this.commentModel.findByIdAndUpdate(
            id,
            { content: content, isEdited: true },
            { new: true }
        ).populate("user", "userName  bio")

        return updatedComment;

    }


    async deleteComment(id: mongoose.Types.ObjectId, user: User): Promise<void> {

        // lets check is the comment with whis id exist or not
        const comment = await this.commentModel.findOne({ _id: id, isDeleted: false })
        if (!comment) throw new AppError(messages.COMMENT_NOT_FOUND, 400)

        // also check is user trying to deleting his own comment
        if (comment.user._id != user._id) throw new AppError(messages.UNAUTHORIZED_ACTION, 403)

        // we will  not delete the comment , instead we mark it as isDeleted false and make its content as comment deleted  but its replies still  exists

        await this.commentModel.updateOne({ _id: id }, { isDeleted: true, content: "content deleted" })

        return;


    }





}








