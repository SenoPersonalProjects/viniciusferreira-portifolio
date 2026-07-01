export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

function getAllowedOrigins() {
  return (Deno.env.get("ALLOWED_WEB_ORIGINS") ?? "*")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function createCorsHeaders(request: Request) {
  const requestOrigin = request.headers.get("origin") ?? "";
  const allowedOrigins = getAllowedOrigins();
  const hasWildcard = allowedOrigins.includes("*");
  const allowedOrigin =
    hasWildcard || !requestOrigin || allowedOrigins.includes(requestOrigin)
      ? hasWildcard
        ? "*"
        : requestOrigin || allowedOrigins[0]
      : allowedOrigins[0] ?? "*";

  return {
    "access-control-allow-headers":
      "authorization, content-type, apikey, x-client-info",
    "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
    "access-control-allow-origin": allowedOrigin,
    "access-control-max-age": "86400",
    vary: "Origin",
  };
}

export function createOptionsResponse(request: Request) {
  return new Response(null, {
    headers: createCorsHeaders(request),
    status: 204,
  });
}

export function jsonResponse(
  request: Request,
  body: unknown,
  status = 200,
) {
  return new Response(JSON.stringify(body), {
    headers: {
      ...createCorsHeaders(request),
      "content-type": "application/json; charset=utf-8",
    },
    status,
  });
}

export function emptyJsonResponse(request: Request, status = 204) {
  return new Response(null, {
    headers: createCorsHeaders(request),
    status,
  });
}

export async function readJsonBody(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new HttpError(400, "Payload JSON invalido");
    }

    return body as Record<string, unknown>;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(400, "Payload JSON invalido");
  }
}

export function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";

  return authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";
}

export function getFunctionPath(request: Request, functionName: string) {
  const { pathname } = new URL(request.url);
  const markers = [
    `/functions/v1/${functionName}`,
    `/${functionName}`,
  ];

  for (const marker of markers) {
    if (pathname === marker) {
      return "/";
    }

    if (pathname.startsWith(`${marker}/`)) {
      return pathname.slice(marker.length) || "/";
    }
  }

  return pathname || "/";
}

export function handleError(request: Request, error: unknown) {
  if (error instanceof HttpError) {
    return jsonResponse(
      request,
      {
        error: error.message,
        statusCode: error.status,
      },
      error.status,
    );
  }

  console.error("[edge-function] unexpected error", error);

  return jsonResponse(
    request,
    {
      error: "Erro interno do backend Supabase.",
      statusCode: 500,
    },
    500,
  );
}

export function requireMethod(request: Request, method: string) {
  if (request.method !== method) {
    throw new HttpError(405, "Metodo nao permitido");
  }
}
