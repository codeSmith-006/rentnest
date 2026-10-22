import { AxiosError } from "axios";

export interface ErrorSource {
  path: string | number;
  message: string;
}

export interface BackendErrorPayload {
  success?: boolean;
  message?: string;
  error?: string;
  errorMessage?: string;
  errorSources?: ErrorSource[];
  stack?: string;
}

export class AppError extends Error {
  public status?: number;
  public errorSources?: ErrorSource[];
  public fieldErrors: Record<string, string> = {};

  constructor(
    message: string,
    status?: number,
    errorSources?: ErrorSource[]
  ) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.errorSources = errorSources;

    if (errorSources && Array.isArray(errorSources)) {
      errorSources.forEach((src) => {
        if (src.path) {
          this.fieldErrors[String(src.path)] = src.message;
        }
      });
    }
  }
}

/**
 * Parses any unknown error into a structured AppError with user-friendly messages and field error mappings.
 */
export function parseApiError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof AxiosError) {
    const data = error.response?.data as BackendErrorPayload | undefined;
    const status = error.response?.status;

    // Extract message priority
    let message =
      data?.message ||
      data?.errorMessage ||
      data?.error ||
      "";

    if (!message) {
      if (status === 400) message = "Bad Request. Please verify your input.";
      else if (status === 401) message = "Session expired or unauthorized. Please log in.";
      else if (status === 403) message = "Access denied. You do not have permission for this resource.";
      else if (status === 404) message = "Requested resource was not found.";
      else if (status === 409) message = "Resource conflict. An account or listing already exists.";
      else if (status === 422) message = "Unprocessable entity. Validation failed.";
      else if (status && status >= 500) message = "Server error. Our engineers have been alerted.";
      else if (error.code === "ECONNABORTED") message = "Request timed out. Please check your network connection.";
      else if (!error.response && error.request) message = "Unable to connect to the backend server. Please verify the API is running.";
      else message = error.message || "An unexpected network error occurred.";
    }

    return new AppError(message, status, data?.errorSources);
  }

  if (error instanceof Error) {
    return new AppError(error.message);
  }

  return new AppError("An unknown error occurred. Please try again.");
}
