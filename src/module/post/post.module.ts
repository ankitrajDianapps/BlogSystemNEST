import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../Schema/user.schema.js';
import { Post, PostSchema } from '../../Schema/post.schema.js';
import { Comment, CommentSchema } from '../../Schema/comment.schema.js';
import { PostView, PostViewSchema } from '../../Schema/postView.schema.js';
import { AuthModule } from '../auth/auth.module.js';
import { Session, SessionSchema } from '../../Schema/session.schema.js';
import { Like, LikeSchema } from '../../Schema/like.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: PostView.name, schema: PostViewSchema },
      { name: Session.name, schema: SessionSchema },
      { name: Like.name, schema: LikeSchema }


    ]),



    AuthModule
  ],
  controllers: [PostController],
  providers: [PostService]
})
export class PostModule { }
