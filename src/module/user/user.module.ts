import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../Schema/user.schema.js';
import { AuthModule } from '../auth/auth.module.js';
import { Session, SessionSchema } from '../../Schema/session.schema.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
    AuthModule,
  ],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule { }



