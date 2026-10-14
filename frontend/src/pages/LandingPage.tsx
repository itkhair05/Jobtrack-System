import { Link, Navigate } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Calendar,
  Check,
  ExternalLink,
  FileText,
  LayoutDashboard,
  LoaderCircle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LandingPage() {
  const { user, token, isLoading } = useAuth()

  if (isLoading && token) {
    return (
      <main className="detail-loading">
        <LoaderCircle className="spin" size={26} />
        <span>Đang kiểm tra đăng nhập...</span>
      </main>
    )
  }

  if (user && token) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="landing-page">
      {/* A. Top navigation bar */}
      <header className="landing-header">
        <div className="landing-container landing-header-inner">
          <Link to="/" className="landing-brand" aria-label="JobTrack Trang chủ">
            <span className="brand-mark">
              <BriefcaseBusiness size={20} strokeWidth={2.5} />
            </span>
            <span className="brand-name">JobTrack</span>
          </Link>

          <nav className="landing-nav" aria-label="Điều hướng chính">
            <div className="landing-nav-links">
              <a href="#features" className="landing-nav-link">Tính năng</a>
              <a href="#how-it-works" className="landing-nav-link">Quy trình</a>
            </div>
            <div className="landing-nav-actions">
              <Link to="/login" className="secondary-button landing-btn-nav">
                Đăng nhập
              </Link>
              <Link to="/register" className="primary-button landing-btn-nav">
                Tạo tài khoản
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main>
        {/* B. Hero section */}
        <section className="landing-hero" aria-labelledby="hero-heading">
          <div className="landing-container landing-hero-inner">
            <p className="eyebrow">YOUR NEXT MOVE, ORGANIZED</p>
            <h1 id="hero-heading">
              Theo dõi hành trình ứng tuyển của bạn trong một nơi duy nhất.
            </h1>
            <p className="landing-hero-subtitle">
              JobTrack là CRM cá nhân giúp bạn quản lý mọi đơn ứng tuyển: trực quan hóa tiến độ bằng bảng Kanban,
              nhận nhắc nhở lịch follow-up, quản lý phiên bản CV an toàn và nhìn lại toàn cảnh qua các biểu đồ thống kê.
            </p>

            <div className="landing-hero-ctas">
              <Link to="/register" className="primary-button landing-cta-primary">
                Tạo tài khoản miễn phí <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="secondary-button landing-cta-secondary">
                Đăng nhập
              </Link>
            </div>

            <div className="landing-hero-perks" aria-label="Cam kết dịch vụ">
              <span><Check size={16} /> Hoàn toàn miễn phí</span>
              <span><Check size={16} /> Bảo mật dữ liệu cá nhân</span>
              <span><Check size={16} /> Không quảng cáo</span>
            </div>
          </div>
        </section>

        {/* C. Features section */}
        <section className="landing-features" id="features" aria-labelledby="features-heading">
          <div className="landing-container">
            <div className="landing-section-header">
              <p className="eyebrow">TÍNH NĂNG NỔI BẬT</p>
              <h2 id="features-heading">Mọi công cụ bạn cần để tìm việc hiệu quả</h2>
              <p className="landing-section-desc">
                Được thiết kế từ trải nghiệm thực tế nhằm giải quyết sự phân tán và thiếu tổ chức khi ứng tuyển nhiều công ty cùng lúc.
              </p>
            </div>

            <div className="landing-features-grid">
              <article className="landing-card">
                <div className="landing-card-icon blue">
                  <LayoutDashboard size={24} />
                </div>
                <h3>Bảng Kanban trực quan</h3>
                <p>
                  Theo dõi tiến độ đơn ứng tuyển qua 5 cột trạng thái trực quan: Đã lưu, Đã nộp, Phỏng vấn, Nhận offer và Bị từ chối.
                  Hỗ trợ thao tác kéo-thả tiện lợi cùng chế độ xem danh sách linh hoạt.
                </p>
              </article>

              <article className="landing-card">
                <div className="landing-card-icon amber">
                  <Calendar size={24} />
                </div>
                <h3>Nhắc nhở follow-up</h3>
                <p>
                  Thiết lập ngày hẹn liên hệ lại cho từng đơn ứng tuyển. Trung tâm nhắc nhở tại Dashboard tự động phân loại các đơn
                  đến hạn hoặc quá hạn để bạn không bao giờ bỏ lỡ bước tiếp theo.
                </p>
              </article>

              <article className="landing-card">
                <div className="landing-card-icon green">
                  <FileText size={24} />
                </div>
                <h3>Thư viện CV an toàn</h3>
                <p>
                  Tải lên và đính kèm các phiên bản CV định dạng PDF hoặc DOCX. Mọi tệp tải lên đều được kiểm tra an toàn 3 lớp qua
                  Apache Tika nhằm ngăn chặn tệp độc hại ngụy trang.
                </p>
              </article>

              <article className="landing-card">
                <div className="landing-card-icon purple">
                  <BarChart3 size={24} />
                </div>
                <h3>Thống kê & xuất dữ liệu</h3>
                <p>
                  Nắm bắt tỷ lệ phản hồi qua biểu đồ tròn phân bổ trạng thái và biểu đồ cột theo thời gian.
                  Dễ dàng xuất toàn bộ lịch sử ứng tuyển ra định dạng CSV hoặc bảng tính Excel (XLSX).
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* D. How it works section */}
        <section className="landing-steps" id="how-it-works" aria-labelledby="steps-heading">
          <div className="landing-container">
            <div className="landing-section-header">
              <p className="eyebrow">QUY TRÌNH TINH GỌN</p>
              <h2 id="steps-heading">Cách JobTrack đồng hành cùng bạn</h2>
              <p className="landing-section-desc">
                Chuyển đổi từ cách quản lý cơ hội rời rạc sang một quy trình tìm việc có kế hoạch và mục tiêu rõ ràng.
              </p>
            </div>

            <div className="landing-steps-grid">
              <div className="landing-step-item">
                <div className="landing-step-badge">01</div>
                <h3>Thêm đơn ứng tuyển</h3>
                <p>
                  Lưu lại thông tin công ty, vị trí, mức lương mong muốn, link tin tuyển dụng và chọn tệp CV đã tải lên tương ứng.
                </p>
              </div>

              <div className="landing-step-item">
                <div className="landing-step-badge">02</div>
                <h3>Theo dõi trạng thái qua Kanban</h3>
                <p>
                  Cập nhật tiến trình qua từng vòng phỏng vấn, ghi chép phản hồi của nhà tuyển dụng và lưu lại lịch sử mốc thời gian.
                </p>
              </div>

              <div className="landing-step-item">
                <div className="landing-step-badge">03</div>
                <h3>Xem thống kê và nhận nhắc follow-up</h3>
                <p>
                  Nhận thông báo khi đến hạn liên hệ lại và nhìn lại toàn bộ bức tranh tìm việc qua các báo cáo thống kê trực quan.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* E. Final call to action */}
        <section className="landing-cta-section" aria-labelledby="cta-heading">
          <div className="landing-container">
            <div className="landing-cta-card">
              <h2 id="cta-heading">Sẵn sàng sắp xếp hành trình tìm việc của bạn?</h2>
              <p>
                Tạo tài khoản miễn phí chỉ trong vài giây và bắt đầu theo dõi mọi cơ hội nghề nghiệp ngay hôm nay.
              </p>
              <div className="landing-cta-actions">
                <Link to="/register" className="primary-button landing-cta-primary">
                  Bắt đầu miễn phí ngay <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="secondary-button landing-cta-secondary-dark">
                  Đã có tài khoản? Đăng nhập
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* F. Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-top">
            <div className="landing-footer-brand">
              <div className="landing-brand">
                <span className="brand-mark">
                  <BriefcaseBusiness size={18} />
                </span>
                <span className="brand-name">JobTrack</span>
              </div>
              <p className="landing-footer-tagline">
                Nền tảng theo dõi và quản lý quá trình ứng tuyển việc làm cá nhân.
              </p>
            </div>

            <div className="landing-footer-nav">
              <div className="landing-footer-col">
                <h4>Điều hướng</h4>
                <a href="#features">Tính năng</a>
                <a href="#how-it-works">Quy trình</a>
                <Link to="/login">Đăng nhập</Link>
                <Link to="/register">Tạo tài khoản</Link>
              </div>

              <div className="landing-footer-col">
                <h4>Liên kết</h4>
                <a
                  href="https://github.com/itkhair05/Jobtrack-System"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="landing-footer-ext"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>GitHub<ExternalLink size={12} />
                </a>
                <a
                  href="https://jobtrack-bld.pages.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="landing-footer-ext"
                >
                  Live Demo <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

          <div className="landing-footer-bottom">
            <p>© 2026 JobTrack. Được xây dựng bởi Dương Thế Khải.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
