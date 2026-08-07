import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Flame } from 'lucide-react';
import WarmGradientDefs from '@/components/shared/WarmGradientDefs';

const mainNav = [
  { name: 'Overview', path: '/brand-portal', end: true },
  { name: 'Big Picture', path: '/brand-portal/big-picture' },
  { name: 'Personal Brand', path: '/brand-portal/personal' },
  { name: 'Corporate Brand', path: '/brand-portal/corporate' },
  { name: 'Media Kit', path: '/brand-portal/media-kit' },
];

const systemNav = [
  { name: 'Brand Guidelines', path: '/brand-portal/guidelines' },
  { name: 'Brand Assets', path: '/brand-portal/assets' },
  { name: 'Ignite OS', path: '/brand-portal/ignite', icon: 'flame' },
];

function NavItem({ item, muted }) {
  return (
    <NavLink
      to={item.path}
      end={item.end}
      className={({ isActive }) =>
        `flex items-center justify-between text-sm py-2 px-0 lg:py-2.5 transition-all duration-200 whitespace-nowrap lg:whitespace-normal ${
          muted ? 'opacity-40 hover:opacity-70' : isActive ? 'font-semibold' : 'opacity-60 hover:opacity-90'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            style={isActive ? {
              background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
            } : {}}
          >
            {item.name}
          </span>
          {item.icon === 'flame' && (
            <Flame
              className="w-4 h-4 flex-shrink-0 ml-2"
              strokeWidth={1.5}
              style={{ stroke: 'url(#warmGradientSvg)' }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

export default function BrandPortalLayout() {
  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
      <WarmGradientDefs />
      <aside className="lg:w-56 border-b lg:border-b-0 lg:border-r border-white/5 px-4 py-5 lg:px-6 lg:py-8 flex-shrink-0">
        <p className="text-[10px] uppercase tracking-[0.25em] text-[#d9c9a3] mb-5 hidden lg:block">
          Brand Portal
        </p>
        <nav className="flex flex-row lg:flex-col gap-2 lg:gap-1 flex-wrap overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
          {mainNav.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
          <div className="hidden lg:block w-full border-t border-white/5 my-3" />
          <div className="lg:border-t lg:border-white/5 lg:pt-3 lg:mt-1 w-full">
            {systemNav.map((item) => (
              <NavItem key={item.path} item={item} muted />
            ))}
          </div>
        </nav>
      </aside>

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}