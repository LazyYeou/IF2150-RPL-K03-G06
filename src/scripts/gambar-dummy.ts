import { crc32, deflateSync } from "node:zlib";

// Pembuat berkas dummy untuk seed demo: PNG berlabel (tanpa dependensi) dan PDF satu halaman.
// Hanya untuk data pengembangan; bukan dokumen identitas atau bukti sungguhan.

const GLYPH: Record<string, string> = {
  A: "01110 10001 10001 11111 10001 10001 10001",
  B: "11110 10001 10001 11110 10001 10001 11110",
  C: "01110 10001 10000 10000 10000 10001 01110",
  D: "11110 10001 10001 10001 10001 10001 11110",
  E: "11111 10000 10000 11110 10000 10000 11111",
  F: "11111 10000 10000 11110 10000 10000 10000",
  G: "01110 10001 10000 10111 10001 10001 01111",
  H: "10001 10001 10001 11111 10001 10001 10001",
  I: "01110 00100 00100 00100 00100 00100 01110",
  J: "00111 00010 00010 00010 00010 10010 01100",
  K: "10001 10010 10100 11000 10100 10010 10001",
  L: "10000 10000 10000 10000 10000 10000 11111",
  M: "10001 11011 10101 10101 10001 10001 10001",
  N: "10001 11001 10101 10011 10001 10001 10001",
  O: "01110 10001 10001 10001 10001 10001 01110",
  P: "11110 10001 10001 11110 10000 10000 10000",
  Q: "01110 10001 10001 10001 10101 10010 01101",
  R: "11110 10001 10001 11110 10100 10010 10001",
  S: "01111 10000 10000 01110 00001 00001 11110",
  T: "11111 00100 00100 00100 00100 00100 00100",
  U: "10001 10001 10001 10001 10001 10001 01110",
  V: "10001 10001 10001 10001 10001 01010 00100",
  W: "10001 10001 10001 10101 10101 11011 10001",
  X: "10001 10001 01010 00100 01010 10001 10001",
  Y: "10001 10001 01010 00100 00100 00100 00100",
  Z: "11111 00001 00010 00100 01000 10000 11111",
  "0": "01110 10001 10011 10101 11001 10001 01110",
  "1": "00100 01100 00100 00100 00100 00100 01110",
  "2": "01110 10001 00001 00010 00100 01000 11111",
  "3": "11110 00001 00001 01110 00001 00001 11110",
  "4": "00010 00110 01010 10010 11111 00010 00010",
  "5": "11111 10000 11110 00001 00001 10001 01110",
  "6": "00110 01000 10000 11110 10001 10001 01110",
  "7": "11111 00001 00010 00100 01000 01000 01000",
  "8": "01110 10001 10001 01110 10001 10001 01110",
  "9": "01110 10001 10001 01111 00001 00010 01100",
  "-": "00000 00000 00000 11111 00000 00000 00000",
  "#": "01010 01010 11111 01010 11111 01010 01010",
  ":": "00000 00100 00100 00000 00100 00100 00000",
  " ": "00000 00000 00000 00000 00000 00000 00000",
};

const LEBAR = 640;
const TINGGI = 400;

/** Gambar teks (huruf besar, angka, spasi, `-`, `#`, `:`) pada buffer RGB dengan skala `s` piksel per titik. */
function tulis(
  px: Buffer,
  teks: string,
  tengahX: number,
  y: number,
  s: number,
  warna: [number, number, number],
) {
  const huruf = [...teks.toUpperCase()].map((c) => GLYPH[c] ?? GLYPH[" "]);
  const lebar = huruf.length * 6 * s - s;
  let x0 = Math.round(tengahX - lebar / 2);
  for (const g of huruf) {
    g.split(" ").forEach((baris, r) => {
      [...baris].forEach((bit, k) => {
        if (bit !== "1") return;
        for (let dy = 0; dy < s; dy++)
          for (let dx = 0; dx < s; dx++) {
            const i = ((y + r * s + dy) * LEBAR + x0 + k * s + dx) * 3;
            if (i >= 0 && i + 2 < px.length) {
              px[i] = warna[0];
              px[i + 1] = warna[1];
              px[i + 2] = warna[2];
            }
          }
      });
    });
    x0 += 6 * s;
  }
}

