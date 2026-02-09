import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guard/auth-guard.guard.js';
import { AnalyticsService } from './analytics.service.js';
import { messages } from '../../common/enums/messages.enum.js';
import { ParseObjectIdPipe } from '@nestjs/mongoose';


@UseGuards(AuthGuard)
@Controller('api/analytics')
export class AnalyticsController {

    constructor(
        private readonly analyticsService: AnalyticsService
    ) { }

    @Get("overview")
    async getDashBoard(@Req() req) {
        const dashBoardData = await this.analyticsService.getDashBoard(req.user)

        return { data: dashBoardData, message: "DashBoard fetched Succeessfully" }

    }


    @Get("/post/:postId")
    async postAnalytics(@Param("postId", ParseObjectIdPipe) postId, @Req() req) {

        const postAnalyticsData = await this.analyticsService.postAnalytics(postId, req.user);

        return { data: postAnalyticsData, message: "Post Analytics fetched sccessfully" }
    }


    @Get("/trending")
    async todaysTrendingPost() {
        const trendingPost = await this.analyticsService.todayTrendingPost()

        return { data: trendingPost, message: "Trending Post fetched successfully" }
    }




    @Get("author/:authorId")
    async authorPerformaceMetrics(@Param("authorId", ParseObjectIdPipe) authorId) {

        const performaceMetrics = await this.analyticsService.authorPerformaceMetrics(authorId)

        return { data: performaceMetrics, message: "Performance metrics fetched Successfully" }


    }


}
