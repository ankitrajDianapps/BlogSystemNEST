import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../Schema/user.schema.js';
import { AuthModule } from '../auth/auth.module.js';
import { Session, SessionSchema } from '../../Schema/session.schema.js';
import { EmailModule } from '../email/email.module.js';
import { Otp, OtpSchema } from '../../Schema/otp.schema.js';

@Module({
  imports: [MongooseModule.forFeature([
    { name: User.name, schema: UserSchema },
    { name: Session.name, schema: SessionSchema },
    { name: Otp.name, schema: OtpSchema }
  ]),

  MongooseModule.forFeature([]),
    AuthModule,
    EmailModule
  ],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule { }



