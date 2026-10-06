import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const context = host.switchToHttp();
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = exception instanceof HttpException
      ? exception.getResponse()
      : null;
    const responseBody = this.isRecord(exceptionResponse) ? exceptionResponse : null;
    const rawMessage = typeof exceptionResponse === 'string'
      ? exceptionResponse
      : responseBody?.message;
    const mensaje = Array.isArray(rawMessage)
      ? rawMessage.join('; ')
      : typeof rawMessage === 'string'
        ? rawMessage
        : status >= 500
          ? 'Error interno del servidor'
          : 'La solicitud no pudo completarse';
    const data = Array.isArray(rawMessage)
      ? { errors: rawMessage }
      : responseBody
        ? Object.fromEntries(
            Object.entries(responseBody).filter(([key]) => !['statusCode', 'message', 'error'].includes(key)),
          )
        : null;

    httpAdapter.reply(
      context.getResponse(),
      {
        status,
        respuesta: this.classifyStatus(status),
        mensaje,
        data: Object.keys(data ?? {}).length > 0 ? data : null,
      },
      status,
    );
  }

  private classifyStatus(status: number): 'info' | 'warning' | 'error' {
    if (status >= 500) return 'error';
    if (status >= 400) return 'warning';
    return 'info';
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}