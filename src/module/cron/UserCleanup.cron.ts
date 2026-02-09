import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "../../Schema/user.schema.js";
import { Model } from "mongoose";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class UserCleanUpCron {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async InActiveUserCleanUp() {

        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

        await this.userModel.updateMany(
            { lastLogin: { $lte: ninetyDaysAgo } },
            { isActive: false })
    }
}