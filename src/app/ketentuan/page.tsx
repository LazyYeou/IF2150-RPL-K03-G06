import Link from "next/link";
export default function Ketentuan() {
  return (
    <main className="mx-auto max-w-2xl space-y-5 px-6 py-12">
      <h1 className="text-3xl font-semibold">Ketentuan Penggunaan</h1>
      <p>
        Kerja-In merupakan aplikasi proyek perkuliahan untuk mempertemukan
        tenaga kerja dan penyedia kerja. Pengguna harus berusia minimal 17
        tahun.
      </p>
      <p>
        Pilih peran sesuai kebutuhan, jaga kerahasiaan kata sandi, dan gunakan
        layanan secara bertanggung jawab. Jangan mengunggah data pribadi orang
        lain tanpa izin atau menawarkan pekerjaan yang melanggar hukum.
      </p>
      <p>
        Lingkungan pengembangan menggunakan data uji dan payment gateway mock.
        Gunakan akun serta data fiktif untuk mencoba aplikasi.
      </p>
      <Link href="/privasi" className="inline-block underline">
        Baca Kebijakan Privasi
      </Link>
      <br />
      <Link href="/daftar" className="inline-block underline">
        Kembali ke pendaftaran
      </Link>
    </main>
  );
}
