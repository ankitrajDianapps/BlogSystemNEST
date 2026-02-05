import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service.js';
import { createUserDTO, loginUserDTO, refreshTokenDTO, updateUserDTO } from './DTO/user.dto.js';
import { AuthGuard } from '../auth/guard/auth-guard.guard.js';
import { InjectModel } from '@nestjs/mongoose';
import { Session } from '../../Schema/session.schema.js';
import { Model } from 'mongoose';
import { User } from '../../Schema/user.schema.js';
import { messages } from '../../common/enums/messages.enum.js';


@Controller('/api/auth')
export class UserController {
    constructor(private userService: UserService,
        @InjectModel(Session.name) private sessionModel: Model<Session>
    ) { }



    @Post("/register")
    async registeruser(@Body() data: createUserDTO) {
        console.log(data)
        const user = await this.userService.registeruser(data)
        return { data: user, message: "User Registered Successfully" }
    }

    @Post("/login")
    async loginUser(@Body() data: loginUserDTO, @Req() req) {

        const token = await this.userService.loginUser(data, req.ip)
        return { data: token, message: "LoggedIn successfully" }
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

        return { data: user, message: "Profile fetched Successfully" }

    }


    @UseGuards(AuthGuard)
    @Patch("/update-profile")
    async updateUser(@Body() data: updateUserDTO, @Req() req) {

        const user = await this.userService.updateUser(data, req.user)
        return { data: user, message: "User Updated successfully" }

    }

    @Post("/refresh")
    async refresh(@Body() data: refreshTokenDTO, @Req() req) {
        const token = await this.userService.refreshToken(data.refreshToken)

        console.log(token)
        return { data: token, message: "Token refreshed" }

    }

}
