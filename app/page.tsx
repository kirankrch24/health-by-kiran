'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { hashString, setLoggedIn, isLoggedIn } from '@/lib/utils';
import { VALID_USER_HASH, VALID_PASS_HASH } from '@/lib/config';
import ToastContainer, { showToast } from '@/components/Toast';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) router.replace('/health-by-kiran/dashboard/');
  }, [router]);

  async function handleLogin() {
    if (!username.trim() || !password.trim()) {
      showToast('❌ Please enter username and password.', 'error');
      return;
    }
    setLoading(true);
    const u = await hashString(username.trim().toLowerCase());
    const p = await hashString(password.trim());
    if (u === VALID_USER_HASH && p === VALID_PASS_HASH) {
      setLoggedIn();
      router.push('/health-by-kiran/dashboard/');
    } else {
      showToast('❌ Invalid credentials. Please try again.', 'error');
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleLogin();
  }

  return (
    <>
      <main className="hero-section">
        <div className="hero-bg" />
        <div className="hero-content">
          <header className="text-center mb-2">
            <h1 className="app-main-title">
              Health by <span className="app-main-subtitle">Kiran Kumar</span>
            </h1>
            <p className="app-tagline">Discipline • Consistency • Purpose</p>
          </header>

          <section className="card fade-up">
            <h2 className="card-title mb-4">Sign In</h2>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                placeholder="Enter username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKey}
              />
            </div>
            <div className="form-group mb-5">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKey}
              />
            </div>
            <button className="btn" onClick={handleLogin} disabled={loading}>
              {loading ? 'Signing in...' : 'Login →'}
            </button>
          </section>

          <section className="ikigai-card fade-up">
            <h2 className="card-title">🌸 Ikigai Philosophy</h2>
            <p>
              Ikigai is the Japanese art of finding purpose. It sits at the intersection of what
              you love, what you&apos;re good at, what the world needs, and what you can be
              rewarded for. Live it every day.
            </p>
            <div className="ikigai-pillars">
              {[['🔥','Passion'],['🎯','Purpose'],['⚔️','Discipline'],['♾️','Consistency']].map(([icon, label]) => (
                <div className="pillar" key={label}>
                  <div className="pillar-icon">{icon}</div>
                  <div className="pillar-label">{label}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <footer>Built with discipline by Kiran Kumar</footer>
      <ToastContainer />
    </>
  );
}
