'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { hashString, setLoggedIn, isLoggedIn } from '@/lib/utils';
import { VALID_USER_HASH, VALID_PASS_HASH } from '@/lib/config';
import ToastContainer, { showToast } from '@/components/Toast';

const MOTIVATIONAL_QUOTES = [
  "The pain you feel today will be the strength you feel tomorrow.",
  "Discipline is doing what needs to be done, even when you don't want to.",
  "You didn't come this far to only come this far.",
  "Every champion was once a contender who refused to give up.",
];

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [quote] = useState(() => MOTIVATIONAL_QUOTES[new Date().getDate() % MOTIVATIONAL_QUOTES.length]);

  useEffect(() => {
    if (isLoggedIn()) router.replace('/dashboard/');
  }, [router]);

  async function handleLogin() {
    if (!username.trim() || !password.trim()) {
      showToast('❌ Enter your credentials to continue.', 'error');
      return;
    }
    setLoading(true);
    const u = await hashString(username.trim().toLowerCase());
    const p = await hashString(password.trim());
    if (u === VALID_USER_HASH && p === VALID_PASS_HASH) {
      setLoggedIn();
      router.push('/dashboard/');
    } else {
      showToast('❌ Invalid credentials. Try again.', 'error');
      setLoading(false);
    }
  }

  return (
    <>
      <main className="hero-section">

        {/* ── HERO BANNER ── */}
        <div className="hero-banner">
          <div className="hero-bg" />
          <div className="hero-content-top fade-up">
            <div style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.45)', letterSpacing:'4px', textTransform:'uppercase', marginBottom:12 }}>
              Health · Discipline · Purpose
            </div>
            <h1 className="app-main-title">
              Health<br />by <span className="app-main-subtitle">Kiran</span>
            </h1>
            <p className="app-tagline">Discipline • Consistency • Purpose</p>

            {/* Just Do It Banner */}
            <div style={{ marginTop:24, background:'var(--accent)', borderRadius:10, padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:'1.2rem', fontWeight:900, color:'#000', textTransform:'uppercase', letterSpacing:'-0.5px' }}>Just Do It.</div>
                <div style={{ fontSize:'0.65rem', fontWeight:700, color:'rgba(0,0,0,0.55)', letterSpacing:'2px', textTransform:'uppercase', marginTop:3 }}>No excuses. No compromises.</div>
              </div>
              <div style={{ fontSize:'2.2rem', opacity:0.9 }}>✔️</div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM SHEET ── */}
        <div className="hero-bottom" style={{ width:'100%' }}>

          {/* Daily Quote */}
          <div style={{ background:'#000', borderRadius:12, padding:'16px 18px', marginBottom:20 }}>
            <div style={{ fontSize:'0.58rem', color:'var(--accent)', fontWeight:900, letterSpacing:'2.5px', textTransform:'uppercase', marginBottom:6 }}>Today&apos;s Fuel</div>
            <div style={{ fontSize:'0.88rem', fontWeight:600, color:'rgba(255,255,255,0.85)', lineHeight:1.6, fontStyle:'italic' }}>
              &ldquo;{quote}&rdquo;
            </div>
          </div>

          {/* Login */}
          <div style={{ marginBottom:8 }}>
            <div style={{ fontSize:'0.65rem', fontWeight:900, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'2px', marginBottom:14 }}>Sign In to Continue</div>
            <div className="form-group">
              <label>Username</label>
              <input type="text" placeholder="Enter username" autoCapitalize="none" autoCorrect="off" spellCheck={false}
                value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key==='Enter' && handleLogin()} />
            </div>
            <div className="form-group" style={{ marginBottom:20 }}>
              <label>Password</label>
              <input type="password" placeholder="Enter password"
                value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==='Enter' && handleLogin()} />
            </div>
            <button className="btn" onClick={handleLogin} disabled={loading}>
              {loading ? 'Signing in...' : 'Start Training →'}
            </button>
          </div>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:12, margin:'24px 0' }}>
            <div style={{ flex:1, height:1, background:'var(--border)' }} />
            <div style={{ fontSize:'0.62rem', fontWeight:700, color:'var(--text-3)', letterSpacing:'1.5px', textTransform:'uppercase' }}>Nike Philosophy</div>
            <div style={{ flex:1, height:1, background:'var(--border)' }} />
          </div>

          {/* Ikigai Card */}
          <div style={{ background:'#000', borderRadius:14, padding:22, marginBottom:14 }}>
            <div style={{ fontSize:'0.62rem', fontWeight:900, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'2px', marginBottom:10 }}>🌸 Ikigai — Reason for Being</div>
            <p style={{ fontSize:'0.83rem', color:'rgba(255,255,255,0.6)', lineHeight:1.75, marginBottom:16 }}>
              Ikigai sits at the intersection of what you <strong style={{ color:'#fff' }}>love</strong>, what you&apos;re <strong style={{ color:'#fff' }}>good at</strong>, what the world <strong style={{ color:'#fff' }}>needs</strong>, and what you can be <strong style={{ color:'#fff' }}>rewarded</strong> for. This is your purpose. Live it every single day.
            </p>
            <div className="ikigai-pillars">
              {[['🔥','Passion','What you love'],['🎯','Purpose','What the world needs'],['⚔️','Discipline','What you\'re great at'],['♾️','Consistency','What drives you']].map(([icon, label, sub]) => (
                <div className="pillar" key={label}>
                  <div className="pillar-icon">{icon}</div>
                  <div className="pillar-label">{label}</div>
                  <div style={{ fontSize:'0.6rem', color:'rgba(255,255,255,0.35)', marginTop:3 }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Just Do It Philosophy */}
          <div style={{ background:'#000', borderRadius:14, padding:22 }}>
            <div style={{ fontSize:'0.62rem', fontWeight:900, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'2px', marginBottom:14 }}>✔️ Just Do It — The Philosophy</div>
            {[
              { icon:'⚡', title:'Act First', body:'Stop overthinking. The moment you feel the urge to do something hard, count 5-4-3-2-1 and act. Your future self thanks you.' },
              { icon:'🧱', title:'Build the Wall', body:'You don\'t build a wall in a day. You lay one brick as perfectly as possible. Do it every single day. That\'s how champions are made.' },
              { icon:'🔄', title:'No Days Off', body:'The body achieves what the mind believes. Consistency over perfection. Show up even when you don\'t feel like it.' },
            ].map(p => (
              <div key={p.title} style={{ display:'flex', gap:14, marginBottom:16, alignItems:'flex-start' }}>
                <div style={{ width:38, height:38, background:'rgba(245,166,35,0.15)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0, border:'1px solid rgba(245,166,35,0.25)' }}>{p.icon}</div>
                <div>
                  <div style={{ fontSize:'0.82rem', fontWeight:800, color:'#fff', marginBottom:3 }}>{p.title}</div>
                  <div style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.5)', lineHeight:1.65 }}>{p.body}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
      <footer>Built with discipline by Kiran Kumar</footer>
      <ToastContainer />
    </>
  );
}
