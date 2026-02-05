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

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),

    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),

    MongooseModule.forFeature([{ name: PostView.name, schema: PostViewSchema }]),

    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),


    AuthModule
  ],
  controllers: [PostController],
  providers: [PostService]
})
export class PostModule { }
