import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../Schema/user.schema.js';
import { Post, PostSchema } from '../../Schema/post.schema.js';
import { Comment, CommentSchema } from '../../Schema/comment.schema.js';
import { PostView } from '../../Schema/postView.schema.js';
import { AuthModule } from '../auth/auth.module.js';
import { Session, SessionSchema } from "../../Schema/session.schema.js"
import { PostEngagement, PostEngagementSchema } from '../../Schema/PostEngagement.schema.js';
import { AnalyticsQueries } from './analytics.queries.js';
import { Like, LikeSchema } from '../../Schema/like.schema.js';
import { TrendingPost, TrendingPostSchema } from '../../Schema/trendingPost.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Like.name, schema: LikeSchema },
      { name: PostView.name, schema: PostSchema },
      { name: Session.name, schema: SessionSchema },
      { name: PostEngagement.name, schema: PostEngagementSchema },
      { name: TrendingPost.name, schema: TrendingPostSchema }

    ]),
    AuthModule
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsQueries]
})
export class AnalyticsModule { }
