'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Skull, BarChart3, Users, Crosshair, Trophy } from 'lucide-react';

const links = [
  { href: '/', label: 'Dashboard', icon: BarChart3 },
  { href: '/tipsters', label: 'Tipsters', icon: Users },
  { href: '/picks', label: 'Picks', icon: Crosshair },
  { href: '/performance', label: 'Track Record', icon: Trophy },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop top nav */}
      <nav className="hidden md:block border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2 group">
              <Skull className="h-7 w-7 text-[#39FF14] group-hover:scale-110 transition-transform" />
              <span className="text-lg font-bold tracking-tight">
                <span className="text-white">Bet</span>
                <span className="text-[#39FF14]">Monster</span>
              </span>
            </Link>
            <div className="flex items-center gap-1">
              {links.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== '/' && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-[#39FF14]/10 text-[#39FF14]'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile top bar (logo only) */}
      <div className="md:hidden border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-center h-12">
          <Link href="/" className="flex items-center gap-2">
            <Skull className="h-6 w-6 text-[#39FF14]" />
            <span className="text-lg font-bold tracking-tight">
              <span className="text-white">Bet</span>
              <span className="text-[#39FF14]">Monster</span>
            </span>
          </Link>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-lg safe-bottom">
        <div className="flex items-center justify-around h-16 px-2 pb-[env(safe-area-inset-bottom)]">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[60px] ${
                  active
                    ? 'text-[#39FF14]'
                    : 'text-zinc-500'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'drop-shadow-[0_0_6px_#39FF14]' : ''}`} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
