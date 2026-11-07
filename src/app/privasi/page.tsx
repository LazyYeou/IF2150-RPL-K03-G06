import Link from "next/link";
export default function Privasi() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto max-w-2xl space-y-5 px-6 py-12"
    >
      <h1 className="text-3xl font-semibold">Kebijakan Privasi</h1>
      <p>
        Kerja-In adalah aplikasi proyek perkuliahan. Gunakan data fiktif saat
        pengujian.
      </p>
      <p>
        Pendaftaran menyimpan nama, email, tanggal lahir, peran, dan waktu
        persetujuan privasi untuk mengelola akun. Kata sandi disimpan sebagai
        hash Argon2id. Cookie sesi digunakan untuk mempertahankan status masuk.
      </p>
      <p>
        Tenaga kerja yang mengajukan verifikasi memberikan dokumen identitas
        melalui alur persetujuan terpisah. Dokumen disimpan terenkripsi dan
        hanya dapat diakses petugas yang berwenang.
      </p>
      <p>
        Hubungi pengelola proyek melalui repository Kerja-In untuk pertanyaan
        atau permintaan terkait data akun.
      </p>
      <Link href="/daftar" className="inline-block underline">
        Kembali ke pendaftaran
      </Link>
    </main>
  );
}