function chunk(tipe: string, data: Buffer) {
  const panjang = Buffer.alloc(4);
  panjang.writeUInt32BE(data.length);
  const isi = Buffer.concat([Buffer.from(tipe), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(isi) >>> 0);
  return Buffer.concat([panjang, isi, crc]);
}

/**
 * PNG 640x400 dengan gradasi berwarna `hue`, garis diagonal, dan label di tengah.
 * `baris1` besar, `baris2` sedang; pita bawah selalu bertuliskan DATA DUMMY.
 */
export function pngDummy(baris1: string, baris2: string, hue: number): Buffer {
  const px = Buffer.alloc(LEBAR * TINGGI * 3);
  const [r0, g0, b0] = hsl(hue, 0.55, 0.42);
  const [r1, g1, b1] = hsl((hue + 40) % 360, 0.6, 0.62);
  for (let y = 0; y < TINGGI; y++)
    for (let x = 0; x < LEBAR; x++) {
      const t = (x / LEBAR + y / TINGGI) / 2;
      const garis = (x + y) % 48 < 4 ? 0.12 : 0;
      const i = (y * LEBAR + x) * 3;
      px[i] = clamp(r0 + (r1 - r0) * t + garis * 255);
      px[i + 1] = clamp(g0 + (g1 - g0) * t + garis * 255);
      px[i + 2] = clamp(b0 + (b1 - b0) * t + garis * 255);
    }
  // bingkai putih
  for (let y = 0; y < TINGGI; y++)
    for (let x = 0; x < LEBAR; x++)
      if (x < 6 || y < 6 || x >= LEBAR - 6 || y >= TINGGI - 6)
        px.fill(255, (y * LEBAR + x) * 3, (y * LEBAR + x) * 3 + 3);
  tulis(px, baris1, LEBAR / 2, 120, 7, [255, 255, 255]);
  tulis(px, baris2, LEBAR / 2, 230, 4, [255, 255, 255]);
  // pita bawah
  for (let y = TINGGI - 56; y < TINGGI - 6; y++)
    for (let x = 6; x < LEBAR - 6; x++) {
      const i = (y * LEBAR + x) * 3;
      px[i] = 20;
      px[i + 1] = 30;
      px[i + 2] = 50;
    }
  tulis(
    px,
    "DATA DUMMY - KERJA-IN",
    LEBAR / 2,
    TINGGI - 44,
    3,
    [255, 220, 120],
  );

  const mentah = Buffer.alloc((LEBAR * 3 + 1) * TINGGI);
  for (let y = 0; y < TINGGI; y++)
    px.copy(
      mentah,
      y * (LEBAR * 3 + 1) + 1,
      y * LEBAR * 3,
      (y + 1) * LEBAR * 3,
    );
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(LEBAR, 0);
  ihdr.writeUInt32BE(TINGGI, 4);
  ihdr[8] = 8; // 8 bit
  ihdr[9] = 2; // RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(mentah)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
function hsl(h: number, s: number, l: number): [number, number, number] {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}

/** PDF satu halaman berisi teks; offset xref dihitung agar valid di penampil PDF. */
export function pdfDummy(judul: string, isi: string): Buffer {
  const bersih = (s: string) => s.replace(/[()\\]/g, " ");
  const aliran = `BT /F1 20 Tf 60 720 Td (${bersih(judul)}) Tj 0 -34 Td /F1 12 Tf (${bersih(isi)}) Tj 0 -24 Td (DATA DUMMY - KERJA-IN, bukan dokumen sungguhan) Tj ET`;
  const objek = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${aliran.length} >>\nstream\n${aliran}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let out = "%PDF-1.4\n";
  const offset: number[] = [];
  objek.forEach((o, i) => {
    offset.push(out.length);
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objek.length + 1}\n0000000000 65535 f \n`;
  for (const o of offset) out += `${String(o).padStart(10, "0")} 00000 n \n`;
  out += `trailer\n<< /Size ${objek.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, "latin1");
}
