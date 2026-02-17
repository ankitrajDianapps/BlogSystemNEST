import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs";



export class ResponseInterceptor implements NestInterceptor {

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {

        return next.handle()
            .pipe(
                map((response) => {
                    return {
                        success: true,
                        message: response.message,
                        data: response.data
                    }
                })



            )
    }

}