'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/utils';

export default function Header({ active }: { active: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const nav = [
    { href:'/dashboard/',  label:'🏠 Home' },
    { href:'/hard75/',     label:'💪 75 Hard' },
    { href:'/food/',       label:'🍽️ Food Log' },
    { href:'/body/',       label:'⚖️ Body Metrics' },
    { href:'/settings/',   label:'⚙️ Settings' },
  ];

  function handleLogout() { logout(); router.push('/'); }

  return (
    <header className="dashboard-header">
      <h1>Health by Kiran</h1>
      <nav className="nav-dropdown">
        <button className="nav-toggle" onClick={() => setOpen(!open)}>☰ Menu</button>
        {open && (
          <div className="dropdown-menu open" onClick={() => setOpen(false)}>
            {nav.map(item => (
              <Link key={item.href} href={item.href} className={active === item.label ? 'active' : ''}>
                {item.label}
              </Link>
            ))}
            <a href="#" onClick={e => { e.preventDefault(); handleLogout(); }} style={{ color:'#d92b2b' }}>🚪 Logout</a>
          </div>
        )}
      </nav>
    </header>
  );
}
