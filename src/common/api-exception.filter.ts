
import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(ApiExceptionFilter.name);

    constructor(
        private readonly httpAdapterHost: HttpAdapterHost,
    ) { }

    catch(exception: unknown, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost;
        const context = host.switchToHttp();
        const request = context.getRequest();

        // Registrar los errores para facilitar el diagnóstico en Render.
        if (exception instanceof Error) {
            this.logger.error(
                `[${request.method} ${request.url}] ${exception.message}`,
                exception.stack,
            );
        } else {
            this.logger.error(
                `Excepción no identificada: ${String(exception)}`,
            );
        }

        // Determinar el código HTTP.
        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        // Obtener la respuesta original de la excepción.
        const exceptionResponse =
            exception instanceof HttpException
                ? exception.getResponse()
                : null;

        const responseBody = this.isRecord(exceptionResponse)
            ? exceptionResponse
            : null;

        const rawMessage =
            typeof exceptionResponse === 'string'
                ? exceptionResponse
                : responseBody?.message;

        // Preparar el mensaje que recibirá el cliente.
        const mensaje = Array.isArray(rawMessage)
            ? rawMessage.join('; ')
            : typeof rawMessage === 'string'
                ? rawMessage
                : status >= 500
                    ? 'Error interno del servidor'
                    : 'La solicitud no pudo completarse';

        // Conservar los datos adicionales de la excepción.
        const data = Array.isArray(rawMessage)
            ? { errors: rawMessage }
            : responseBody
                ? Object.fromEntries(
                    Object.entries(responseBody).filter(
                        ([key]) =>
                            !['statusCode', 'message', 'error'].includes(key),
                    ),
                )
                : null;

        // Enviar la respuesta con el formato estándar de la API.
        httpAdapter.reply(
            context.getResponse(),
            {
                status,
                respuesta: this.classifyStatus(status),
                mensaje,
                data:
                    Object.keys(data ?? {}).length > 0
                        ? data
                        : null,
            },
            status,
        );
    }

    private classifyStatus(
        status: number,
    ): 'info' | 'warning' | 'error' {
        if (status >= 500) return 'error';
        if (status >= 400) return 'warning';
        return 'info';
    }

    private isRecord(
        value: unknown,
    ): value is Record<string, unknown> {
        return (
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value)
        );
    }
}