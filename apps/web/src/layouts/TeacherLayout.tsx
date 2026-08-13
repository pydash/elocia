import { NavLink, Outlet } from 'react-router-dom'

export default function TeacherLayout() {
  return (
    <div className="teacher-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>SignLearn</h2>
          <p>Teacher</p>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/teacher"
            end
            className={({ isActive }) =>
              isActive ? 'nav-item active' : 'nav-item'
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/teacher/students"
            className={({ isActive }) =>
              isActive ? 'nav-item active' : 'nav-item'
            }
          >
            Students
          </NavLink>

          <NavLink
            to="/teacher/lessons"
            className={({ isActive }) =>
              isActive ? 'nav-item active' : 'nav-item'
            }
          >
            Lessons
          </NavLink>

          <NavLink
            to="/teacher/progress"
            className={({ isActive }) =>
              isActive ? 'nav-item active' : 'nav-item'
            }
          >
            Progress
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button>Logout</button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}