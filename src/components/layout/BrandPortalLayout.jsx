import { Outlet, NavLink } from 'react-router-dom';

export default function BrandPortalLayout() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0f0f1a]">
      {/* Left Sub-Navigation Panel - contextual to Brand Portal */}
      <aside className="lg:w-64 border-b lg:border-b-0 lg:border-r border-white/5 px-4 py-6 lg:p-8">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#d9c9a3] mb-4 lg:mb-6">
          Brand Portal
        </p>
        <nav className="flex flex-row lg:flex-col gap-3 lg:gap-4 flex-wrap">
          {[
            { name: 'Big Picture', path: '/brand-portal/big-picture' },
            { name: 'Overview', path: '/brand-portal' },
            { name: 'Personal Brand', path: '/brand-portal/personal' },
            { name: 'Corporate Brand', path: '/brand-portal/corporate' },
            { name: 'Media Kit', path: '/brand-portal/media-kit' },
          ].map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/brand-portal'}
              className={({ isActive }) =>
                `bp-nav-item text-sm lg:text-base transition-colors duration-200 ${
                  isActive 
                    ? 'font-medium bg-gradient-to-r from-[#b3232c] via-[#d9622c] to-[#f0d9b5] bg-clip-text text-transparent' 
                    : 'text-[#f7f2ea] hover:opacity-80'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
