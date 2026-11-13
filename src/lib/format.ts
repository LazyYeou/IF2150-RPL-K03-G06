const uang = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
const tanggal = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});
export const formatRupiah = (nominal: number) => uang.format(nominal);
export function formatTanggal(nilai: string | Date) {
  const date =
    typeof nilai === "string"
      ? new Date(nilai.length === 10 ? `${nilai}T00:00:00+07:00` : nilai)
      : nilai;
  return Number.isNaN(date.getTime())
    ? "Tanggal belum tersedia"
    : tanggal.format(date);
}
