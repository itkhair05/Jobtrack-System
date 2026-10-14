import { useEffect, useRef, useState, type ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { BriefcaseBusiness, CalendarDays, Link2, LoaderCircle, MapPin, X } from 'lucide-react'
import { z } from 'zod'
import CvUploader from './CvUploader'
import type { Application, ApplicationRequest } from '../services/applicationService'

const applicationSchema = z.object({
  companyName: z.string().trim().min(1, 'Nhập tên công ty').max(150, 'Tối đa 150 ký tự'),
  website: z.string().trim().max(255, 'Tối đa 255 ký tự').optional().or(z.literal('')),
  location: z.string().trim().max(150, 'Tối đa 150 ký tự').optional().or(z.literal('')),
  jobTitle: z.string().trim().min(1, 'Nhập vị trí công việc').max(150, 'Tối đa 150 ký tự'),
  jobUrl: z.string().trim().url('URL không hợp lệ').optional().or(z.literal('')),
  salaryRange: z.string().trim().max(100, 'Tối đa 100 ký tự').optional().or(z.literal('')),
  status: z.enum(['SAVED', 'APPLIED', 'INTERVIEWING', 'OFFERED', 'REJECTED']),
  appliedDate: z.string().optional(),
  notes: z.string().trim().max(2000, 'Tối đa 2000 ký tự').optional().or(z.literal('')),
  followUpDate: z.string().optional(),
  cvId: z.number().nullable().optional(),
  cvTitle: z.string().nullable().optional(),
})

type FormValues = z.infer<typeof applicationSchema>

type Props = {
  application: Application | null
  onClose: () => void
  onSubmit: (payload: ApplicationRequest) => Promise<void>
}

export default function ApplicationModal({ application, onClose, onSubmit }: Props) {
  const [submitError, setSubmitError] = useState('')
  const firstInputRef = useRef<HTMLInputElement>(null)
  const { register, handleSubmit, reset, setValue, control, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { status: 'SAVED', cvId: null, cvTitle: null },
  })

  useEffect(() => {
    reset({
      companyName: application?.companyName ?? '',
      website: application?.website ?? '',
      location: application?.location ?? '',
      jobTitle: application?.jobTitle ?? '',
      jobUrl: application?.jobUrl ?? '',
      salaryRange: application?.salaryRange ?? '',
      status: application?.status ?? 'SAVED',
      appliedDate: application?.appliedDate ?? '',
      notes: application?.notes ?? '',
      followUpDate: application?.followUpDate ?? '',
      cvId: application?.cvId ?? null,
      cvTitle: application?.cvTitle ?? null,
    })
  }, [application, reset])

  useEffect(() => {
    const timer = setTimeout(() => {
      firstInputRef.current?.focus()
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const submit = async (values: FormValues) => {
    setSubmitError('')
    try {
      await onSubmit(values)
    } catch {
      setSubmitError('Không thể lưu đơn ứng tuyển. Vui lòng thử lại.')
    }
  }

  const selectedCvId = useWatch({ control, name: 'cvId' }) ?? null
  const selectedCvTitle = useWatch({ control, name: 'cvTitle' }) ?? null

  const companyReg = register('companyName')

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal-panel application-modal" role="dialog" aria-modal="true" aria-labelledby="application-modal-title">
        <header className="modal-header">
          <div>
            <p className="eyebrow">APPLICATION DETAILS</p>
            <h2 id="application-modal-title">{application ? 'Chỉnh sửa đơn' : 'Thêm đơn ứng tuyển'}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Đóng modal">
            <X size={20} />
          </button>
        </header>

        {submitError && (
          <div className="modal-error" role="alert">
            {submitError}
          </div>
        )}

        <form className="application-form" onSubmit={handleSubmit(submit)} noValidate>
          <div className="form-section-title">
            <BriefcaseBusiness size={16} /> Công việc
          </div>

          <div className="form-two-col">
            <Field label="Tên công ty" id="field-company-name" error={errors.companyName?.message} required>
              <input
                id="field-company-name"
                placeholder="Ví dụ: ACME Inc."
                aria-required="true"
                aria-invalid={Boolean(errors.companyName)}
                aria-describedby={errors.companyName ? 'field-company-name-error' : undefined}
                {...companyReg}
                ref={(e) => {
                  companyReg.ref(e)
                  firstInputRef.current = e
                }}
              />
            </Field>

            <Field label="Vị trí" id="field-job-title" error={errors.jobTitle?.message} required>
              <input
                id="field-job-title"
                placeholder="Ví dụ: Product Designer"
                aria-required="true"
                aria-invalid={Boolean(errors.jobTitle)}
                aria-describedby={errors.jobTitle ? 'field-job-title-error' : undefined}
                {...register('jobTitle')}
              />
            </Field>
          </div>

          <div className="form-two-col">
            <Field label="Website" id="field-website" error={errors.website?.message}>
              <input
                id="field-website"
                type="url"
                placeholder="https://company.com"
                aria-invalid={Boolean(errors.website)}
                aria-describedby={errors.website ? 'field-website-error' : undefined}
                {...register('website')}
              />
            </Field>

            <Field label="Địa điểm" id="field-location" error={errors.location?.message}>
              <div className="field-with-icon">
                <MapPin size={16} aria-hidden="true" />
                <input
                  id="field-location"
                  placeholder="Hà Nội / Remote"
                  aria-invalid={Boolean(errors.location)}
                  aria-describedby={errors.location ? 'field-location-error' : undefined}
                  {...register('location')}
                />
              </div>
            </Field>
          </div>

          <div className="form-two-col">
            <Field label="Link tuyển dụng" id="field-job-url" error={errors.jobUrl?.message}>
              <div className="field-with-icon">
                <Link2 size={16} aria-hidden="true" />
                <input
                  id="field-job-url"
                  type="url"
                  placeholder="https://..."
                  aria-invalid={Boolean(errors.jobUrl)}
                  aria-describedby={errors.jobUrl ? 'field-job-url-error' : undefined}
                  {...register('jobUrl')}
                />
              </div>
            </Field>

            <Field label="Mức lương" id="field-salary" error={errors.salaryRange?.message}>
              <input
                id="field-salary"
                placeholder="20 - 30 triệu"
                aria-invalid={Boolean(errors.salaryRange)}
                aria-describedby={errors.salaryRange ? 'field-salary-error' : undefined}
                {...register('salaryRange')}
              />
            </Field>
          </div>

          <div className="form-two-col">
            <Field label="Trạng thái" id="field-status" error={errors.status?.message} required>
              <select
                id="field-status"
                aria-required="true"
                aria-invalid={Boolean(errors.status)}
                aria-describedby={errors.status ? 'field-status-error' : undefined}
                {...register('status')}
              >
                <option value="SAVED">Đã lưu</option>
                <option value="APPLIED">Đã ứng tuyển</option>
                <option value="INTERVIEWING">Phỏng vấn</option>
                <option value="OFFERED">Đã nhận offer</option>
                <option value="REJECTED">Từ chối</option>
              </select>
            </Field>

            <Field label="Ngày ứng tuyển" id="field-applied-date" error={errors.appliedDate?.message}>
              <div className="field-with-icon">
                <CalendarDays size={16} aria-hidden="true" />
                <input
                  id="field-applied-date"
                  type="date"
                  aria-invalid={Boolean(errors.appliedDate)}
                  aria-describedby={errors.appliedDate ? 'field-applied-date-error' : undefined}
                  {...register('appliedDate')}
                />
              </div>
            </Field>
          </div>

          <Field label="Ghi chú" id="field-notes" error={errors.notes?.message}>
            <textarea
              id="field-notes"
              rows={3}
              placeholder="Thêm ghi chú cho đơn ứng tuyển..."
              aria-invalid={Boolean(errors.notes)}
              aria-describedby={errors.notes ? 'field-notes-error' : undefined}
              {...register('notes')}
            />
          </Field>

          <Field label="Ngày follow-up" id="field-followup-date" error={errors.followUpDate?.message}>
            <div className="field-with-icon">
              <CalendarDays size={16} aria-hidden="true" />
              <input
                id="field-followup-date"
                type="date"
                aria-invalid={Boolean(errors.followUpDate)}
                aria-describedby={errors.followUpDate ? 'field-followup-date-error' : undefined}
                {...register('followUpDate')}
              />
            </div>
          </Field>

          <CvUploader
            cvId={selectedCvId}
            cvTitle={selectedCvTitle}
            onUploaded={(cv) => {
              setValue('cvId', cv?.id ?? null, { shouldDirty: true })
              setValue('cvTitle', cv?.title ?? null, { shouldDirty: true })
            }}
          />

          <footer className="modal-actions">
            <button className="secondary-button" type="button" onClick={onClose}>
              Hủy
            </button>
            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <LoaderCircle className="spin" size={17} />
              ) : application ? (
                'Lưu thay đổi'
              ) : (
                'Thêm đơn ứng tuyển'
              )}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}

function Field({
  label,
  id,
  error,
  required,
  children,
}: {
  label: string
  id: string
  error?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div className="modal-field">
      <label htmlFor={id}>
        {label}
        {required && <b aria-hidden="true"> *</b>}
      </label>
      {children}
      {error && (
        <small id={`${id}-error`} role="alert">
          {error}
        </small>
      )}
    </div>
  )
}
