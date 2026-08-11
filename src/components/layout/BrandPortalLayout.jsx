import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Flame, Send } from 'lucide-react';
import WarmGradientDefs from '@/components/shared/WarmGradientDefs';

const mainNav = [
{ name: 'Overview', path: '/brand-portal', end: true },
{ name: 'Brand Up', path: '/brand-portal/brand-up' },
{ name: 'Big Picture', path: '/brand-portal/big-picture' },
{ name: 'Corporate Brand', path: '/brand-portal/corporate' },
{ name: 'Personal Brand', path: '/brand-portal/personal' },
{ name: 'Media Kit', path: '/brand-portal/media-kit' },
{ name: 'Checklist', path: '/brand-portal/checklist' }];


const systemNav = [
{ name: 'Brand Guidelines', path: '/brand-portal/guidelines' },
{ name: 'Brand Assets', path: '/brand-portal/assets' },
{ name: 'Ignite OS', path: '/brand-portal/ignite', icon: 'flame' }];


const bottomNav = [
{ name: 'Request Brand Services', path: '/brand-portal/request-services', icon: 'send' }];


function NavItem({ item }) {
  return (
    <NavLink
      to={item.path}
      end={item.end}
      className={({ isActive }) =>
      `flex items-center justify-between text-sm py-1.5 px-0 lg:py-1.5 transition-all duration-200 whitespace-nowrap lg:whitespace-normal ${
      isActive ? 'font-semibold' : 'text-[#f7f2ea]/70 hover:text-[#f7f2ea]'}`

      }>
      
      {({ isActive }) =>
      <>
          <span
          style={isActive ? {
            background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent'
          } : {}}>
          
            {item.name}
          </span>
          {item.icon === 'flame' &&
        <Flame
          className="w-4 h-4 flex-shrink-0 ml-2"
          strokeWidth={1.5}
          style={{ stroke: 'url(#warmGradientSvg)' }} />

        }
          {item.icon === 'send' &&
        <Send
          className="w-3.5 h-3.5 flex-shrink-0 ml-2"
          strokeWidth={1.5}
          style={{ stroke: 'url(#warmGradientSvg)' }} />

        }
        </>
      }
    </NavLink>);

}

export default function BrandPortalLayout() {
  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
      <WarmGradientDefs />
      <aside className="lg:w-56 border-b lg:border-b-0 lg:border-r border-white/5 px-4 py-4 lg:px-6 lg:py-6 flex-shrink-0 flex flex-col">
        <p className="text-[10px] uppercase tracking-[0.25em] text-[#d9c9a3] mb-4 hidden lg:block">
          Brand Portal
        </p>
        <nav className="flex flex-row lg:flex-col flex-wrap overflow-x-auto lg:overflow-visible lg:pb-0 gap-2 lg:gap-7 pb-2">
          {mainNav.map((item) =>
          <NavItem key={item.path} item={item} />
          )}
          {systemNav.map((item) =>
          <NavItem key={item.path} item={item} />
          )}
        </nav>
        <div className="mt-auto pt-3 lg:pt-4 border-t border-white/5 hidden lg:block">
          {bottomNav.map((item) =>
          <NavItem key={item.path} item={item} />
          )}
        </div>
        {/* Mobile: show bottom nav inline */}
        <div className="lg:hidden mt-2 pt-2 border-t border-white/5">
          {bottomNav.map((item) =>
          <NavItem key={item.path} item={item} />
          )}
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>);

}