const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data.detail === "string") {
      return data.detail;
    }
    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item: { msg?: string }) => item.msg ?? "Validation error")
        .join(", ");
    }
  } catch {
    // ignore JSON parse errors
  }
  return "Something went wrong. Please try again.";
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch (err) {
    // Log the real error so it is visible in browser DevTools > Console.
    console.error(`[apiFetch] Network error fetching ${path}:`, err);

    // AbortError is thrown by React Strict Mode's double-invoke in development.
    // It is not a real server failure — do not show the error banner.
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiRequestError("Request was cancelled.", 0);
    }

    throw new ApiRequestError(
      `Unable to reach the server. Is the backend running at ${API_BASE_URL}?`,
      0,
    );
  }

  if (!response.ok) {
    const message = await parseError(response);
    throw new ApiRequestError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export async function checkHealth(): Promise<{ status: string }> {
  return apiFetch("/api/v1/health", { cache: "no-store" });
}

export { API_BASE_URL };
