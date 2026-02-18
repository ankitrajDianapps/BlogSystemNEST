import { Body, ClassSerializerInterceptor, Controller, Get, Patch, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service.js';
import { changePasswordDTO, createUserDTO, forgotPasswordDTO, loginUserDTO, refreshTokenDTO, updateUserDTO, verifyOtpDTO } from './DTO/user.dto.js';
import { AuthGuard } from '../auth/guard/auth-guard.guard.js';
import { InjectModel } from '@nestjs/mongoose';
import { Session } from '../../Schema/session.schema.js';
import { Model } from 'mongoose';
import { User } from '../../Schema/user.schema.js';
import { messages } from '../../common/enums/messages.enum.js';
import { plainToInstance } from 'class-transformer';
import { loginUserSerializer, refreshTokenSerializer, registerUserSerializer, updateUserSerializer, userProfileSerializer } from './Serializer/user.serializer.js';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('/api/auth')
export class UserController {
    constructor(private userService: UserService,
        @InjectModel(Session.name) private sessionModel: Model<Session>
    ) { }



    @Post("/register")
    async registeruser(@Body() data: createUserDTO) {
        const user = await this.userService.registeruser(data);

        const sanitizedUser = this.sanitizeUserId(user)

        const serializedUser = plainToInstance(
            registerUserSerializer,
            sanitizedUser,
            { excludeExtraneousValues: true }
        )

        return { data: serializedUser, message: "User Registered Successfully" }
    }

    @Post("/login")
    async loginUser(@Body() data: loginUserDTO, @Req() req) {

        const logedInUser = await this.userService.loginUser(data, req.ip)
        const serializedLogedInUser = plainToInstance(
            loginUserSerializer,
            logedInUser,
            { excludeExtraneousValues: true }
        )
        return { data: serializedLogedInUser, message: "LoggedIn successfully" }
    }

    @UseGuards(AuthGuard)
    @Post("/logout")
    async logoutUser(@Req() req) {

        // a logout user can also do logout again
        await this.sessionModel.deleteOne({ userId: req.user._id })
        return { message: "User Logout Successfully" }
    }

    @UseGuards(AuthGuard)
    @Get("/profile")
    async getUserProfile(@Req() req) {
        const user: User = req.user;
        const sanitizedUser = this.sanitizeUserId(user)
        const serializedUser = plainToInstance(
            userProfileSerializer,
            sanitizedUser,
            { excludeExtraneousValues: true }
        )
        return { data: serializedUser, message: "Profile fetched Successfully" }

    }


    @UseGuards(AuthGuard)
    @Patch("/update-profile")
    async updateUser(@Body() data: updateUserDTO, @Req() req) {

        const user = await this.userService.updateUser(data, req.user)
        const sanitizedUser = this.sanitizeUserId(user)
        const serializedUser = plainToInstance(
            updateUserSerializer,
            sanitizedUser,
            { excludeExtraneousValues: true }
        )
        return { data: serializedUser, message: "User Updated successfully" }

    }

    @Post("/refresh")
    async refresh(@Body() data: refreshTokenDTO, @Req() req) {
        const token = await this.userService.refreshToken(data.refreshToken)

        const serializedToken = plainToInstance(
            refreshTokenSerializer,
            token,
            { excludeExtraneousValues: true }
        )

        console.log(token)
        return { data: serializedToken, message: "Token refreshed" }

    }


    @Post("/forgot-password")
    async forgotPassword(@Body() data: forgotPasswordDTO) {
        const otp = await this.userService.forgotPassword(data.email)

        return { data: { otp: otp, message: "Otp sent Successfully" } }
    }

    @Post("/verify-otp")
    async verifyOtp(@Body() data: verifyOtpDTO) {


        const token = await this.userService.verifyOtp(data.otp, data.email)
        return { data: token, message: "OTP verified & token sent successfully" }
    }


    @Post("/change-password")
    async changePassword(@Body() data: changePasswordDTO) {

        this.userService.changePassword(data.token, data.newPassword)
        return { message: "Password changed successfully" }
    }


    sanitizeUserId(user: any) {
        const userObj = user && typeof user.toObject === "function" ? user.toObject() : user;
        if (userObj && userObj._id) {
            userObj._id = userObj._id.toString()
        }

        return userObj;
    }

}
