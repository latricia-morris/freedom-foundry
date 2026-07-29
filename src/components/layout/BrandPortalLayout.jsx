import { Outlet, NavLink } from 'react-router-dom';

export default function BrandPortalLayout() {
  return (
    <div className="flex min-h-screen bg-[#0f0f1a]">
      {/* Left Navigation Panel - Text Only */}
      <aside className="w-64 border-r border-white/5 p-8">
        <nav className="flex flex-col gap-4">
          {[
            { name: 'Overview', path: '/brand-portal' },
            { name: 'Personal Brand', path: '/brand-portal/personal' },
            { name: 'Corporate Brand', path: '/brand-portal/corporate' },
            { name: 'Big Picture', path: '/brand-portal/big-picture' },
            { name: 'Media Kit', path: '/brand-portal/media-kit' },
          ].map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/brand-portal'}
              className={({ isActive }) =>
                `bp-nav-item text-sm transition-colors duration-200 ${
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
      <main className="flex-1 p-12 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
