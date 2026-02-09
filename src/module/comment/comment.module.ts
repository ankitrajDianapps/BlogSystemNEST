import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { User, UserSchema } from '../../Schema/user.schema.js';
import { Post, PostSchema } from '../../Schema/post.schema.js';
import { PostView, PostViewSchema } from '../../Schema/postView.schema.js';
import { Like, LikeSchema } from '../../Schema/like.schema.js';
import { Session, SessionSchema } from '../../Schema/session.schema.js';
import { Comment, CommentSchema } from '../../Schema/comment.schema.js';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      // { name: PostView.name, schema: PostViewSchema },
      { name: Session.name, schema: SessionSchema },
      { name: Like.name, schema: LikeSchema }


    ]),
    AuthModule
  ],
  controllers: [CommentController],
  providers: [CommentService]
})
export class CommentModule { }




