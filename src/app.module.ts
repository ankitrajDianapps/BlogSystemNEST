import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './module/user/user.module';
import { PostModule } from './module/post/post.module';
import { LikeModule } from './module/like/like.module';
import { CommentModule } from './module/comment/comment.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './module/auth/auth.module';

@Module({
  imports: [UserModule, PostModule, LikeModule, CommentModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URL!, { autoIndex: true }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService,],
})
export class AppModule { }
