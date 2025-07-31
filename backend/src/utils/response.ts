export interface ApiSuccess<T = unknown> {
  success: true;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: unknown;
  timestamp: string;
}

export function ok<T>(message: string, data: T, status = 200): { body: ApiSuccess<T>; status: number } {
  return {
    body: {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    },
    status,
  };
}

export function fail(message: string, status = 400, errors?: unknown): { body: ApiError; status: number } {
  return {
    body: {
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    },
    status,
  };
} 