import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, mongo } from 'mongoose';
import { User } from '../../Schema/user.schema.js';
import { Post, PostSchema } from '../../Schema/post.schema.js';
import { createPostDTO, updatePostDTO } from './DTO/post.dto.js';
import { AppError } from '../../Utils/AppError.js';
import { Comment } from '../../Schema/comment.schema.js';
import { messages } from '../../common/enums/messages.enum.js';
import { Like } from '../../Schema/like.schema.js';
import { PostView } from '../../Schema/postView.schema.js';
import { promises } from 'dns';

@Injectable()
export class PostService {
    constructor(
        @InjectModel(User.name) private uerModel: Model<User>,
        @InjectModel(Post.name) private postModel: Model<Post>,
        @InjectModel(Comment.name) private commentModel: Model<Comment>,
        @InjectModel(Like.name) private likeModel: Model<Like>,
        @InjectModel(PostView.name) private postViewModel: Model<PostView>,



    ) { }

    private escapeRegExp(string: string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }


    async createPost(data: createPostDTO, user: User) {

        if (user.role != "author") {
            throw new AppError("Only Authors are allowed to create Post", 400)
        }

        const title = data.title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, ' ')
        data.title = title

        const randomStr = Math.random().toString(36).substring(2, 8);
        const slug = title.replace(/\s+/g, "-") + "-by-" + user.userName + "-" + randomStr;

        //! problem -> what if a user tries to post with same title then slug becomes same
        const postWithSameSlug = await this.postModel.find({ slug: slug })
        if (postWithSameSlug.length > 0) {
            console.log("Post with same slug already exists")
            throw new AppError("Internal Server Error", 500)
        }

        const post = new this.postModel(
            {
                title: data.title,
                slug: slug,
                content: data.content,
                excerpt: data.excerpt,
                author: user._id,
                tags: data.tags,
                status: data.status,
                category: data.category,
                publishedAt: new Date()
            }
        )

