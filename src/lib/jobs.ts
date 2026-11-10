export const jobCategories = [
  { slug: "kebersihan", label: "Kebersihan", tone: "mint" },
  { slug: "perbaikan-rumah", label: "Perbaikan Rumah", tone: "peach" },
  { slug: "angkut-barang", label: "Angkut Barang", tone: "blue" },
  { slug: "acara-katering", label: "Acara & Katering", tone: "peach" },
  { slug: "pertukangan", label: "Pertukangan", tone: "blue" },
  { slug: "lainnya", label: "Lainnya", tone: "mint" },
] as const;

export type JobCategorySlug = (typeof jobCategories)[number]["slug"];
export type JobCategory = (typeof jobCategories)[number]["label"];

export type Job = {
  id: string;
  title: string;
  category: JobCategory;
  categorySlug: JobCategorySlug;
  location: string;
  date: string;
  duration?: string;
  pay: number;
  payUnit: "tugas" | "hari";
  provider: string;
  providerVerified?: boolean;
  description?: string;
  scope?: string[];
  successCriteria?: string;
  demoOnly?: boolean;
};

export const jobs: Job[] = [
  {
    id: "bantu-pindahan-kos-dago",
    title: "Bantu pindahan kos area Dago",
    category: "Angkut Barang",
    categorySlug: "angkut-barang",
    location: "Dago, Bandung",
    date: "2026-10-28",
    duration: "3–4 jam",
    pay: 180_000,
    payUnit: "tugas",
    provider: "Raka Pratama",
    providerVerified: false,
    description:
      "Bantu pindahkan barang kos ke tempat baru. Jarak dekat, barang sudah dikemas. Cocok untuk kamu yang teliti dan terbiasa mengangkat barang.",
    scope: [
      "Mengangkat 8 kardus dan 1 meja belajar",
      "Membantu memuat dan menurunkan barang",
      "Menata barang di kamar tujuan",
    ],
    successCriteria:
      "Seluruh tugas diselesaikan sesuai ruang lingkup dan diperiksa bersama penyedia kerja. Perubahan tugas dan biaya perlu disepakati sebelum dikerjakan.",
  },
  {
    id: "perbaikan-keran-dapur-bocor",
    title: "Perbaikan keran dapur bocor",
    category: "Perbaikan Rumah",
    categorySlug: "perbaikan-rumah",
    location: "Cimahi Tengah, Cimahi",
    date: "2026-10-29",
    pay: 150_000,
    payUnit: "tugas",
    provider: "Dewi Lestari",
  },
  {
    id: "bersih-bersih-acara-komunitas",
    title: "Bersih-bersih setelah acara komunitas",
    category: "Kebersihan",
    categorySlug: "kebersihan",
    location: "Coblong, Bandung",
    date: "2026-10-31",
    pay: 125_000,
    payUnit: "hari",
    provider: "Ruang Warga",
  },
  {
    id: "rakit-rak-kayu-toko-kecil",
    title: "Rakit rak kayu untuk toko kecil",
    category: "Pertukangan",
    categorySlug: "pertukangan",
    location: "Antapani, Bandung",
    date: "2026-10-30",
    pay: 250_000,
    payUnit: "tugas",
    provider: "Toko Sudut",
  },
  {
    id: "bersih-halaman-setelah-renovasi",
    title: "Bersihkan halaman setelah renovasi",
    category: "Kebersihan",
    categorySlug: "kebersihan",
    location: "Lengkong, Bandung",
    date: "2026-11-01",
    duration: "4 jam",
    pay: 200_000,
    payUnit: "tugas",
    provider: "Nadia Putri",
    providerVerified: false,
    description: "Data contoh demo: membantu membersihkan halaman rumah setelah pekerjaan renovasi.",
    scope: ["Mengumpulkan sisa material ringan", "Menyapu halaman", "Merapikan area kerja"],
    successCriteria: "Halaman bersih dan sisa material ringan dikumpulkan di tempat yang disepakati.",
    demoOnly: true,
  },
  {
    id: "siapkan-hidangan-acara-keluarga",
    title: "Siapkan hidangan acara keluarga",
    category: "Acara & Katering",
    categorySlug: "acara-katering",
    location: "Sukajadi, Bandung",
    date: "2026-11-02",
    duration: "1 hari",
    pay: 200_000,
    payUnit: "hari",
    provider: "Bayu Permana",
    providerVerified: false,
    description: "Data contoh demo: membantu persiapan dan penyajian hidangan untuk acara keluarga.",
    scope: ["Menyiapkan area hidangan", "Membantu penyajian makanan", "Merapikan perlengkapan setelah acara"],
    successCriteria: "Hidangan tersaji dan area perlengkapan dirapikan sesuai kesepakatan.",
    demoOnly: true,
  },
];

export function getJobById(id: string): Job | undefined {
  return jobs.find((job) => job.id === id);
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatIndonesianDate(date: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export type JobSearchFilters = {
  keyword: string;
  location: string;
  categories: string[];
  minWage: number;
  savedOnly: boolean;
  savedIds: string[];
  sort: "recent" | "pay";
};

export function filterJobs(
  source: Job[],
  filters: JobSearchFilters,
): Job[] {
  const keyword = filters.keyword.trim().toLocaleLowerCase("id-ID");
  const location = filters.location.trim().toLocaleLowerCase("id-ID");
  const categories = new Set(filters.categories);
  const savedIds = new Set(filters.savedIds);

  const results = source.filter((job) => {
    const matchesKeyword =
      !keyword ||
      [job.title, job.category, job.description, job.provider, ...(job.scope ?? [])]
        .join(" ")
        .toLocaleLowerCase("id-ID")
        .includes(keyword);
    const matchesLocation =
      !location || job.location.toLocaleLowerCase("id-ID").includes(location);
    const matchesCategory =
      categories.size === 0 || categories.has(job.categorySlug);
    const matchesWage = job.pay >= filters.minWage;
    const matchesSaved = !filters.savedOnly || savedIds.has(job.id);

    return matchesKeyword && matchesLocation && matchesCategory && matchesWage && matchesSaved;
  });

  if (filters.sort === "pay") {
    return results
      .map((job, index) => ({ job, index }))
      .sort((a, b) => b.job.pay - a.job.pay || a.index - b.index)
      .map(({ job }) => job);
  }

  return results;
}

export function categoryLabel(slug: string): string | undefined {
  return jobCategories.find((category) => category.slug === slug)?.label;
}
