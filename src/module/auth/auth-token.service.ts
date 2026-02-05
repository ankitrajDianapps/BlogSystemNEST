import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import mongoose from 'mongoose';

@Injectable()
export class AuthTokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) { }

    generateAccessToken(userId: mongoose.Types.ObjectId, email: string) {

        console.log(this.configService.get("JWT_SECRET"))

        return this.jwtService.sign(
            {
                userId: userId,
                email: email
            }, {
            secret: this.configService.get("JWT_SECRET"),
            expiresIn: "10m"
        }

        )
    }



    generateRefreshToken(userId: mongoose.Types.ObjectId) {
        return this.jwtService.sign(
            {
                userId: userId
            },
            {
                secret: this.configService.get("REFRESH_SECRET"),
                expiresIn: "7d"
            }
        )
    }

}
