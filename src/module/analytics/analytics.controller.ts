import { ClassSerializerInterceptor, Controller, Get, Param, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '../auth/guard/auth-guard.guard.js';
import { AnalyticsService } from './analytics.service.js';
import { messages } from '../../common/enums/messages.enum.js';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { authorPerformaceMetricsSerializer, dashBoardSerializer, postAnalyticsSerializer, trendingPostSerializer } from './Serializer/analytics.serializer.js';


@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard)
@Controller('api/analytics')
export class AnalyticsController {

    constructor(
        private readonly analyticsService: AnalyticsService
    ) { }

    @Get("overview")
    async getDashBoard(@Req() req) {
        const dashBoardData = await this.analyticsService.getDashBoard(req.user)

        const serializedData = plainToInstance(
            dashBoardSerializer,
            dashBoardData,
            { excludeExtraneousValues: true }
        )

        return { data: serializedData, message: "DashBoard fetched Succeessfully" }

    }


    @Get("/post/:postId")
    async postAnalytics(@Param("postId", ParseObjectIdPipe) postId, @Req() req) {

        const postAnalyticsData = await this.analyticsService.postAnalytics(postId, req.user);

        const serilaizedPost = plainToInstance(
            postAnalyticsSerializer,
            postAnalyticsData,
            { excludeExtraneousValues: true }
        )

        return { data: serilaizedPost, message: "Post Analytics fetched sccessfully" }
    }


    @Get("/trending")
    async todaysTrendingPost() {
        const trendingPost: any = await this.analyticsService.todayTrendingPost()

        //sanitize the post Id
        const trendingPostObj = trendingPost && typeof trendingPost.toObject === "function" ? trendingPost.toObject() : trendingPost

        let sanitizedTrendindPost;
        if (Array.isArray(trendingPost)) {
            sanitizedTrendindPost = trendingPost.map(trendingP => this.sanitize(trendingP))
        }
        const serializedTrendingPost = plainToInstance(
            trendingPostSerializer,
            sanitizedTrendindPost,
            { excludeExtraneousValues: true }
        )

        return { data: serializedTrendingPost, message: "Trending Post fetched successfully" }
    }




    @Get("author/:authorId")
    async authorPerformaceMetrics(@Param("authorId", ParseObjectIdPipe) authorId) {

        const performanceMetrics = await this.analyticsService.authorPerformaceMetrics(authorId)


        const sanitizedPerformanceMetrics = this.sanitize(performanceMetrics)
        console.log(sanitizedPerformanceMetrics)

        const serializedData = plainToInstance(
            authorPerformaceMetricsSerializer,
            sanitizedPerformanceMetrics,
            { excludeExtraneousValues: true }
        )

        console.log(serializedData)
        return { data: serializedData, message: "Performance metrics fetched Successfully" }


    }


    sanitize(data: any) {

        const dataObj = data && typeof data.toObject === "function" ? data.toObject() : data;

        // for thr trending post
        if (dataObj && dataObj.post && dataObj.post._id) {
            console.log("Hello")
            dataObj.post._id = dataObj.post._id.toString()
        }

        //for the authorPerformance metrics

        if (dataObj && dataObj.mostViewedPost && dataObj.mostViewedPost._id) {
            dataObj.mostViewedPost._id = dataObj.mostViewedPost._id.toString()
        }

        return dataObj;
    }



}
