import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

type ApiResponseStatus = 'success' | 'info' | 'warning' | 'error';

interface ApiResponse<T> {
  status: number;
  respuesta: ApiResponseStatus;
  mensaje: string;
  data: T;
}

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<unknown>> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((body: unknown) => {
        const status = response.statusCode as number;
        const payload = this.isRecord(body) ? body : null;
        const hasData = payload && Object.hasOwn(payload, 'data');
        const extraData = payload
          ? Object.fromEntries(
              Object.entries(payload).filter(([key]) => !['ok', 'mensaje', 'data'].includes(key)),
            )
          : {};
        const data = hasData
          ? Object.keys(extraData).length > 0
            ? { ...(this.isRecord(payload.data) ? payload.data : { value: payload.data }), ...extraData }
            : payload.data
          : payload
            ? Object.keys(extraData).length > 0 ? extraData : null
            : body;
        const success = payload?.ok !== false;

        return {
          status,
          respuesta: success ? this.classifyStatus(status) : 'warning',
          mensaje: typeof payload?.mensaje === 'string'
            ? payload.mensaje
            : this.defaultMessage(status),
          data,
        };
      }),
    );
  }

  private classifyStatus(status: number): ApiResponseStatus {
    if (status >= 500) return 'error';
    if (status >= 400) return 'warning';
    if (status >= 300) return 'info';
    return 'success';
  }

  private defaultMessage(status: number): string {
    if (status === 204) return 'Operación completada sin contenido';
    return 'Operación completada correctamente';
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}