import { Expose, Type } from "class-transformer";


export class postSerializer {

    @Expose()
    _id: string

    @Expose()
    title: string

    @Expose()
    viewCount: Number
}

export class dashBoardSerializer {

    @Expose()
    userName: string

    @Expose()
    totalPosts: Number

    @Expose()
    totalViews: Number

    @Expose()
    totalComments: Number
}


export class postAnalyticsSerializer {

    @Expose()
    _id: string

    @Expose()
    title: string

    @Expose()
    author: string

    @Expose()
    totalViews: Number

    @Expose()
    totalComments: Number

    @Expose()
    likeCount: Number
}


export class trendingPostSerializer {

    @Expose()
    trendingAt: Date

    @Expose()
    @Type(() => postSerializer)
    post: any

    @Expose()
    total_views_on_trending_day: Number

    @Expose()
    createdAt: Date

    @Expose()
    updatedAt: Date

}


export class authorPerformaceMetricsSerializer {

    // totalPublishedPosts: totalPosts,
    //             totalViews: totalViews,
    //             totalComments: totalComments,
    //             totalLikes: totalLikes,
    //             mostViewedPost: post


    @Expose()
    totalPublishedPosts: Number

    @Expose()
    totalComments: Number

    @Expose()
    totalLikes: Number

    @Expose()
    @Type(() => postSerializer)
    mostViewedPost: any
}