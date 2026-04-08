import { NextResponse } from "next/server";
import { ZodError } from "zod";

// API Response Types
export type ApiResponse<T = unknown> = {
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
};

export type ApiSuccessResponse<T> = {
  data: T;
};

export type ApiErrorResponse = {
  error: string;
  errors?: Record<string, string[]>;
};

// Response Helpers
export function successResponse<T>(data: T, status: number = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ data }, { status });
}

export function errorResponse(
  error: string,
  status: number = 500,
  errors?: Record<string, string[]>
): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ error, errors }, { status });
}

export function validationErrorResponse(zodError: ZodError): NextResponse<ApiErrorResponse> {
  const errors: Record<string, string[]> = {};
  
  zodError.issues.forEach((err) => {
    const path = err.path.join(".");
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(err.message);
  });

  return NextResponse.json(
    {
      error: "Validation failed",
      errors,
    },
    { status: 400 }
  );
}

export function notFoundResponse(resource: string = "Resource"): NextResponse<ApiErrorResponse> {
  return errorResponse(`${resource} not found`, 404);
}

export function unauthorizedResponse(message: string = "Unauthorized"): NextResponse<ApiErrorResponse> {
  return errorResponse(message, 401);
}

export function forbiddenResponse(message: string = "Forbidden"): NextResponse<ApiErrorResponse> {
  return errorResponse(message, 403);
}

export function conflictResponse(message: string): NextResponse<ApiErrorResponse> {
  return errorResponse(message, 409);
}

export function badRequestResponse(message: string): NextResponse<ApiErrorResponse> {
  return errorResponse(message, 400);
}
