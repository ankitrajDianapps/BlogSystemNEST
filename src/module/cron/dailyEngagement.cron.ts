import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../../Schema/post.schema.js';
import mongoose, { Model } from 'mongoose';
import { Comment } from '../../Schema/comment.schema.js';
import { Like } from '../../Schema/like.schema.js';
import { PostView } from '../../Schema/postView.schema.js';
import { PostEngagement } from '../../Schema/PostEngagement.schema.js';
import { Cron, CronExpression } from '@nestjs/schedule';

interface EngagementStats {
    viewCount: number;
    commentCount: number;
    likeCount: number;
}


@Injectable()
export class DailyEngagementCron {

    constructor(
        @InjectModel(Post.name) private postModel: Model<Post>,
        @InjectModel(Comment.name) private commentModel: Model<Comment>,
        @InjectModel(Like.name) private likeModel: Model<Like>,
        @InjectModel(PostView.name) private postViewModel: Model<PostView>,
        @InjectModel(PostEngagement.name) private postEngagementModel: Model<PostEngagement>

    ) { }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async dailyAggregation() {

        console.log("Daily Aggregation Cron started.......")
        const [viewStats, likeStats, commentStats] = await Promise.all([
            this.postViewModel.aggregate([
                {
                    $group: {
                        _id: "$postId",
                        viewCount: { $sum: 1 }
                    }
                }
            ]),
            this.likeModel.aggregate([
                {
                    $group: {
                        _id: "$post_id",
                        likeCount: { $sum: 1 }
                    }
                }
            ]),
            this.commentModel.aggregate([
                {
                    $match: {
                        isDeleted: { $ne: true }
                    }
                },
                {
                    $group: {
                        _id: "$post",
                        commentCount: { $sum: 1 }
                    }
                }
            ])
        ])


        const engagementMap: Record<string, EngagementStats> = {};


        viewStats.forEach(v => {
            if (!v._id) return;
            engagementMap[v._id.toString()] = { viewCount: v.viewCount, commentCount: 0, likeCount: 0 }
        })

        commentStats.forEach(c => {
            if (!c._id) return
            if (!engagementMap[c._id.toString()]) engagementMap[c._id] = { viewCount: 0, likeCount: 0, commentCount: 0 }

            engagementMap[c._id.toString()].commentCount = c.commentCount
        })

        likeStats.forEach(l => {
            if (!l._id) return;
            if (!engagementMap[l._id.toString()]) engagementMap[l._id] = { likeCount: 0, viewCount: 0, commentCount: 0 }
            engagementMap[l._id.toString()].likeCount = l.likeCount
        })

        console.log(engagementMap)

        const bulkOperation = Object.entries(engagementMap).map(([postId, data]) => ({
            updateOne: {
                filter: { postId: new mongoose.Types.ObjectId(postId) },
                update: {
                    $set: {
                        viewCount: data.viewCount,

                    }
                },
                upsert: true
            }
        }))

        await this.postEngagementModel.bulkWrite(bulkOperation);

    }









}

