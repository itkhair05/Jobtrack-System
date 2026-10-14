import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, ArrowRight, BriefcaseBusiness, LoaderCircle, LockKeyhole } from 'lucide-react'
import { z } from 'zod'
import { useAuth } from '../context/AuthContext'
import { resetPassword } from '../services/authService'
import { getErrorMessage } from '../utils/errorMessage'

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Mật khẩu cần ít nhất 8 ký tự'),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
})

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  })

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const onSubmit = async (values: ResetPasswordForm) => {
    if (!token) return
    setServerError('')
    try {
      await resetPassword(token, values.newPassword, values.confirmPassword)
      navigate('/login', {
        replace: true,
        state: { message: 'Mật khẩu đã được cập nhật thành công. Vui lòng đăng nhập bằng mật khẩu mới.' },
      })
    } catch (error) {
      setServerError(getErrorMessage(error, 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.'))
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-brand-panel">
        <Link to="/" className="auth-brand-logo" aria-label="JobTrack Trang chủ">
          <span className="brand-mark"><BriefcaseBusiness size={20} strokeWidth={2.5} /></span>
          <span className="brand-name">JobTrack</span>
        </Link>
        <div className="brand-copy">
          <p className="eyebrow">NEW CREDENTIALS</p>
          <h1>Secure your<br /><em>account.</em></h1>
          <p className="brand-description">Đặt mật khẩu mới an toàn với độ dài tối thiểu 8 ký tự để bảo vệ tài khoản của bạn.</p>
        </div>
        <div className="brand-footer"><span className="footer-dot" /> Secure, privacy-first authentication</div>
      </section>

      <section className="auth-form-panel">
        <div className="form-wrap">
          <Link to="/" className="mobile-brand" aria-label="JobTrack Trang chủ">
            <span className="brand-mark"><BriefcaseBusiness size={18} /></span>
            <span className="brand-name">JobTrack</span>
          </Link>
          <div className="form-heading">
            <p className="eyebrow">RESET PASSWORD</p>
            <h2>Đặt mật khẩu mới</h2>
            <p>Vui lòng nhập mật khẩu mới cho tài khoản của bạn.</p>
          </div>

          {!token ? (
            <div>
              <div className="form-alert" role="alert">
                <AlertCircle size={18} />
                <span>Không tìm thấy mã xác nhận đặt lại mật khẩu hoặc liên kết không hợp lệ.</span>
              </div>
              <div style={{ marginTop: '24px' }}>
                <Link to="/forgot-password" className="submit-button" style={{ textDecoration: 'none' }}>
                  Yêu cầu liên kết mới <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {serverError && (
                <div style={{ marginBottom: '20px' }}>
                  <div className="form-alert" role="alert">
                    <AlertCircle size={18} />
                    <span>{serverError}</span>
                  </div>
                  <p style={{ marginTop: '10px', fontSize: '13px', textAlign: 'center' }}>
                    <Link to="/forgot-password" style={{ color: 'var(--blue)', fontWeight: 600 }}>
                      Yêu cầu liên kết đặt lại mật khẩu mới
                    </Link>
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <label className="field-label" htmlFor="newPassword">Mật khẩu mới</label>
                <div className={`input-wrap ${errors.newPassword ? 'has-error' : ''}`}>
                  <LockKeyhole size={18} /><input id="newPassword" type="password" placeholder="Tối thiểu 8 ký tự" autoComplete="new-password" {...register('newPassword')} />
                </div>
                {errors.newPassword && <p className="field-error">{errors.newPassword.message}</p>}

                <label className="field-label" htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                <div className={`input-wrap ${errors.confirmPassword ? 'has-error' : ''}`}>
                  <LockKeyhole size={18} /><input id="confirmPassword" type="password" placeholder="Nhập lại mật khẩu mới" autoComplete="new-password" {...register('confirmPassword')} />
                </div>
                {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}

                <button className="submit-button" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <LoaderCircle className="spin" size={18} /> : <>Đặt lại mật khẩu <ArrowRight size={18} /></>}
                </button>
              </form>
            </>
          )}

          <p className="switch-auth">
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={16} /> Quay lại Đăng nhập
            </Link>
          </p>
        </div>
        <p className="legal-copy">Bằng việc tiếp tục, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật của JobTrack.</p>
      </section>
    </main>
  )
}
