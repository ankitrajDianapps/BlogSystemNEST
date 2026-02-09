import { InjectModel } from "@nestjs/mongoose"
import { PostView } from "../../Schema/postView.schema.js"
import { Model } from "mongoose"
import { Inject, Injectable } from "@nestjs/common"
import { TrendingPost } from "../../Schema/trendingPost.schema.js"
import { Cron, CronExpression } from "@nestjs/schedule"



@Injectable()
export class trendingPostCron {

    constructor(
        @InjectModel(PostView.name) private postViewModel: Model<PostView>,
        @InjectModel(TrendingPost.name) private trendingPostModel: Model<TrendingPost>
    ) { }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async getTrendingPost() {
        console.log("Trending Post cron started.....")
        const twoMinuteAgo = new Date(Date.now() - 2 * 60 * 1000)

        //? lets determine the count of the view of the posts which is liked two minutes ago


        const aggregateResult = await this.postViewModel.aggregate([
            {
                $match: {
                    viewedAt: { $gt: twoMinuteAgo }
                }
            },
            {
                $group: {
                    _id: "$postId",
                    total_views_on_trending_day: { $sum: 1 }
                }
            },
            {
                $sort: { total_views_on_trending_day: -1 }
            },
            {
                $limit: 3
            },
            {
                $addFields: {
                    post: "$_id",
                    trendingAt: "$$NOW"
                }
            },
            {
                $project: {
                    _id: 0,
                    post: 1,
                    total_views_on_trending_day: 1,
                    trendingAt: 1,

                }
            }
        ])
        console.log(aggregateResult)
        // now push the todays trending post in the table
        await this.trendingPostModel.insertMany(aggregateResult)
        console.log("trending post cron execution completed")

    }
}