        await post.save()
        await post.populate("author", "userName bio role")
        return post;
    }



    async getAllPublishedPosts(query: any, user: User): Promise<Post[] | unknown> {

        let { page, limit, category, tags, author } = query

        page = Number(query.page) || 1
        limit = Number(query.limit) || 5
        let skip = (page - 1) * limit;
        //implementing the dynamc filterin

        const orConditions: {}[] = []

        if (category) {
            orConditions.push({
                category: new RegExp(`${this.escapeRegExp(category.trim())}`, "i")
            })
        }

        if (tags) {
            orConditions.push({
                tags: {
                    $in: tags.split(",").map(tag => new RegExp(`${this.escapeRegExp(tag.trim())}`, "i"))
                }
            })
        }

        orConditions.forEach((d) => console.log(d))

        if (author) {
            const userDoc = await this.uerModel.find({
                userName: new RegExp(`${this.escapeRegExp(author)}`, "i")
            })

            const ids: {}[] = []
            userDoc.forEach((user) => ids.push(user._id))

            orConditions.push({
                author: {
                    $in: ids
                }
            })
        }


        const filter: any = {
            status: "published"
        }

        if (orConditions.length > 0) filter.$or = orConditions

        // console.log(filter)

        //determine all the post of the logged in user
        const posts = await this.postModel.find(
            filter
        ).skip(skip).limit(limit).populate("author", "userName bio role")


        if (posts.length == 0) throw new AppError("No posts at this Page", 404)

        return posts
    }


    async getPostById(id: mongoose.Types.ObjectId, user: User, ip: string): Promise<Object | null> {
        const post = await this.postModel.findOne(
            { _id: id, status: "published" }
        ).populate("author", "userName bio role")

        if (!post) throw new AppError(messages.POST_NOT_FOUND, 404)

        // console.log(post)

        //! now determine total comments on this post
        const commentCount = await this.commentModel.countDocuments({ post: post._id, isDeleted: false })
        // determine total likes on that post
        const likeCount = await this.likeModel.countDocuments({ postId: post._id })

        const responsePost = {
            ...post.toObject(),
            totalComment: commentCount,
            likeCount: likeCount
        }

        //! now we will update view count by matching is this post already viewed by the same user then dont update othewise update

        const postviewDetail = await this.postViewModel.find({ postId: post._id, userId: user._id })

        if (postviewDetail.length == 0) {
            const postView = new this.postViewModel({
                postId: id,
                userId: user._id,
                ipAddress: ip,
                viewedAt: new Date()

            })

            await postView.save()

            //also increment the value of view-count for the post table
            await this.postModel.updateOne({ _id: id }, { $inc: { viewCount: 1 } })
        }

        return responsePost;

    }




    async updatePost(post: updatePostDTO, id: mongoose.Types.ObjectId, user: User, draftToPublish: Boolean): Promise<Post | null> {

        let postToUpdate;

        if (draftToPublish) {
            postToUpdate = await this.postModel.findOne({ _id: id, status: "draft" }).populate("author")
        }
        else {
            postToUpdate = await this.postModel.findOne({ _id: id }).populate("author")
        }

        let message = ""
        if (!postToUpdate) {
            draftToPublish == true ? message = messages.DRAFT_POST_NOT_FOUND : message = messages.POST_NOT_FOUND

            throw new AppError(message, 404)
        }

        if (postToUpdate?.author?.id?.toString() != user._id) throw new AppError(messages.UNAUTHORIZED_ACTION, 403)

        const updatedData: any = {}

        // if user has changes the title then we need to format the title and slug
        if (post?.title) {
            const title = post.title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, ' ')
            updatedData.title = title
            const randomStr = Math.random().toString(36).substring(2, 8);
            const slug = title.replace(/\s+/g, "-") + "-by-" + user.userName + "-" + randomStr;

            updatedData.title = title;
            updatedData.slug = slug
        }

        if (post?.content) updatedData.content = post.content
        if (post?.excerpt) updatedData.excerpt = post.excerpt
        if (post?.tags) updatedData.tags = post.tags
        if (post?.category) updatedData.category = post.category

        if (draftToPublish) updatedData.status = "published"

        //  due to any reason from the server side , if it create the same slug for two posts then in that case lets check and throw internal server Error
        const isPostSlugExists = await this.postModel.exists({ slug: updatedData?.slug })
        if (isPostSlugExists) {
            console.log("same slug already exist")
            throw new AppError("Internal Server Error", 500)
        }

        const updatedPost = await this.postModel.findByIdAndUpdate(
            id,
            { $set: updatedData },
            { new: true }
        ).populate("author", "userName role bio").lean()


        return updatedPost;
    }



    async getOwnPosts(user: User): Promise<Post[] | unknown> {
        const posts = await this.postModel.find({ author: user._id, status: "published" }).populate("author", "userName bio role")

        return posts
    }



    async deletePost(id: mongoose.Types.ObjectId, user: User): Promise<void> {

        // now check are we authorized to delete that post
        const postToDelete = await this.postModel.findOne({ _id: id })

        if (!postToDelete) throw new AppError(messages.POST_NOT_FOUND, 404)

        if (postToDelete.author.toString() != user._id.toString()) throw new AppError(messages.UNAUTHORIZED_ACTION, 403)


        // now lets delete the post

        const deletedPost = await this.postModel.deleteOne({ _id: id })

        //delete all the comments of it
        await this.commentModel.deleteMany({ post: id })
    }


    async likePost(postId: mongoose.Types.ObjectId, user: User): Promise<void> {

        const post = await this.postModel.findById(postId)
        if (!post) throw new AppError(messages.POST_NOT_FOUND, 400)

        // check if the user already have liked the post

        const isLiked = await this.likeModel.exists({ postId: postId, user: user._id })

        if (!isLiked) {
            const likeEntry = new this.likeModel({ postId: postId, user: user._id, likedAt: new Date() })
            await likeEntry.save()
        }
        return;

    }


    async unlikePost(postId: mongoose.Types.ObjectId, user: User): Promise<void> {

        const post = await this.postModel.findById(postId)
        if (!post) throw new AppError(messages.POST_NOT_FOUND, 400)

        const isLiked = await this.likeModel.exists({ postId: postId, user: user._id })

        if (isLiked) {
            await this.likeModel.deleteOne({ postId: postId, user: user._id })
        }

        return;

    }








}
