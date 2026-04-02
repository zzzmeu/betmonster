'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Skull, BarChart3, Users, Crosshair } from 'lucide-react';

const links = [
  { href: '/', label: 'Dashboard', icon: BarChart3 },
  { href: '/tipsters', label: 'Tipsters', icon: Users },
  { href: '/picks', label: 'Picks', icon: Crosshair },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <Skull className="h-8 w-8 text-[#39FF14] group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold tracking-tight">
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
  );
}
