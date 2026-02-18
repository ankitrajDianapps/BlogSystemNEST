import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './module/user/user.module';
import { PostModule } from './module/post/post.module';
import { CommentModule } from './module/comment/comment.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './module/auth/auth.module';
import { AnalyticsModule } from './module/analytics/analytics.module';
import { CronModule } from './module/cron/cron.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailModule } from './module/email/email.module';
import { EmailService } from './module/email/email.service.js';


@Module({
  imports: [UserModule, PostModule, CommentModule, AuthModule, AnalyticsModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URL!, { autoIndex: true }),
    ScheduleModule.forRoot(),
    CronModule,
    EmailModule,


  ],
  controllers: [AppController],
  providers: [AppService, EmailService],
})
export class AppModule { }
