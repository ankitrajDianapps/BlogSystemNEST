import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../Schema/user.schema.js';
import mongoose, { Model } from 'mongoose';
import { Post } from '../../Schema/post.schema.js';
import { Comment } from '../../Schema/comment.schema.js';
import { PostEngagement } from '../../Schema/PostEngagement.schema.js';
import { AnalyticsQueries } from './analytics.queries.js';
import { AppError } from '../../Utils/AppError.js';
import { messages } from '../../common/enums/messages.enum.js';
import { Like } from '../../Schema/like.schema.js';
import { threadCpuUsage } from 'process';
import { TrendingPost } from '../../Schema/trendingPost.schema.js';

@Injectable()
export class AnalyticsService {

    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Post.name) private postModel: Model<Post>,
        @InjectModel(Comment.name) private commentModel: Model<Comment>,
        @InjectModel(Like.name) private likeModel: Model<Like>,
        @InjectModel(PostEngagement.name) private postEngagementModel: Model<PostEngagement>,
        @InjectModel(TrendingPost.name) private trendingPostModel: Model<TrendingPost>,

        private readonly analyticsQueryies: AnalyticsQueries
    ) { }


    async getDashBoard(user: User) {

        const aggregateViewResults = await this.postModel.aggregate([
            {
                $match: {
                    author: new mongoose.Types.ObjectId(user._id)
                }
            },
            {
                $group: {
                    _id: null,
                    totalPosts: { $sum: 1 },
                    totalViews: { $sum: "$viewCount" }
                }
            }
        ])


        const totalViews: Number = aggregateViewResults[0]?.totalViews || 0

        const totalPosts: Number = aggregateViewResults[0]?.totalPosts || 0


        const totalComments = await this.analyticsQueryies.computeTotalCommentsForUserPosts(user._id)


        return {
            userName: user.userName,
            totalPosts: totalPosts,
            totalViews: totalViews,
            totalComments: totalComments
        }
    }



    async postAnalytics(postId: mongoose.Types.ObjectId, user: User) {

        const post = await this.postModel.findOne({ _id: postId, status: "published" }).populate("author", "userName").lean()

        if (!post) throw new AppError(messages.POST_NOT_FOUND, 400)

        const totalViews = post.viewCount;

        const commentsCount = await this.commentModel.countDocuments({ post: post._id, isDeleted: false })

        const likeCount = await this.likeModel.countDocuments({ postId: post._id })

        // when i try to access post.author.username , I was unable to access userName bcoz author is objectId in schema typescript type sp userName doesnot exists for type objectId so i make post.author as any
        const author = (post.author) as any

        return {
            title: post.title,
            author: author.userName,
            totalViews: totalViews,
            totalComment: commentsCount,
            likeCount: likeCount
        }
    }



    async todayTrendingPost() {
        //lets determine the tredingPost as - searach in  table TrendinPost for the documents whose trendind_at field is greater than currentTime-1 minute

        const trendingDate = new Date(Date.now() - 2 * 60 * 1000)

        const todaysTrendingPost = await this.trendingPostModel.find({ trendingAt: { $gte: trendingDate } }).populate("post", "title")

        console.log(todaysTrendingPost)

        if (todaysTrendingPost.length == 0) {
            throw new AppError("No Trending Post for today", 400)

        }
        return todaysTrendingPost
    }



    async authorPerformaceMetrics(authorId: mongoose.Types.ObjectId) {
        //check is the user with this id author or not
        const user = await this.userModel.findOne({ _id: authorId })

        if (!user) throw new AppError("User not found", 400)

        const aggregateViewsResult = await this.postModel.aggregate([
            {
                $match: {
                    author: new mongoose.Types.ObjectId(authorId),
                    status: "published"
                }
            },
            {
                $group: {
                    _id: null,
                    totalPosts: { $sum: 1 },
                    totalViews: { $sum: "$viewCount" }
                }
            }
        ])

        const totalViews = aggregateViewsResult[0]?.totalViews || 0
        const totalPosts = aggregateViewsResult[0]?.totalPosts || 0

        //now determine total number of comments  on all the post of the author

        const totalComments = await this.analyticsQueryies.computeTotalCommentsForUserPosts(authorId)

        //most viewed post of the  author
        const post = await this.postModel.find({ author: authorId }).sort({ viewCount: -1 }).limit(1).select("title viewCount")

        // determine total likes the user gets in his entire posts

        const aggregateLikesResult = await this.likeModel.aggregate([
            {
                $lookup: {
                    from: "posts",
                    localField: "postId",
                    foreignField: "_id",
                    as: "post"
                }
            },
            {
                $unwind: "$post"
            },
            {
                $match: {
                    "post.author": new mongoose.Types.ObjectId(authorId)
                }
            },
            {
                $group: {
                    _id: null,
                    totalLikes: { $sum: 1 }
                }
            }
        ])

        const totalLikes = aggregateLikesResult[0]?.totalLikes || 0

        return {
            totalPublishedPosts: totalPosts,
            totalViews: totalViews,
            totalComments: totalComments,
            totalLikes: totalLikes,
            mostViewedPost: post
        }



    }


}
