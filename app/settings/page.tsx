'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import AuthGuard from '@/components/AuthGuard';
import ToastContainer, { showToast } from '@/components/Toast';
import { getDayNumber, getTodayISO } from '@/lib/utils';

export default function SettingsPage() {
  const [startDate,    setStartDate]    = useState('2026-04-13');
  const [goalWeight,   setGoalWeight]   = useState('75');
  const [startWeight,  setStartWeight]  = useState('120');
  const [currWeight,   setCurrWeight]   = useState('--');
  const [saved, setSaved] = useState(false);

  // All localStorage reads happen safely inside useEffect (client-only)
  useEffect(() => {
    setStartDate(   localStorage.getItem('setting_start_date')   || '2026-04-13');
    setGoalWeight(  localStorage.getItem('setting_goal_weight')  || '75');
    setStartWeight( localStorage.getItem('setting_start_weight') || '120');
    setCurrWeight(  localStorage.getItem('current_weight')       || '--');
  }, []);

  const dayNum      = getDayNumber(startDate);
  const safeDayNum  = Math.max(0, Math.min(75, dayNum));
  const remaining75 = Math.max(0, 75 - safeDayNum);
  const pct75       = Math.round((safeDayNum / 75) * 100);

  const weightLost = currWeight !== '--' && startWeight
    ? Math.max(0, parseFloat(startWeight) - parseFloat(currWeight)).toFixed(1)
    : '--';
  const weightToGo = currWeight !== '--' && goalWeight
    ? Math.max(0, parseFloat(currWeight) - parseFloat(goalWeight)).toFixed(1)
    : '--';
  const weightProgress = currWeight !== '--' && startWeight && goalWeight
    ? Math.min(100, Math.max(0, ((parseFloat(startWeight) - parseFloat(currWeight)) / (parseFloat(startWeight) - parseFloat(goalWeight))) * 100))
    : 0;

  function handleSave() {
    if (!startDate)                            { showToast('❌ Please pick a start date.', 'error'); return; }
    if (!goalWeight || parseFloat(goalWeight) < 30) { showToast('❌ Enter a valid goal weight.', 'error'); return; }
    localStorage.setItem('setting_start_date',   startDate);
    localStorage.setItem('setting_goal_weight',  goalWeight);
    localStorage.setItem('setting_start_weight', startWeight);
    setSaved(true);
    showToast('✅ Settings saved! Dashboard updated.', 'success');
    setTimeout(() => setSaved(false), 3000);
  }

  function handleReset() {
    if (!confirm('Clear all local progress data? Your Google Sheets data is safe.')) return;
    const keep = ['setting_start_date','setting_goal_weight','setting_start_weight','current_weight','current_height'];
    Object.keys(localStorage).forEach(k => { if (!keep.includes(k)) localStorage.removeItem(k); });
    showToast('🔄 Progress data cleared.', 'success');
  }

  return (
    <AuthGuard>
      <div className="dashboard-body">
        <Header active="⚙️ Settings" />
        <main className="dashboard-content" style={{ paddingTop: 24 }}>

          {/* Header Card */}
          <div className="challenge-intro">
            <h2>⚙️ Settings</h2>
            <p>Set your Day 0, weight goals and targets. All progress on the dashboard updates automatically.</p>
          </div>

          {/* Live Status Row */}
          <div className="section-tag">Current Status</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
            {[
              { label:'Challenge Day', value:`Day ${safeDayNum}`, sub:'of 75', color:'#7b31d4' },
              { label:'Days Left',     value:String(remaining75), sub:'remaining', color:'var(--text-1)' },
              { label:'Progress',      value:`${pct75}%`,         sub:'complete',  color:'var(--text-1)' },
            ].map(s => (
              <div key={s.label} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'16px 12px', textAlign:'center', boxShadow:'var(--shadow-sm)' }}>
                <div style={{ fontSize:'1.5rem', fontWeight:900, color:s.color, letterSpacing:'-1px', lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:'0.58rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'1.5px', fontWeight:800, marginTop:4 }}>{s.sub}</div>
                <div style={{ fontSize:'0.62rem', color:'var(--text-3)', marginTop:3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Challenge Progress Bar */}
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'18px 20px', marginTop:12, boxShadow:'var(--shadow-sm)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
              <span style={{ fontSize:'0.65rem', fontWeight:800, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'2px' }}>75 Hard Progress</span>
              <span style={{ fontSize:'0.65rem', fontWeight:900, color:'#7b31d4' }}>{safeDayNum} / 75 days</span>
            </div>
            <div style={{ height:8, background:'var(--surface3)', borderRadius:99, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${pct75}%`, background:'linear-gradient(90deg,#7b31d4,#a855f7)', borderRadius:99, transition:'width 1s ease' }} />
            </div>
          </div>

          {/* ── 75 Hard Settings ── */}
          <div className="section-tag">75 Hard Challenge — Day 0</div>
          <div className="card">
            <div className="form-group">
              <label>Challenge Start Date (Day 0)</label>
              <input type="date" value={startDate} max={getTodayISO()} onChange={e => setStartDate(e.target.value)} />
              <div style={{ fontSize:'0.7rem', color:'var(--text-3)', marginTop:4, lineHeight:1.5 }}>
                This is your reset date. Today automatically becomes Day {safeDayNum}.
              </div>
            </div>

            <div style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'14px 16px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, textAlign:'center' }}>
                {[
                  { label:'Start Date', value: startDate || '—' },
                  { label:'Today',      value:`Day ${safeDayNum}` },
                  { label:'Finish In',  value:`${remaining75} days` },
                ].map(r => (
                  <div key={r.label}>
                    <div style={{ fontSize:'0.58rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'1.5px', fontWeight:800, marginBottom:5 }}>{r.label}</div>
                    <div style={{ fontSize:'0.82rem', fontWeight:800, color:'var(--text-1)' }}>{r.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Weight Settings ── */}
          <div className="section-tag">Weight Goal</div>
          <div className="card">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label>Starting Weight (kg)</label>
                <input type="number" inputMode="decimal" step={0.1} value={startWeight} onChange={e => setStartWeight(e.target.value)} placeholder="e.g. 120" />
                <div style={{ fontSize:'0.68rem', color:'var(--text-3)', marginTop:4 }}>Your weight on Day 0</div>
              </div>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label>Goal Weight (kg)</label>
                <input type="number" inputMode="decimal" step={0.1} value={goalWeight} onChange={e => setGoalWeight(e.target.value)} placeholder="e.g. 75" />
                <div style={{ fontSize:'0.68rem', color:'var(--text-3)', marginTop:4 }}>Your target weight</div>
              </div>
            </div>

            <div style={{ height:16 }} />

            {/* Weight Stats */}
            <div style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'14px 16px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, textAlign:'center', marginBottom:14 }}>
                {[
                  { label:'Current',  value: currWeight !== '--' ? `${currWeight} kg` : '--', color:'#c07800' },
                  { label:'Lost',     value: weightLost !== '--' ? `${weightLost} kg` : '--', color:'#1a8a3a' },
                  { label:'To Go',    value: weightToGo !== '--' ? `${weightToGo} kg` : '--', color:'var(--text-1)' },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontSize:'0.58rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'1.5px', fontWeight:800, marginBottom:5 }}>{s.label}</div>
                    <div style={{ fontSize:'0.95rem', fontWeight:900, color:s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
              {/* Weight Progress Bar */}
              <div style={{ height:5, background:'var(--surface3)', borderRadius:99, overflow:'hidden', marginBottom:6 }}>
                <div style={{ height:'100%', width:`${weightProgress}%`, background:'linear-gradient(90deg,#f5a623,#ffb94a)', borderRadius:99, transition:'width 0.8s ease' }} />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:'0.62rem', color:'var(--text-3)', fontWeight:700 }}>Start: {startWeight} kg</span>
                <span style={{ fontSize:'0.62rem', color:'#c07800', fontWeight:800 }}>Goal: {goalWeight} kg · {Math.round(weightProgress)}%</span>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="section-tag">How It Works</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              { icon:'📅', title:'Day 0 = Reset Date', body:'Set any past date as your Day 0. All challenge progress counts from that date. Change it anytime to restart.' },
              { icon:'⚖️', title:'Weight Progress',    body:'Set your starting weight and target. The dashboard progress bar calculates % based on these values.' },
              { icon:'☁️', title:'Google Sheets Safe', body:'Changing settings here only affects the dashboard display. All your Sheets data is completely untouched.' },
            ].map(p => (
              <div key={p.title} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'16px 18px', display:'flex', gap:14, alignItems:'flex-start', boxShadow:'var(--shadow-sm)' }}>
                <div style={{ fontSize:'1.3rem', flexShrink:0, marginTop:2 }}>{p.icon}</div>
                <div>
                  <div style={{ fontSize:'0.85rem', fontWeight:800, color:'var(--text-1)', marginBottom:4 }}>{p.title}</div>
                  <div style={{ fontSize:'0.78rem', color:'var(--text-2)', lineHeight:1.65 }}>{p.body}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Save */}
          <div style={{ marginTop:28, marginBottom:20 }}>
            <button className="btn" onClick={handleSave} style={{ background: saved ? '#1a8a3a' : 'var(--black)' }}>
              {saved ? '✅ Settings Saved!' : 'Save Settings →'}
            </button>
          </div>

          {/* Danger Zone */}
          <div style={{ background:'#fff5f5', border:'1.5px solid #ffd5d5', borderRadius:'var(--radius)', padding:'20px', marginBottom:48 }}>
            <div style={{ fontSize:'0.62rem', fontWeight:900, color:'#d92b2b', textTransform:'uppercase', letterSpacing:'2px', marginBottom:10 }}>⚠️ Danger Zone</div>
            <p style={{ fontSize:'0.8rem', color:'var(--text-2)', lineHeight:1.65, marginBottom:16 }}>
              Clears local progress logs (streaks, daily backups). Your <strong>Google Sheets data is completely safe</strong> — only local cache is removed.
            </p>
            <button onClick={handleReset} style={{ background:'transparent', color:'#d92b2b', border:'2px solid #d92b2b', borderRadius:'var(--radius-sm)', padding:'11px 20px', fontFamily:'inherit', fontSize:'0.75rem', fontWeight:900, letterSpacing:'1.5px', textTransform:'uppercase', cursor:'pointer', width:'100%', transition:'var(--transition)' }}>
              Clear Local Progress Data
            </button>
          </div>

        </main>
        <footer>Built with discipline by Kiran Kumar</footer>
        <ToastContainer />
      </div>
    </AuthGuard>
  );
}
