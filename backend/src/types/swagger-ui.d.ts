declare module '@hono/swagger-ui' {
  import { MiddlewareHandler } from 'hono';
  interface Options {
    url: string;
  }
  export function swaggerUI(opts: Options): MiddlewareHandler;
} 