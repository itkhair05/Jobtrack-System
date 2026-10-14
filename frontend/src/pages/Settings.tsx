import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Check, LockKeyhole, Mail, Save, UserRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../utils/errorMessage'
import { updateProfile } from '../services/userService'

const createSettingsSchema = (originalEmail: string) =>
  z
    .object({
      fullName: z.string().trim().min(2, 'Họ tên cần ít nhất 2 ký tự').max(100, 'Tối đa 100 ký tự'),
      email: z.string().trim().email('Email không hợp lệ'),
      currentPassword: z.string().optional(),
      newPassword: z.string().optional(),
      confirmPassword: z.string().optional(),
    })
    .refine((data) => !data.newPassword || data.newPassword.length >= 8, {
      message: 'Mật khẩu mới cần ít nhất 8 ký tự',
      path: ['newPassword'],
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Mật khẩu xác nhận không khớp',
      path: ['confirmPassword'],
    })
    .refine(
      (data) =>
        (data.email.trim().toLowerCase() === originalEmail && !data.newPassword) ||
        Boolean(data.currentPassword?.trim()),
      {
        message: 'Nhập mật khẩu hiện tại để đổi email hoặc mật khẩu',
        path: ['currentPassword'],
      }
    )

type FormValues = z.infer<ReturnType<typeof createSettingsSchema>>

export default function Settings() {
  const { user, updateSession } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const [notice, setNotice] = useState('')
  const originalEmail = (user?.email ?? '').toLowerCase()
  const schema = useMemo(() => createSettingsSchema(originalEmail), [originalEmail])
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: user?.fullName ?? '',
      email: user?.email ?? '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (values: FormValues) => {
    setServerError('')
    setNotice('')
    try {
      const emailChanged = values.email.trim().toLowerCase() !== originalEmail
      const updated = await updateProfile({
        email: values.email,
        fullName: values.fullName,
        ...(values.newPassword || emailChanged ? { currentPassword: values.currentPassword } : {}),
        ...(values.newPassword ? { newPassword: values.newPassword } : {}),
      })
      updateSession(updated)
      setNotice('Thông tin tài khoản đã được cập nhật thành công.')
    } catch (error) {
      setServerError(getErrorMessage(error, 'Không thể cập nhật thông tin.'))
    }
  }

  return (
    <main className="settings-shell">
      <section className="settings-content">
        <button
          className="back-button"
          type="button"
          onClick={() => navigate(-1)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '18px' }}
        >
          <ArrowLeft size={18} /> Quay lại
        </button>

        <div className="settings-heading">
          <p className="eyebrow">ACCOUNT SETTINGS</p>
          <h1>Thông tin cá nhân</h1>
          <p>Quản lý thông tin và bảo mật tài khoản JobTrack.</p>
        </div>

        <form className="settings-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <section className="settings-card">
            <div className="settings-card-heading">
              <span className="settings-icon">
                <UserRound size={18} />
              </span>
              <div>
                <h2>Thông tin cơ bản</h2>
                <p>Cập nhật thông tin hiển thị của bạn.</p>
              </div>
            </div>

            <div className="settings-fields">
              <Field label="Họ và tên" id="settings-fullname" error={errors.fullName?.message}>
                <div className="settings-input">
                  <UserRound size={16} aria-hidden="true" />
                  <input
                    id="settings-fullname"
                    autoComplete="name"
                    aria-invalid={Boolean(errors.fullName)}
                    aria-describedby={errors.fullName ? 'settings-fullname-error' : undefined}
                    {...register('fullName')}
                  />
                </div>
              </Field>

              <Field label="Email" id="settings-email" error={errors.email?.message}>
                <div className="settings-input">
                  <Mail size={16} aria-hidden="true" />
                  <input
                    id="settings-email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'settings-email-error' : undefined}
                    {...register('email')}
                  />
                </div>
              </Field>
            </div>
          </section>

          <section className="settings-card">
            <div className="settings-card-heading">
              <span className="settings-icon settings-lock">
                <LockKeyhole size={18} />
              </span>
              <div>
                <h2>Đổi mật khẩu</h2>
                <p>Nhập mật khẩu hiện tại khi bạn đổi email hoặc mật khẩu.</p>
              </div>
            </div>

            <div className="settings-fields">
              <Field
                label="Mật khẩu hiện tại"
                id="settings-current-pwd"
                error={errors.currentPassword?.message}
              >
                <div className="settings-input">
                  <LockKeyhole size={16} aria-hidden="true" />
                  <input
                    id="settings-current-pwd"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={Boolean(errors.currentPassword)}
                    aria-describedby={errors.currentPassword ? 'settings-current-pwd-error' : undefined}
                    {...register('currentPassword')}
                  />
                </div>
              </Field>
              <div />

              <Field label="Mật khẩu mới" id="settings-new-pwd" error={errors.newPassword?.message}>
                <div className="settings-input">
                  <LockKeyhole size={16} aria-hidden="true" />
                  <input
                    id="settings-new-pwd"
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.newPassword)}
                    aria-describedby={errors.newPassword ? 'settings-new-pwd-error' : undefined}
                    {...register('newPassword')}
                  />
                </div>
              </Field>

              <Field
                label="Xác nhận mật khẩu mới"
                id="settings-confirm-pwd"
                error={errors.confirmPassword?.message}
              >
                <div className="settings-input">
                  <LockKeyhole size={16} aria-hidden="true" />
                  <input
                    id="settings-confirm-pwd"
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.confirmPassword)}
                    aria-describedby={errors.confirmPassword ? 'settings-confirm-pwd-error' : undefined}
                    {...register('confirmPassword')}
                  />
                </div>
              </Field>
            </div>
          </section>

          {serverError && (
            <div className="settings-error" role="alert">
              {serverError}
            </div>
          )}
          {notice && (
            <div className="settings-notice" role="status">
              <Check size={17} />
              {notice}
            </div>
          )}

          <div className="settings-actions">
            <button className="secondary-button" type="button" onClick={() => navigate('/dashboard')}>
              Hủy
            </button>
            <button className="primary-button" type="submit" disabled={isSubmitting}>
              <Save size={17} />
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string
  id: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="settings-field">
      <label htmlFor={id}>
        <span>{label}</span>
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
