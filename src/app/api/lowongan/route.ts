import {
  prosesCariLowongan,
  prosesPembuatanLowongan,
} from "@/controllers/LowonganPekerjaanController";
import { toResponse } from "@/lib/errors";
import { bacaJson, bacaQuery } from "@/lib/http";

// GET /api/lowongan?q=&kategori=&upahMin=&urut=&page= (publik)
export async function GET(req: Request) {
  try {
    return Response.json(await prosesCariLowongan(bacaQuery(req)));
  } catch (e) {
    return toResponse(e);
  }
}

// POST /api/lowongan (PK)
export async function POST(req: Request) {
  try {
    return Response.json(await prosesPembuatanLowongan(await bacaJson(req)), {
      status: 201,
    });
  } catch (e) {
    return toResponse(e);
  }
}
