import { toResponse } from "@/lib/errors";

/** Respons unduhan berkas privat: tanpa cache dan tanpa MIME sniffing (rancangan §12). */
export async function berkasResponse(
  ambil: () => Promise<{ data: Buffer; mime: string }>,
): Promise<Response> {
  try {
    const { data, mime } = await ambil();
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    return toResponse(e);
  }
}
