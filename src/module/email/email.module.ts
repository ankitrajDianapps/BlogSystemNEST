import { Module } from '@nestjs/common';
import { EmailService } from './email.service.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { from } from 'rxjs';
import { join } from 'path';
import strict from 'assert/strict';


@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (ConfigService) => ({
        transport: {
          host: ConfigService.get("MAIL_HOST"),
          port: ConfigService.get("MAIL_PORT"),
          auth: {
            user: ConfigService.get("MAIL_USER"),
            pass: ConfigService.get("MAIL_PASS")
          }
        },
        defaults: {
          from: `"No Reply" <${ConfigService.get("MAIL_USER")}>`
        },
        template: {
          dir: join(__dirname, "templates"),
          adapter: new (require('@nestjs-modules/mailer/dist/adapters/handlebars.adapter').HandlebarsAdapter)(),
          options: { strict: true }
        }
      })
    })
  ],
  providers: [EmailService],
  exports: [EmailService]
})
export class EmailModule { }
