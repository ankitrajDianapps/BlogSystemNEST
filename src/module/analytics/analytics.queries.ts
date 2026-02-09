import { Injectable } from "@nestjs/common";
import { Comment } from "../../Schema/comment.schema.js";
import { InjectModel } from "@nestjs/mongoose";
import { privateDecrypt } from "crypto";
import mongoose, { Model } from "mongoose";


@Injectable()
export class AnalyticsQueries {
    constructor(
        @InjectModel(Comment.name) private commentModel: Model<Comment>
    ) { }

    async computeTotalCommentsForUserPosts(authorId) {

        const aggregateCommentsResult = await this.commentModel.aggregate([
            {
                $match: {
                    isDeleted: false
                }
            },
            {
                $lookup: {
                    from: "posts",
                    localField: "post",
                    foreignField: "_id",
                    as: "post"

                }
            },
            {
                $unwind: "$post"
            },
            {
                $match: {
                    "post.author": new mongoose.Types.ObjectId(authorId),

                }
            },
            {
                $group: {
                    _id: null,
                    totalComments: { $sum: 1 }
                }
            }
        ])

        return aggregateCommentsResult[0]?.totalComments || 0
    }

}