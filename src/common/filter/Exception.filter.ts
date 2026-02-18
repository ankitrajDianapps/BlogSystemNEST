import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";


@Catch()
export class ExceptionFiltter implements ExceptionFilter {

    catch(exception: any, host: ArgumentsHost) {

        const ctxt = host.switchToHttp()

        const res = ctxt.getResponse()

        console.log(exception)
        console.log(typeof exception)

        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const response = exception.getResponse();

            const message =
                typeof response === "string"
                    ? response
                    : (response as any).message;

            return res.status(status).json({
                statusCode: status,
                message,
            });
        }


        const mongoExceptions = [
            { code: 11000, statusCode: 409, message: "Duplicate key error" },
            { code: 121, statusCode: 400, message: "Document validation failed" },
            { code: 13, statusCode: 401, message: "Unauthorized database access" },
            { code: 50, statusCode: 503, message: "Query exceeded time limit" },
            { code: 91, statusCode: 503, message: "Database shutdown in progress" },
            { code: 11600, statusCode: 503, message: "Interrupted at shutdown" },
            { code: 7, statusCode: 503, message: "Database host not found" },
            { code: 6, statusCode: 503, message: "Database host unreachable" },
            { code: 89, statusCode: 503, message: "Network timeout" },
            { code: 18, statusCode: 401, message: "Authentication failed" },
            { code: 20, statusCode: 400, message: "Illegal operation" },
            { code: 112, statusCode: 500, message: "Write conflict" }
        ];

        const exp = mongoExceptions.find(exp => exp.code === exception?.code)


        if (exp) {
            return res.status(exp?.statusCode).json({ statusCode: exp?.statusCode, message: exp?.message })
        }

        return res.status(500).json({ statusCode: 500, message: "Internal Server Error" })




    }
}