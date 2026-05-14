'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/utils';

interface NavItem { href: string; label: string; active?: boolean; }

export default function Header({ active }: { active: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const nav: NavItem[] = [
    { href: '/health-by-kiran/dashboard/', label: '🏠 Home' },
    { href: '/health-by-kiran/hard75/', label: '💪 75 Hard Challenge' },
    { href: '/health-by-kiran/food/', label: '🍽️ Food Eaten Log' },
    { href: '/health-by-kiran/body/', label: '⚖️ Body Metrics Log' },
  ];

  function handleLogout() {
    logout();
    router.push('/health-by-kiran/');
  }

  return (
    <header className="dashboard-header">
      <h1>Health by Kiran Kumar</h1>
      <nav className="nav-dropdown">
        <button className="nav-toggle" onClick={() => setOpen(!open)}>☰ Menu</button>
        {open && (
          <div className="dropdown-menu open" onClick={() => setOpen(false)}>
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className={active === item.label ? 'active' : ''}>
                {item.label}
              </Link>
            ))}
            <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>🚪 Logout</a>
          </div>
        )}
      </nav>
    </header>
  );
}
