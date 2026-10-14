import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, Navigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, ArrowRight, BriefcaseBusiness, CheckCircle2, LoaderCircle, Mail } from 'lucide-react'
import { z } from 'zod'
import { useAuth } from '../context/AuthContext'
import { forgotPassword } from '../services/authService'
import { getErrorMessage } from '../utils/errorMessage'

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Vui lòng nhập email hợp lệ'),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const { user } = useAuth()
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const onSubmit = async (values: ForgotPasswordForm) => {
    setServerError('')
    try {
      const response = await forgotPassword(values.email)
      setSuccessMessage(response.message || 'Nếu email tồn tại, chúng tôi đã gửi liên kết đặt lại mật khẩu.')
    } catch (error) {
      setServerError(getErrorMessage(error, 'Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau.'))
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
          <p className="eyebrow">ACCOUNT RECOVERY</p>
          <h1>Regain access to<br /><em>your journey.</em></h1>
          <p className="brand-description">Đặt lại mật khẩu một cách an toàn và nhanh chóng để tiếp tục theo dõi mục tiêu nghề nghiệp.</p>
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
            <p className="eyebrow">PASSWORD RESET</p>
            <h2>Quên mật khẩu?</h2>
            <p>Nhập địa chỉ email tài khoản để nhận liên kết đặt lại mật khẩu.</p>
          </div>

          {serverError && <div className="form-alert" role="alert"><AlertCircle size={18} />{serverError}</div>}
          {successMessage && (
            <div className="form-alert form-alert-success" role="status">
              <CheckCircle2 size={18} />
              <span>{successMessage}</span>
            </div>
          )}

          {!successMessage ? (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <label className="field-label" htmlFor="email">Email tài khoản</label>
              <div className={`input-wrap ${errors.email ? 'has-error' : ''}`}>
                <Mail size={18} /><input id="email" type="email" placeholder="you@example.com" autoComplete="email" {...register('email')} />
              </div>
              {errors.email && <p className="field-error">{errors.email.message}</p>}

              <button className="submit-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <LoaderCircle className="spin" size={18} /> : <>Gửi liên kết <ArrowRight size={18} /></>}
              </button>
            </form>
          ) : (
            <div style={{ marginTop: '24px' }}>
              <Link to="/login" className="submit-button" style={{ textDecoration: 'none' }}>
                Quay lại đăng nhập <ArrowRight size={18} />
              </Link>
            </div>
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
