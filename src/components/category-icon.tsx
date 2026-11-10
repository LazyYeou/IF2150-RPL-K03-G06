import type { JobCategorySlug } from "@/lib/jobs";

const iconPaths: Record<JobCategorySlug, React.ReactNode> = {
  kebersihan: (
    <>
      <path d="m14.5 4.5-8 11" />
      <path d="m5 15.5 5.5 4" />
      <path d="m4 18 2-2m1 4 2-2m1 3 2-2" />
    </>
  ),
  "perbaikan-rumah": (
    <>
      <path d="m14 4 6 6" />
      <path d="M12.5 5.5a4 4 0 0 0-5.2 5.2L3.5 14.5a2.1 2.1 0 0 0 3 3l3.8-3.8a4 4 0 0 0 5.2-5.2l-2.7 2.7-3-3L12.5 5.5Z" />
    </>
  ),
  "angkut-barang": (
    <>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="m4.5 7.7 7.5 4.2 7.5-4.2M12 12v8.5M8 5.3l8 4.5" />
    </>
  ),
  "acara-katering": (
    <>
      <path d="m5 15 10-10 4 4L9 19l-4-4Z" />
      <path d="m5 15 4 4M15 5l4 4" />
      <path d="m18.5 14 .7 1.5 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7.7-1.5ZM5 4v3m-1.5-1.5h3M16 19v2m-1-1h2" />
    </>
  ),
  pertukangan: (
    <>
      <path d="M3 13a9 9 0 0 1 18 0H3Z" />
      <path d="M8 13v3m8-3v3m-10 0h12v3H6v-3ZM12 4v3" />
    </>
  ),
  lainnya: (
    <>
      <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
};

export function CategoryIcon({ category }: { category: JobCategorySlug }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
      width="24"
    >
      {iconPaths[category]}
    </svg>
  );
}
