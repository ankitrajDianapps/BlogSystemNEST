import { Injectable, ParseUUIDPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ParseObjectIdPipe } from "@nestjs/mongoose";

import { JwtService } from "@nestjs/jwt";

@Injectable()
export class TokenService {

    constructor(private readonly configService: ConfigService) { }

    generateAccessToken({ userId: ParseObjectIdPipe, email: string }) {

    }
}