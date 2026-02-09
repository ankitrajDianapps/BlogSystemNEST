import { Module } from '@nestjs/common';

import { DailyEngagementCron } from './dailyEngagement.cron';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from '../../Schema/post.schema.js';
import { Like, LikeSchema } from '../../Schema/like.schema.js';
import { PostView, PostViewSchema } from '../../Schema/postView.schema.js';
import { Comment, CommentSchema } from '../../Schema/comment.schema.js';
import { PostEngagement, PostEngagementSchema } from '../../Schema/PostEngagement.schema.js';
import { trendingPostCron } from './trendingPost.cron.js';
import { UserCleanUpCron } from './UserCleanup.cron.js';
import { TrendingPost, TrendingPostSchema } from '../../Schema/trendingPost.schema.js';
import { User, UserSchema } from '../../Schema/user.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Post.name, schema: PostSchema },
      { name: Like.name, schema: LikeSchema },
      { name: PostView.name, schema: PostViewSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: PostEngagement.name, schema: PostEngagementSchema },
      { name: TrendingPost.name, schema: TrendingPostSchema }
    ])
  ],
  providers: [DailyEngagementCron, trendingPostCron, UserCleanUpCron]
})
export class CronModule { }
