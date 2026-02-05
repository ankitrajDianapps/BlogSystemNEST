import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service.js';
import { createUserDTO, loginUserDTO, refreshTokenDTO, updateUserDTO } from './DTO/user.dto.js';
import { AuthGuard } from '../auth/guard/auth-guard.guard.js';
import { InjectModel } from '@nestjs/mongoose';
import { Session } from '../../Schema/session.schema.js';
import { Model } from 'mongoose';
import { User } from '../../Schema/user.schema.js';


@Controller('/api/auth')
export class UserController {
    constructor(private userService: UserService,
        @InjectModel(Session.name) private sessionModel: Model<Session>
    ) { }



    @Post("/register")
    async registeruser(@Body() data: createUserDTO) {
        console.log(data)
        return this.userService.registeruser(data)
    }

    @Post("/login")
    async loginUser(@Body() data: loginUserDTO, @Req() req) {


        return this.userService.loginUser(data, req.ip)
    }

    @UseGuards(AuthGuard)
    @Post("/logout")
    async logoutUser(@Req() req) {

        // a logout user can also do logout again
        await this.sessionModel.deleteOne({ userId: req.user._id })
        return "User Logout Successfully"
    }

    @UseGuards(AuthGuard)
    @Get("/profile")
    async getUserProfile(@Req() req) {
        const user: User = req.user;

        return user;

    }


    @UseGuards(AuthGuard)
    @Patch("/update-profile")
    async updateUser(@Body() data: updateUserDTO, @Req() req) {

        return this.userService.updateUser(data, req.user)

    }

    @Post("/refresh")
    async refresh(@Body() data: refreshTokenDTO, @Req() req) {
        return this.userService.refreshToken(data.refreshToken)

    }

}
