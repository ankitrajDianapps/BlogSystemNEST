import { HttpException } from "@nestjs/common";

export class AppError extends HttpException {
    statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message, statusCode)

    }
}