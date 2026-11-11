import { z } from "zod";
import {
  jobCategories,
  type CreateJobInput,
} from "@/features/jobs/management-api";

const categorySchema = z.enum(jobCategories);
const workDateSchema = z.string().refine(
  (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split("-").map(Number);
    const selectedDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (
      selectedDate.getFullYear() === year &&
      selectedDate.getMonth() === month - 1 &&
      selectedDate.getDate() === day &&
      selectedDate >= today
    );
  },
  "Pilih tanggal pekerjaan yang valid dan tidak di masa lalu.",
);

const formSchema = z
  .object({
    judul: z.string().trim().min(8, "Judul minimal 8 karakter.").max(150, "Judul maksimal 150 karakter."),
    deskripsi: z.string().trim().min(20, "Deskripsi minimal 20 karakter.").max(2000, "Deskripsi maksimal 2.000 karakter."),
    ruangLingkup: z.string().trim().min(1, "Lengkapi ruang lingkup pekerjaan."),
    kriteriaHasil: z.string().trim().min(1, "Lengkapi kriteria hasil pekerjaan."),
    kategori: categorySchema
      .or(z.literal(""))
      .refine((category) => category !== "", "Pilih kategori pekerjaan."),
    lokasi: z.string().trim().min(1, "Lokasi wajib diisi."),
    tanggalPekerjaan: workDateSchema,
    estimasiDurasi: z.string().trim().min(1, "Estimasi durasi wajib diisi."),
    upah: z
      .string()
      .regex(/^\d+$/, "Masukkan nominal upah dalam angka.")
      .transform(Number)
      .pipe(z.number().int().min(1000, "Upah minimum Rp1.000.").max(100_000_000, "Upah maksimal Rp100.000.000.")),
    satuanUpah: z.enum(["PER_TUGAS", "PER_HARI"]),
    kuota: z
      .string()
      .regex(/^\d+$/, "Kuota harus berupa angka bulat.")
      .transform(Number)
      .pipe(z.number().int().min(1, "Kuota minimal 1 pekerja.").max(50, "Kuota maksimal 50 pekerja.")),
    pernyataanRisiko: z.boolean(),
  })
  .strict();

export const jobPostingStepSchemas = [
  formSchema.pick({
    judul: true,
    deskripsi: true,
    ruangLingkup: true,
    kriteriaHasil: true,
    kategori: true,
  }),
  formSchema.pick({
    lokasi: true,
    tanggalPekerjaan: true,
    estimasiDurasi: true,
  }),
  formSchema
    .pick({
      kategori: true,
      upah: true,
      satuanUpah: true,
      kuota: true,
      pernyataanRisiko: true,
    })
    .superRefine((values, context) => {
      if (values.kategori === "Kelistrikan" && !values.pernyataanRisiko) {
        context.addIssue({
          code: "custom",
          path: ["pernyataanRisiko"],
          message: "Pernyataan risiko wajib disetujui untuk kategori ini.",
        });
      }
    }),
] as const;

export const jobPostingSchema = formSchema
  .omit({ kategori: true })
  .extend({ kategori: categorySchema })
  .superRefine((values, context) => {
    if (values.kategori === "Kelistrikan" && !values.pernyataanRisiko) {
      context.addIssue({
        code: "custom",
        path: ["pernyataanRisiko"],
        message: "Pernyataan risiko wajib disetujui untuk kategori ini.",
      });
    }
  });

export type JobPostingFormValues = z.input<typeof formSchema>;

export function validateJobPostingStep(
  values: JobPostingFormValues,
  step: number,
): Partial<Record<keyof JobPostingFormValues, string>> {
  const schema = jobPostingStepSchemas[step as 0 | 1 | 2];
  if (!schema) return {};
  const result = schema.safeParse(values);
  if (result.success) return {};

  const errors: Partial<Record<keyof JobPostingFormValues, string>> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof JobPostingFormValues | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

export function validateJobPosting(
  values: JobPostingFormValues,
):
  | { success: true; data: CreateJobInput }
  | {
      success: false;
      errors: Partial<Record<keyof JobPostingFormValues, string>>;
    } {
  const result = jobPostingSchema.safeParse(values);
  if (result.success) {
    return {
      success: true,
      data: {
        ...result.data,
        kategori: result.data.kategori,
      },
    };
  }

  const errors: Partial<Record<keyof JobPostingFormValues, string>> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof JobPostingFormValues | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return { success: false, errors };
}
