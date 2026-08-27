import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Flame, Send } from 'lucide-react';

const strategyNav = [
  { name: 'Overview', path: '/brand-portal', end: true },
  { name: 'Big Picture', path: '/brand-portal/big-picture' },
  { name: 'Corporate Brand', path: '/brand-portal/corporate' },
  { name: 'Personal Brand', path: '/brand-portal/personal' },
  { name: 'Media Kit', path: '/brand-portal/media-kit' },
];

const buildNav = [
  { name: 'Brand Guidelines', path: '/brand-portal/guidelines' },
  { name: 'Brand Assets', path: '/brand-portal/assets' },
  { name: 'Brand Up', path: '/brand-portal/brand-up' },
  { name: 'Checklist', path: '/brand-portal/checklist' },
  { name: 'Ignite OS', path: '/brand-portal/ignite', icon: 'flame' },
];

const supportNav = [
  { name: 'Request Brand Services', path: '/brand-portal/request-services', icon: 'send' },
];


function NavItem({ item }) {
  return (
    <NavLink
      to={item.path}
      end={item.end}
      className={({ isActive }) =>
        `flex items-center justify-between border-l-2 px-3 py-2.5 text-sm transition-colors duration-200 ${
          isActive
            ? 'border-[#f7f5f5] font-medium text-[#f7f5f5]'
            : 'border-transparent text-[#b7bfbd] hover:bg-white/[0.035] hover:text-[#e0e4e3]'
        }`
      }
    >
      {({ isActive }) =>
        <>
          <span
            className="mr-3">
            {item.name}
          </span>
          {item.icon === 'flame' &&
        <Flame
          className="w-4 h-4 flex-shrink-0"
          strokeWidth={1.5}
          />

        }
          {item.icon === 'send' &&
        <Send
          className="w-3.5 h-3.5 flex-shrink-0 ml-2"
          strokeWidth={1.5}
          />

        }
        </>
      }
    </NavLink>);

}

export default function BrandPortalLayout() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col gap-6 lg:flex-row lg:gap-10">
      <aside className="flex flex-shrink-0 flex-col border border-white/[0.08] bg-[#1a1c1b]/75 p-3 lg:sticky lg:top-28 lg:h-fit lg:w-60 lg:p-4">
        <p className="mb-3 px-3 text-[10px] uppercase tracking-[0.24em] text-[#b7bfbd]">
          Brand Portal
        </p>
        <nav aria-label="Brand Portal pages" className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
          {strategyNav.map((item) => <NavItem key={item.path} item={item} />)}
          <div className="mx-3 my-2 hidden border-t border-white/[0.1] lg:block" />
          {buildNav.map((item) => <NavItem key={item.path} item={item} />)}
        </nav>
        <div className="mt-3 border-t border-white/[0.1] pt-3">
          {supportNav.map((item) => <NavItem key={item.path} item={item} />)}
        </div>
      </aside>

      <main className="min-w-0 flex-1 lg:py-2">
        <Outlet />
      </main>
    </div>
  );
}