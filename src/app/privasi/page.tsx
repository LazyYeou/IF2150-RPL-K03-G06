import Link from "next/link";
export default function Privasi() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto max-w-2xl space-y-5 px-6 py-12"
    >
      <h1 className="text-3xl font-semibold">Kebijakan Privasi</h1>
      <p className="text-sm text-muted-foreground">
        Informasi penggunaan data pada lingkungan proyek Kerja-In.
      </p>
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
      <h2 className="text-xl font-semibold">Profil dan aktivitas akun</h2>
      <p>
        Area layanan dan bio dapat diubah melalui Profil saya. Data pekerjaan,
        pembayaran uji, ulasan, dan tiket digunakan untuk menjalankan alur
        aplikasi. Dokumen identitas tidak ditampilkan sebagai bagian dari profil
        publik.
      </p>
      <h2 className="text-xl font-semibold">Keamanan akun</h2>
      <p>
        Jaga kerahasiaan kata sandi dan tautan reset. Keluar dari akun ketika
        memakai perangkat bersama. Jangan mengirim dokumen atau informasi
        pribadi melalui komentar repository.
      </p>
      <Link
        href="/syarat"
        className="inline-flex min-h-11 items-center underline"
      >
        Baca syarat & ketentuan
      </Link>
      <br />
      <Link
        href="/daftar"
        className="inline-flex min-h-11 items-center underline"
      >
        Kembali ke pendaftaran
      </Link>
    </main>
  );
}
