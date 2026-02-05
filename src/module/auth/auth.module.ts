import { Module } from '@nestjs/common';
import { Session } from '../../Schema/session.schema.js';
import { JwtModule } from '@nestjs/jwt';
import { AuthTokenService } from './auth-token.service';
import { AuthGuard } from './guard/auth-guard.guard.js';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../Schema/user.schema.js';
import { SessionSchema } from '../../Schema/session.schema.js';


@Module({
    imports: [
        JwtModule.registerAsync({
            useFactory: () => ({
                secret: "dummy",

            })
        }),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        MongooseModule.forFeature([{
            name: Session.name, schema: SessionSchema
        }])
    ],
    exports: [AuthTokenService, AuthGuard, JwtModule],
    providers: [AuthTokenService, AuthGuard]
})
export class AuthModule { }
