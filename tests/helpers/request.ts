import { NextRequest } from "next/server";

export function makeRequest(
  url: string,
  opts: {
    method?: string;
    body?: unknown;
    cookies?: Record<string, string>;
    headers?: Record<string, string>;
    searchParams?: Record<string, string>;
  } = {}
): NextRequest {
  const u = new URL(url, "http://localhost:3000");
  if (opts.searchParams) {
    for (const [k, v] of Object.entries(opts.searchParams)) {
      u.searchParams.set(k, v);
    }
  }

  const headers = new Headers(opts.headers);
  if (opts.cookies && Object.keys(opts.cookies).length > 0) {
    headers.set(
      "cookie",
      Object.entries(opts.cookies)
        .map(([k, v]) => `${k}=${v}`)
        .join("; ")
    );
  }
  if (opts.body !== undefined) {
    headers.set("content-type", "application/json");
  }

  return new NextRequest(u.toString(), {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
}

export async function jsonBody<T = unknown>(res: Response): Promise<T> {
  return res.json() as Promise<T>;
}

export function makeFormRequest(
  url: string,
  opts: {
    method?: string;
    form: FormData;
    cookies?: Record<string, string>;
    headers?: Record<string, string>;
  }
): NextRequest {
  const u = new URL(url, "http://localhost:3000");
  const headers = new Headers(opts.headers);
  if (opts.cookies && Object.keys(opts.cookies).length > 0) {
    headers.set(
      "cookie",
      Object.entries(opts.cookies)
        .map(([k, v]) => `${k}=${v}`)
        .join("; ")
    );
  }

  return new NextRequest(u.toString(), {
    method: opts.method ?? "POST",
    headers,
    body: opts.form,
  });
}
