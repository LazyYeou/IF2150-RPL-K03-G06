import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { dbSementara } from "../helpers/db";
import { tambahFixtureTransaksi } from "../helpers/transaksi";

const jar = vi.hoisted(() => new Map<string, string>());
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (n: string) =>
      jar.has(n) ? { name: n, value: jar.get(n) } : undefined,
    set: (n: string, v: string) => void jar.set(n, v),
    delete: (n: string) => void jar.delete(n),
  }),
}));
let fixture: Awaited<ReturnType<typeof dbSementara>>;
let db: typeof import("@/lib/db").db;
let route: typeof import("@/app/api/transaksi/route");
let detail: typeof import("@/app/api/transaksi/[id]/route");
let masuk: (email: string) => Promise<void>;
const get = (query: string) =>
  route.GET(new Request(`http://localhost/api/transaksi?${query}`));

beforeAll(async () => {
  fixture = await dbSementara();
  tambahFixtureTransaksi(fixture.db);
  fixture.db.close();
  process.env.DATABASE_PATH = fixture.file;
  ({ db } = await import("@/lib/db"));
  route = await import("@/app/api/transaksi/route");
  detail = await import("@/app/api/transaksi/[id]/route");
  const { buatSesi } = await import("@/lib/auth/session");
  masuk = async (email) => {
    jar.clear();
    const user = db
      .prepare("SELECT id_pengguna AS id FROM pengguna WHERE email = ?")
      .get(email) as { id: string };
    await buatSesi(user.id);
  };
});
afterAll(() => {
  jar.clear();
  db.close();
  fixture.tutup();
});

describe("paginasi dan filter transaksi", () => {
  for (const peran of ["TK", "PK"] as const) {
    it(`${peran}: semua transaksi dapat dijangkau tanpa duplikasi walaupun waktu dibuat sama`, async () => {
      await masuk(peran === "TK" ? "tk1@kerjain.test" : "pk1@kerjain.test");
      const pertama = await (await get(`peran=${peran}&page=1`)).json();
      expect(pertama.total).toBeGreaterThan(26);
      const ids: string[] = [];
      for (
        let page = 1;
        page <= Math.ceil(pertama.total / pertama.pageSize);
        page++
      ) {
        const response = await get(`peran=${peran}&page=${page}`);
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.page).toBe(page);
        ids.push(...body.items.map((item: { id: string }) => item.id));
      }
      expect(new Set(ids).size).toBe(pertama.total);
      expect(ids.length).toBe(pertama.total);
      const ulang = await (await get(`peran=${peran}&page=1`)).json();
      expect(ulang.items).toEqual(pertama.items);
    });

    it(`${peran}: filter berlaku pada items, total, dan setiap halaman`, async () => {
      await masuk(peran === "TK" ? "tk1@kerjain.test" : "pk1@kerjain.test");
      const a = await (
        await get(`peran=${peran}&status=SUBMITTED&page=1`)
      ).json();
      const b = await (
        await get(`peran=${peran}&status=SUBMITTED&page=2`)
      ).json();
      expect(a.total).toBe(15);
      expect(a.items.length).toBe(12);
      expect(b.items.length).toBe(3);
      const semua = [...a.items, ...b.items];
      expect(semua.every((item) => item.status === "SUBMITTED")).toBe(true);
      expect(new Set(semua.map((item) => item.id)).size).toBe(a.total);
      const selesai = await (
        await get(`peran=${peran}&status=COMPLETED`)
      ).json();
      expect(selesai.total).toBe(1);
      expect(selesai.items[0].status).toBe("COMPLETED");
    });
  }
  it("filter tidak membuka akses transaksi pengguna lain", async () => {
    await masuk("tk2@kerjain.test");
    const body = await (await get("peran=TK&status=SUBMITTED")).json();
    expect(body).toMatchObject({ items: [], total: 0 });
    expect((await get("peran=PK")).status).toBe(403);
  });
  it("CS tetap dapat memfilter daftar transaksi", async () => {
    await masuk("cs1@kerjain.test");
    const response = await get("peran=TK&status=COMPLETED");
    expect(response.status).toBe(200);
    expect(
      (await response.json()).items.every(
        (item: { status: string }) => item.status === "COMPLETED",
      ),
    ).toBe(true);
  });
  it.each([
    "status=TIDAK_VALID",
    "page=0",
    "page=-1",
    "page=abc",
    "status=SUBMITTED%27%20OR%201=1--",
  ])("query tidak valid ditolak: %s", async (query) => {
    await masuk("tk1@kerjain.test");
    expect((await get(`peran=TK&${query}`)).status).toBe(400);
  });
  it("halaman di luar jangkauan mengembalikan daftar kosong beserta total", async () => {
    await masuk("tk1@kerjain.test");
    const body = await (await get("peran=TK&page=999&status=COMPLETED")).json();
    expect(body).toMatchObject({ items: [], total: 1, page: 999 });
  });
});

it("detail memakai riwayat pembayaran dan status sebelum sengketa untuk timeline", async () => {
  await masuk("tk1@kerjain.test");
  const ambil = async (id: string) =>
    (
      await detail.GET(new Request(`http://localhost/api/transaksi/${id}`), {
        params: Promise.resolve({ id }),
      })
    ).json();
  const tunggu = db
    .prepare(
      "SELECT id_transaksi AS id FROM transaksi_pekerjaan WHERE status_pekerjaan = 'MENUNGGU_PEMBAYARAN' LIMIT 1",
    )
    .get() as { id: string };
  // Data pembatalan lama sebelum pembayaran tetap harus ditampilkan secara benar.
  db.prepare(
    "UPDATE transaksi_pekerjaan SET status_pekerjaan = 'DIBATALKAN' WHERE id_transaksi = ?",
  ).run(tunggu.id);
  const batal = await ambil(tunggu.id);
  expect(
    batal.timeline.find(
      (item: { status: string }) => item.status === "IN_PROGRESS",
    ).tercapai,
  ).toBe(false);
  const sengketa = db
    .prepare(
      "SELECT id_transaksi AS id FROM transaksi_pekerjaan WHERE status_pekerjaan = 'DISENGKETAKAN' LIMIT 1",
    )
    .get() as { id: string };
  const dto = await ambil(sengketa.id);
  expect(
    dto.timeline.find(
      (item: { status: string }) => item.status === "SUBMITTED",
    ),
  ).toMatchObject({ tercapai: true, aktif: false });
  expect(dto.labelStatus).toBe("Dalam peninjauan CS");
});
