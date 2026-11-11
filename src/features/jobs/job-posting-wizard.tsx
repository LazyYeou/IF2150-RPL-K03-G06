"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  createManagedJob,
  JobManagementApiError,
  jobCategories,
  type JobCategory,
  type WageUnit,
} from "@/features/jobs/management-api";
import {
  validateJobPosting,
  validateJobPostingStep,
  type JobPostingFormValues,
} from "@/features/jobs/job-posting-schema";

type FormValues = JobPostingFormValues;

type FieldName = keyof FormValues;
type FieldErrors = Partial<Record<FieldName, string>>;

const initialValues: FormValues = {
  judul: "",
  deskripsi: "",
  ruangLingkup: "",
  kriteriaHasil: "",
  kategori: "",
  lokasi: "",
  tanggalPekerjaan: "",
  estimasiDurasi: "",
  upah: "",
  satuanUpah: "PER_TUGAS",
  kuota: "1",
  pernyataanRisiko: false,
};

const steps = [
  { title: "Detail", description: "Informasi pekerjaan" },
  { title: "Lokasi & jadwal", description: "Tempat dan waktu" },
  { title: "Upah & ketentuan", description: "Biaya dan kapasitas" },
  { title: "Tinjau", description: "Periksa dan terbitkan" },
] as const;

const fieldsByStep: FieldName[][] = [
  ["judul", "deskripsi", "ruangLingkup", "kriteriaHasil", "kategori"],
  ["lokasi", "tanggalPekerjaan", "estimasiDurasi"],
  ["upah", "satuanUpah", "kuota", "pernyataanRisiko"],
  [],
];

const riskyCategories: JobCategory[] = ["Kelistrikan"];

function isRiskyCategory(category: FormValues["kategori"]): boolean {
  return category !== "" && riskyCategories.includes(category);
}

function rupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function dateLabel(value: string): string {
  if (!value) return "Belum diisi";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function JobPostingWizard() {
  const router = useRouter();
  const cancelDialogRef = useRef<HTMLDialogElement>(null);
  const [values, setValues] = useState(initialValues);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [attemptedStep, setAttemptedStep] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty || isSubmitting) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const confirmInternalNavigation = (event: MouseEvent) => {
      if (!isDirty || isSubmitting || !(event.target instanceof Element)) return;
      const anchor = event.target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank") return;
      if (anchor.origin !== window.location.origin) return;
      event.preventDefault();
      event.stopPropagation();
      if (
        window.confirm(
          "Isian lowongan belum diterbitkan. Tinggalkan halaman dan buang perubahan?",
        )
      ) {
        window.location.assign(anchor.href);
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", confirmInternalNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", confirmInternalNavigation, true);
    };
  }, [isDirty, isSubmitting]);

  function updateField<K extends FieldName>(field: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setIsDirty(true);
    setSubmitError("");
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      if (field === "kategori" && value === "Kelistrikan") {
        delete next.pernyataanRisiko;
      }
      return next;
    });
  }

  function continueStep() {
    const stepErrors = validateJobPostingStep(values, step);
    setErrors((current) => ({ ...current, ...stepErrors }));
    setAttemptedStep(true);
    if (Object.keys(stepErrors).length > 0) return;
    setStep((current) => Math.min(current + 1, steps.length - 1));
    setAttemptedStep(false);
    setErrors({});
  }

  function previousStep() {
    setStep((current) => Math.max(current - 1, 0));
    setAttemptedStep(false);
    setErrors({});
    setSubmitError("");
  }

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    const validation = validateJobPosting(values);
    if (!validation.success) {
      const firstInvalidStep = fieldsByStep.findIndex((_, index) =>
        Object.keys(validateJobPostingStep(values, index)).length > 0,
      );
      setErrors(validation.errors);
      setStep(Math.max(firstInvalidStep, 0));
      setAttemptedStep(true);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    try {
      const job = await createManagedJob(validation.data);
      setIsDirty(false);
      router.push(`/pk/lowongan/${encodeURIComponent(job.id)}`);
    } catch (error) {
      if (error instanceof JobManagementApiError) {
        if (error.fields) {
          setErrors(
            Object.fromEntries(
              Object.entries(error.fields).map(([field, message]) => [
                field,
                message,
              ]),
            ) as FieldErrors,
          );
          const invalidField = Object.keys(error.fields)[0] as FieldName | undefined;
          const invalidStep = invalidField
            ? fieldsByStep.findIndex((stepFields) => stepFields.includes(invalidField))
            : -1;
          if (invalidStep >= 0) {
            setStep(invalidStep);
            setAttemptedStep(true);
          }
        }
        setSubmitError(
          error.statusCode === 403
            ? "Hanya penyedia kerja yang dapat menerbitkan lowongan. Silakan masuk dengan akun yang sesuai."
            : error.message,
        );
      } else {
        setSubmitError(
          error instanceof Error
            ? error.message
            : "Lowongan belum dapat diterbitkan. Silakan coba lagi.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const categoryIsRisky = isRiskyCategory(values.kategori);

  return (
    <div className="job-wizard-page shell">
      <Link className="back-link" href="/pk/lowongan">
        <span aria-hidden="true">←</span> Kembali ke lowongan saya
      </Link>

      <header className="job-wizard-heading">
        <p className="eyebrow">Kelola kebutuhan pekerjaan</p>
        <h1>Pasang pekerjaan</h1>
        <p className="muted-copy">
          Ceritakan kebutuhanmu agar tenaga kerja yang tepat dapat mengajukan penawaran.
        </p>
      </header>

      <ol aria-label="Langkah pembuatan lowongan" className="job-wizard-steps">
        {steps.map((item, index) => (
          <li
            aria-current={index === step ? "step" : undefined}
            className={index === step ? "is-current" : index < step ? "is-complete" : ""}
            key={item.title}
          >
            <span className="job-wizard-step-number">
              {index < step ? "✓" : index + 1}
            </span>
            <span className="job-wizard-step-copy">
              <strong>{item.title}</strong>
              <span>{item.description}</span>
            </span>
          </li>
        ))}
      </ol>

      <form className="job-wizard-card" onSubmit={(event) => void publish(event)} noValidate>
        <div className="job-wizard-card-heading">
          <div>
            <span className="job-wizard-step-eyebrow">Langkah {step + 1} dari 4</span>
            <h2>{steps[step].title}</h2>
          </div>
          <span className="job-wizard-required-note">* Wajib diisi</span>
        </div>

        {step === 0 && (
          <div className="job-wizard-fields">
            <label className="job-wizard-field" htmlFor="job-title">
              <span>Judul pekerjaan <b>*</b></span>
              <input
                aria-describedby={errors.judul ? "job-title-error" : "job-title-help"}
                aria-invalid={Boolean(errors.judul)}
                id="job-title"
                maxLength={150}
                onChange={(event) => updateField("judul", event.target.value)}
                placeholder="Contoh: Bantu pindahan rumah di Dago"
                value={values.judul}
              />
              {errors.judul ? (
                <small className="job-wizard-field-error" id="job-title-error">{errors.judul}</small>
              ) : (
                <small className="job-wizard-field-help" id="job-title-help">
                  Gunakan judul yang jelas, 8–150 karakter.
                </small>
              )}
            </label>

            <label className="job-wizard-field" htmlFor="job-category">
              <span>Kategori pekerjaan <b>*</b></span>
              <select
                aria-invalid={Boolean(errors.kategori)}
                id="job-category"
                onChange={(event) => updateField("kategori", event.target.value as JobCategory | "")}
                value={values.kategori}
              >
                <option value="">Pilih kategori</option>
                {jobCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.kategori && <small className="job-wizard-field-error">{errors.kategori}</small>}
            </label>

            <label className="job-wizard-field" htmlFor="job-description">
              <span>Deskripsi pekerjaan <b>*</b></span>
              <textarea
                aria-invalid={Boolean(errors.deskripsi)}
                id="job-description"
                maxLength={2000}
                onChange={(event) => updateField("deskripsi", event.target.value)}
                placeholder="Jelaskan pekerjaan dan kebutuhan yang perlu diketahui pelamar."
                rows={4}
                value={values.deskripsi}
              />
              <span className="job-wizard-field-meta">
                {errors.deskripsi ? (
                  <small className="job-wizard-field-error">{errors.deskripsi}</small>
                ) : (
                  <small className="job-wizard-field-help">Minimal 20 karakter.</small>
                )}
                <small>{values.deskripsi.length}/2.000</small>
              </span>
            </label>

            <label className="job-wizard-field" htmlFor="job-scope">
              <span>Ruang lingkup pekerjaan <b>*</b></span>
              <textarea
                aria-invalid={Boolean(errors.ruangLingkup)}
                id="job-scope"
                onChange={(event) => updateField("ruangLingkup", event.target.value)}
                placeholder="Contoh: Angkat 8 kardus dan bantu menata barang di lokasi tujuan."
                rows={3}
                value={values.ruangLingkup}
              />
              {errors.ruangLingkup && <small className="job-wizard-field-error">{errors.ruangLingkup}</small>}
            </label>

            <label className="job-wizard-field" htmlFor="job-success">
              <span>Kriteria hasil pekerjaan <b>*</b></span>
              <textarea
                aria-invalid={Boolean(errors.kriteriaHasil)}
                id="job-success"
                onChange={(event) => updateField("kriteriaHasil", event.target.value)}
                placeholder="Jelaskan hasil yang menandakan pekerjaan selesai dengan baik."
                rows={3}
                value={values.kriteriaHasil}
              />
              {errors.kriteriaHasil && <small className="job-wizard-field-error">{errors.kriteriaHasil}</small>}
            </label>
          </div>
        )}

        {step === 1 && (
          <div className="job-wizard-fields">
            <div className="job-wizard-info">
              <span aria-hidden="true">⌖</span>
              <p>
                Masukkan wilayah pekerjaan secara umum. Alamat lengkap dapat dibagikan
                setelah ada kesepakatan.
              </p>
            </div>
            <label className="job-wizard-field" htmlFor="job-location">
              <span>Kecamatan dan kota <b>*</b></span>
              <input
                aria-invalid={Boolean(errors.lokasi)}
                id="job-location"
                onChange={(event) => updateField("lokasi", event.target.value)}
                placeholder="Contoh: Coblong, Bandung"
                value={values.lokasi}
              />
              {errors.lokasi && <small className="job-wizard-field-error">{errors.lokasi}</small>}
            </label>
            <div className="job-wizard-field-grid">
              <label className="job-wizard-field" htmlFor="job-date">
                <span>Tanggal pekerjaan <b>*</b></span>
                <input
                  aria-invalid={Boolean(errors.tanggalPekerjaan)}
                  id="job-date"
                  onChange={(event) => updateField("tanggalPekerjaan", event.target.value)}
                  type="date"
                  value={values.tanggalPekerjaan}
                />
                {errors.tanggalPekerjaan && <small className="job-wizard-field-error">{errors.tanggalPekerjaan}</small>}
              </label>
              <label className="job-wizard-field" htmlFor="job-duration">
                <span>Estimasi durasi <b>*</b></span>
                <input
                  aria-invalid={Boolean(errors.estimasiDurasi)}
                  id="job-duration"
                  onChange={(event) => updateField("estimasiDurasi", event.target.value)}
                  placeholder="Contoh: 3–4 jam"
                  value={values.estimasiDurasi}
                />
                {errors.estimasiDurasi && <small className="job-wizard-field-error">{errors.estimasiDurasi}</small>}
              </label>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="job-wizard-fields">
            <div className="job-wizard-field-grid">
              <label className="job-wizard-field" htmlFor="job-wage">
                <span>Upah yang ditawarkan <b>*</b></span>
                <div className={`job-wizard-money-input${errors.upah ? " has-error" : ""}`}>
                  <span>Rp</span>
                  <input
                    aria-invalid={Boolean(errors.upah)}
                    id="job-wage"
                    inputMode="numeric"
                    onChange={(event) => updateField("upah", event.target.value.replace(/[^\d]/g, ""))}
                    placeholder="150000"
                    value={values.upah}
                  />
                </div>
                {errors.upah && <small className="job-wizard-field-error">{errors.upah}</small>}
              </label>
              <label className="job-wizard-field" htmlFor="job-wage-unit">
                <span>Satuan upah <b>*</b></span>
                <select
                  id="job-wage-unit"
                  onChange={(event) => updateField("satuanUpah", event.target.value as WageUnit)}
                  value={values.satuanUpah}
                >
                  <option value="PER_TUGAS">Per tugas</option>
                  <option value="PER_HARI">Per hari</option>
                </select>
              </label>
            </div>
            <label className="job-wizard-field job-wizard-quota-field" htmlFor="job-quota">
              <span>Jumlah tenaga kerja yang dibutuhkan <b>*</b></span>
              <input
                aria-invalid={Boolean(errors.kuota)}
                id="job-quota"
                max={50}
                min={1}
                onChange={(event) => updateField("kuota", event.target.value)}
                type="number"
                value={values.kuota}
              />
              {errors.kuota && <small className="job-wizard-field-error">{errors.kuota}</small>}
            </label>

            <div className="job-wizard-info">
              <span aria-hidden="true">ⓘ</span>
              <p>
                Upah final dapat disepakati bersama pelamar sebelum pekerjaan dimulai.
                Pastikan lingkup dan nominalnya jelas.
              </p>
            </div>

            {categoryIsRisky && (
              <label className={`job-wizard-risk-check${errors.pernyataanRisiko ? " has-error" : ""}`}>
                <input
                  aria-invalid={Boolean(errors.pernyataanRisiko)}
                  checked={values.pernyataanRisiko}
                  onChange={(event) => updateField("pernyataanRisiko", event.target.checked)}
                  type="checkbox"
                />
                <span>
                  Saya memahami pekerjaan kategori kelistrikan memiliki risiko keselamatan
                  dan akan memberikan informasi kondisi kerja secara jelas.
                  <b> *</b>
                  {errors.pernyataanRisiko && (
                    <small className="job-wizard-field-error">{errors.pernyataanRisiko}</small>
                  )}
                </span>
              </label>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="job-wizard-review">
            <div className="job-wizard-review-callout">
              <span aria-hidden="true">✓</span>
              <p>Periksa kembali detail pekerjaan sebelum diterbitkan.</p>
            </div>
            <section className="job-wizard-review-section">
              <div className="job-wizard-review-heading">
                <h3>Detail pekerjaan</h3>
                <button onClick={() => setStep(0)} type="button">Ubah</button>
              </div>
              <dl>
                <div><dt>Judul</dt><dd>{values.judul || "Belum diisi"}</dd></div>
                <div><dt>Kategori</dt><dd>{values.kategori || "Belum dipilih"}</dd></div>
                <div><dt>Deskripsi</dt><dd>{values.deskripsi || "Belum diisi"}</dd></div>
                <div><dt>Ruang lingkup</dt><dd>{values.ruangLingkup || "Belum diisi"}</dd></div>
                <div><dt>Kriteria hasil</dt><dd>{values.kriteriaHasil || "Belum diisi"}</dd></div>
              </dl>
            </section>
            <section className="job-wizard-review-section">
              <div className="job-wizard-review-heading">
                <h3>Lokasi & jadwal</h3>
                <button onClick={() => setStep(1)} type="button">Ubah</button>
              </div>
              <dl>
                <div><dt>Lokasi</dt><dd>{values.lokasi || "Belum diisi"}</dd></div>
                <div><dt>Tanggal</dt><dd>{dateLabel(values.tanggalPekerjaan)}</dd></div>
                <div><dt>Estimasi durasi</dt><dd>{values.estimasiDurasi || "Belum diisi"}</dd></div>
              </dl>
            </section>
            <section className="job-wizard-review-section">
              <div className="job-wizard-review-heading">
                <h3>Upah & ketentuan</h3>
                <button onClick={() => setStep(2)} type="button">Ubah</button>
              </div>
              <dl>
                <div>
                  <dt>Upah</dt>
                  <dd>
                    {values.upah && Number(values.upah) > 0
                      ? `${rupiah(Number(values.upah))} / ${values.satuanUpah === "PER_HARI" ? "hari" : "tugas"}`
                      : "Belum diisi"}
                  </dd>
                </div>
                <div><dt>Kuota</dt><dd>{values.kuota || "Belum diisi"} tenaga kerja</dd></div>
                {categoryIsRisky && (
                  <div><dt>Pernyataan risiko</dt><dd>{values.pernyataanRisiko ? "Disetujui" : "Belum disetujui"}</dd></div>
                )}
              </dl>
            </section>
            {submitError && <p className="job-wizard-submit-error" role="alert">{submitError}</p>}
          </div>
        )}

        {attemptedStep && Object.keys(errors).length > 0 && step < 3 && (
          <p className="job-wizard-step-error" role="alert">
            Periksa kembali isian yang ditandai sebelum melanjutkan.
          </p>
        )}

        <footer className="job-wizard-actions">
          <button
            className="job-wizard-cancel"
            disabled={isSubmitting}
            onClick={() => cancelDialogRef.current?.showModal()}
            type="button"
          >
            Batal
          </button>
          <span className="job-wizard-action-spacer" />
          {step > 0 && (
            <button
              className="button button-outline"
              disabled={isSubmitting}
              onClick={previousStep}
              type="button"
            >
              Kembali
            </button>
          )}
          {step < 3 ? (
            <button
              className="button button-primary job-wizard-next"
              onClick={continueStep}
              type="button"
            >
              Lanjutkan <span aria-hidden="true">→</span>
            </button>
          ) : (
            <button
              className="button button-primary job-wizard-publish"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Menerbitkan..." : "Terbitkan lowongan"}
            </button>
          )}
        </footer>
      </form>

      <dialog
        aria-labelledby="cancel-job-title"
        className="job-wizard-cancel-dialog"
        ref={cancelDialogRef}
      >
        <div className="job-wizard-cancel-content">
          <h2 id="cancel-job-title">Batalkan pembuatan lowongan?</h2>
          <p>Isian yang belum diterbitkan akan hilang dan tidak dapat dipulihkan.</p>
          <div className="job-wizard-cancel-actions">
            <button
              className="button button-outline"
              onClick={() => cancelDialogRef.current?.close()}
              type="button"
            >
              Lanjut mengisi
            </button>
            <button
              className="button button-danger"
              onClick={() => {
                cancelDialogRef.current?.close();
                router.push("/pk/lowongan");
              }}
              type="button"
            >
              Ya, batalkan
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
