import { Injectable } from '@nestjs/common';
import { createUserDTO, loginUserDTO, updateUserDTO } from './DTO/user.dto.js';
import bcrypt from "bcryptjs"
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User } from '../../Schema/user.schema.js';
import { AppError } from '../../Utils/AppError.js';
import { AuthTokenService } from '../auth/auth-token.service.js';
import { Session } from '../../Schema/session.schema.js';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,

        @InjectModel(Session.name) private sessionModel: Model<Session>,

        private authTokenService: AuthTokenService,
        private jwtService: JwtService,
        private configService: ConfigService
    ) { }

    async registeruser(data: createUserDTO): Promise<User | null | Object> {

        const hashedPassword = await bcrypt.hash(data.password, 10)

        //check if user with same or userName already exists
        const isUserNameExists: User | null = await this.userModel.findOne(
            { userName: data.userName }
        )

        if (isUserNameExists) {
            throw new AppError("userName already exists", 400)
        }

        const isEmailExists = await this.userModel.findOne(
            { email: data.email }
        )
        if (isEmailExists) {
            throw new AppError("email already exists", 409)
        }

        const registeredUser = new this.userModel(
            {
                userName: data.userName,
                email: data.email,
                role: data.role,
                password: hashedPassword,
                bio: data.bio,
                fullName: data.fullName
            }
        )

        await registeredUser.save()

        const { password, ...safeUser } = registeredUser.toObject()
        return safeUser;

    }



    async loginUser(data: loginUserDTO, ip: string) {

        const user = await this.userModel.findOne({ email: data.email }).select("+password")
        if (!user) throw new AppError("User with this email not registered", 401)

        const isMatch = await bcrypt.compare(data.password, user.password)

        if (!isMatch) throw new AppError("wrong password", 401);

        const accessToken = this.authTokenService.generateAccessToken(user._id, user.email)

        const refreshToken = this.authTokenService.generateRefreshToken(user._id)

        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)


        await this.sessionModel.deleteMany({ userId: user._id })


        const session = new this.sessionModel({
            userId: user._id,
            refreshToken: hashedRefreshToken,
            IpAddress: ip
        })

        await session.save()

        //after successfull login update the user table by adding field user.loginAt as current date

        const u = await this.userModel.findByIdAndUpdate(user._id, { $set: { lastLogin: new Date() } })

        return { accessToken, refreshToken }

    }




    async updateUser(data: updateUserDTO, user: User
    ): Promise<User | null> {
        const updatedUser = await this.userModel.findByIdAndUpdate(
            { _id: user._id },
            {
                fullName: data.fullName,
                bio: data.bio
            },
            { new: true }
        )
        return updatedUser;

    }



    async refreshToken(refreshToken: string): Promise<object | null> {

        if (!refreshToken) throw new AppError("refresh token required", 400)

        const secret = this.configService.get("REFRESH_SECRET")
        const payload = this.jwtService.verify(refreshToken, { secret })

        console.log(payload.userId)

        const session = await this.sessionModel.findOne({ userId: new mongoose.Types.ObjectId(payload.userId), isValid: true })
        console.log(session)

        if (!session) throw new AppError("Your session has expired , Login again", 401)

        //lets check is the user still exists or has deleted account
        const user = await this.userModel.findById(payload.userId)
        if (!user) throw new AppError("User not longer exists , account deleted", 400)

        const accessToken = this.authTokenService.generateAccessToken(user._id, user.email)

        return { accessToken: accessToken }

    }



}
