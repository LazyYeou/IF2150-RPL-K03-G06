import { NextResponse, type NextRequest } from "next/server";
import { originValid } from "@/lib/auth/origin";

// Middleware berjalan di Edge: TIDAK boleh menyentuh DB. Hanya cek ada/tidaknya cookie sesi untuk UX;
// otorisasi sesungguhnya tetap di controller via requireUser() (rancangan §8.2).
const NAMA_COOKIE = "kerjain_sesi";
const MUTASI = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (pathname.startsWith("/api/")) {
    // webhook gateway tanpa cookie/Origin; diamankan HMAC
    if (
      MUTASI.has(req.method) &&
      pathname !== "/api/webhooks/payment" &&
      !originValid(
        req.headers.get("origin"),
        process.env.APP_URL ?? "http://localhost:3000",
      )
    ) {
      return NextResponse.json(
        {
          error: { code: "ORIGIN_TIDAK_VALID", message: "Permintaan ditolak" },
        },
        { status: 403 },
      );
    }
    return NextResponse.next();
  }

  if (!req.cookies.has(NAMA_COOKIE)) {
    const url = new URL("/masuk", req.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/tk/:path*", "/pk/:path*", "/cs/:path*", "/api/:path*"],
};
