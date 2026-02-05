import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AppError } from '../../../Utils/AppError.js';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../../Schema/user.schema.js';
import mongoose, { Model } from 'mongoose';
import { Session } from '../../../Schema/session.schema.js';

@Injectable()
export class AuthGuard implements CanActivate {


  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Session.name) private sessionModel: Model<Session>

  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const ctx = context.switchToHttp()

    const req = ctx.getRequest()

    const token = req.header("Authorization")?.split(" ")[1]
    // console.log(token)

    if (!token) {
      throw new AppError("Token not found , Authorization failed", 401)
    }
    const secret = this.configService.get("JWT_SECRET")

    let payload;
    try {
      payload = this.jwtService.verify(token, { secret })
    } catch (err) {
      throw new AppError("Invalid Token", 401)
    }

    const user = await this.userModel.findById(payload.userId)

    if (!user) {
      throw new AppError("No such user exists or user deleted", 401)
    }


    const session = await this.sessionModel.find({ userId: user._id, isValid: true })
    if (session.length == 0) {
      throw new AppError("Session expired , login again....", 401)
    }

    req.user = user;

    return true;
  }
}
