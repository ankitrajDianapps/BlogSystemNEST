import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";


@Injectable()
export class EmailService {

    constructor(
        private mailerService: MailerService
    ) { }


    async sendOTPEmail(to: string, name: any, otp: string) {
        console.log("ha bhai")
        await this.mailerService.sendMail({
            to,
            subject: "OTP Verification",
            template: "otp",
            context: {
                name,
                otp
            }

        })
    }
}