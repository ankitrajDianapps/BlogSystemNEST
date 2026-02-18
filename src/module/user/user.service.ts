import { Injectable, Post } from '@nestjs/common';
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
import { EmailService } from '../email/email.service.js';
import { Otp } from '../../Schema/otp.schema.js';


@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,

        @InjectModel(Session.name) private sessionModel: Model<Session>,
        @InjectModel(Otp.name) private otpModel: Model<Otp>,

        private authTokenService: AuthTokenService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private emailService: EmailService
    ) { }

    async registeruser(data: createUserDTO): Promise<User | null | Object> {

        const hashedPassword = await bcrypt.hash(data.password, 10)

        // check if user with same or userName already exists
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

        let payload;
        try {
            payload = this.jwtService.verify(refreshToken, { secret })
        } catch (err) {
            if (err instanceof Error) {
                console.log("Invalid signature")
                throw new AppError("Invalid Signature", 401)
            }
        }

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




    async forgotPassword(email: string): Promise<String> {
        //now lets check is there any user exists with this email or not
        const user = await this.userModel.findOne({ email: email })
        if (!user) {
            throw new AppError("User not found with this email", 400)
        }

        const otp = Math.floor(Math.random() * 1000000).toString()
        // await this.emailService.sendOTPEmail(email, user.userName, otp)

        // delete if any otp already exists for the same user
        await this.otpModel.deleteOne({ userId: user._id })

        const otpData = new this.otpModel({
            otp: otp,
            userId: user._id,
            isVerified: false,
            expireAt: new Date(Date.now() + 2 * 60 * 1000)
        })

        await otpData.save()

        return otpData.otp;
    }



    async verifyOtp(otp: string, email: string) {

        // lets check is the user still exists or deleted
        const user = await this.userModel.findOne({ email: email })
        if (!user) throw new AppError("User not found", 400)

        // check otp table if any otp entry  exists for this user

        const otpDoc = await this.otpModel.findOne({ userId: user._id })
        if (!otpDoc) throw new AppError("Verification Failed", 400)


        if (otpDoc.otp != otp) { throw new AppError("wrong OTP", 400) }

        // it otp entered by user is correct is already verified

        if (otpDoc.isVerified) throw new AppError("Otp is already verified", 400)

        // now otp has been verified , now update this opt doc   
        await this.otpModel.findOneAndUpdate(otpDoc._id, { isVerified: true })

        // now create a token which will be used to access the
        const token = this.jwtService.sign({
            userId: user._id,
            type: "forgot password"
        }, {
            secret: this.configService.get("OTP_SECRET"),
            expiresIn: "5m"
        })

        return { token: token }

    }


    async changePassword(token: string, newPassword: string) {

        //check the token 
        const secret = this.configService.get("OTP_SECRET")

        let payload;
        try {
            payload = this.jwtService.verify(token, { secret })
        } catch (e: any) {
            throw new AppError("Invalid Signature", 400)
        }


        if (payload.type != "forgot password") throw new AppError("Invalid Token", 401);

        const user = await this.userModel.findById(payload.userId)
        if (!user) throw new AppError("User not Exists", 400)

        // now change the password     
        const bcryptedPassword = await bcrypt.hash(newPassword, 10)

        // now update the password
        await this.userModel.findByIdAndUpdate(user._id, { password: bcryptedPassword })

        // now logout the user session from all the device
        await this.sessionModel.deleteMany({ userId: user._id })

        // also delete any otp exists in otp table , so that if any other trying to change password at same time can change it
        await this.otpModel.deleteMany({ userId: user._id })
    }

}

