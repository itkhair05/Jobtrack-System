import { useState, useEffect } from 'react'
import { Bell, BriefcaseBusiness, Menu } from 'lucide-react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { getFollowUps } from '../services/applicationService'

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [reminderCount, setReminderCount] = useState(0)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    getFollowUps(7)
      .then((items) => {
        if (active) setReminderCount(items.length)
      })
      .catch(() => {
        if (active) setReminderCount(0)
      })
    return () => {
      active = false
    }
  }, [location.pathname])

  return (
    <div className="app-layout">
      <header className="mobile-header">
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMobileOpen(true)}
          aria-label="Mở menu điều hướng"
        >
          <Menu size={22} />
        </button>
        <div className="mobile-brand">
          <span className="brand-mark">
            <BriefcaseBusiness size={18} />
          </span>
          <span className="brand-name">JobTrack</span>
        </div>
        <button
          className="navbar-icon-button mobile-bell"
          type="button"
          onClick={() => navigate('/dashboard?reminders=1')}
          aria-label={`${reminderCount} thông báo follow-up`}
          title={`${reminderCount} việc cần follow-up`}
        >
          <Bell size={19} />
          {reminderCount > 0 && <i>{Math.min(reminderCount, 9)}</i>}
        </button>
      </header>

      <Sidebar isOpenMobile={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="app-main">
        <Navbar />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
