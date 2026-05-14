'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import AuthGuard from '@/components/AuthGuard';
import ToastContainer, { showToast } from '@/components/Toast';
import { getDayNumber, getTodayISO } from '@/lib/utils';

export default function SettingsPage() {
  const [startDate,   setStartDate]   = useState('2026-04-13');
  const [goalWeight,  setGoalWeight]  = useState('75');
  const [startWeight, setStartWeight] = useState('120');
  const [currentHeight, setCurrentHeight] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setStartDate(  localStorage.getItem('setting_start_date')   || '2026-04-13');
    setGoalWeight( localStorage.getItem('setting_goal_weight')  || '75');
    setStartWeight(localStorage.getItem('setting_start_weight') || '120');
    setCurrentHeight(localStorage.getItem('current_height') || '');
  }, []);

  const dayNum      = getDayNumber(startDate);
  const safeDayNum  = Math.max(0, Math.min(75, dayNum));
  const remaining75 = Math.max(0, 75 - safeDayNum);
  const pct75       = Math.round((safeDayNum / 75) * 100);
  const currWeight  = localStorage.getItem?.('current_weight') || '--';

  function handleSave() {
    if (!startDate) { showToast('❌ Please pick a challenge start date.', 'error'); return; }
    if (!goalWeight || parseFloat(goalWeight) < 30) { showToast('❌ Enter a valid goal weight.', 'error'); return; }
    localStorage.setItem('setting_start_date',   startDate);
    localStorage.setItem('setting_goal_weight',  goalWeight);
    localStorage.setItem('setting_start_weight', startWeight);
    setSaved(true);
    showToast('✅ Settings saved! Dashboard updated.', 'success');
    setTimeout(() => setSaved(false), 3000);
  }

  function handleReset() {
    if (!confirm('Reset ALL progress data? This cannot be undone.')) return;
    const keep = ['setting_start_date','setting_goal_weight','setting_start_weight','current_weight','current_height'];
    Object.keys(localStorage).forEach(k => { if (!keep.includes(k)) localStorage.removeItem(k); });
    showToast('🔄 Progress data cleared.', 'success');
  }

  return (
    <AuthGuard>
      <div className="dashboard-body">
        <Header active="⚙️ Settings" />
        <main className="dashboard-content" style={{ paddingTop:24 }}>

          {/* Header */}
          <div className="challenge-intro">
            <h2>⚙️ Settings</h2>
            <p>Configure your challenge start date, weight goals, and personal targets. Day 0 is your reset date.</p>
          </div>

          {/* Live Status */}
          <div className="section-tag">Current Status</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:4 }}>
            {[
              { label:'Challenge Day', value:`Day ${safeDayNum}`, sub:'of 75' },
              { label:'Days Left',     value:`${remaining75}`,    sub:'remaining' },
              { label:'Progress',      value:`${pct75}%`,         sub:'complete' },
            ].map(s => (
              <div key={s.label} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'16px 14px', textAlign:'center', boxShadow:'var(--shadow-sm)' }}>
                <div style={{ fontSize:'1.5rem', fontWeight:900, color:'var(--text-1)', letterSpacing:'-1px' }}>{s.value}</div>
                <div style={{ fontSize:'0.58rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'1.5px', fontWeight:800, marginTop:3 }}>{s.sub}</div>
                <div style={{ fontSize:'0.62rem', color:'var(--text-3)', marginTop:4, fontWeight:600 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* 75 Hard Progress Bar */}
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'16px 20px', marginBottom:4, boxShadow:'var(--shadow-sm)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
              <span style={{ fontSize:'0.65rem', fontWeight:800, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'2px' }}>75 Hard Progress</span>
              <span style={{ fontSize:'0.65rem', fontWeight:900, color:'var(--black)', letterSpacing:'1px' }}>{safeDayNum} / 75 days</span>
            </div>
            <div style={{ height:8, background:'var(--surface3)', borderRadius:99, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${pct75}%`, background:'linear-gradient(90deg,#7b31d4,#a855f7)', borderRadius:99, transition:'width 1s ease' }} />
            </div>
          </div>

          {/* Challenge Settings */}
          <div className="section-tag">75 Hard Challenge</div>
          <div className="card">
            <div className="form-group">
              <label>Challenge Start Date (Day 0)</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} max={getTodayISO()} />
              <div style={{ fontSize:'0.7rem', color:'var(--text-3)', marginTop:4 }}>
                This is your Day 0. Today is Day {safeDayNum} based on this date.
              </div>
            </div>

            <div style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'12px 16px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, textAlign:'center' }}>
                <div>
                  <div style={{ fontSize:'0.58rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'1.5px', fontWeight:800, marginBottom:4 }}>Start Date</div>
                  <div style={{ fontSize:'0.82rem', fontWeight:800, color:'var(--text-1)' }}>{startDate}</div>
                </div>
                <div>
                  <div style={{ fontSize:'0.58rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'1.5px', fontWeight:800, marginBottom:4 }}>Today</div>
                  <div style={{ fontSize:'0.82rem', fontWeight:800, color:'var(--text-1)' }}>Day {safeDayNum}</div>
                </div>
                <div>
                  <div style={{ fontSize:'0.58rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'1.5px', fontWeight:800, marginBottom:4 }}>Finish</div>
                  <div style={{ fontSize:'0.82rem', fontWeight:800, color:'#7b31d4' }}>{remaining75} left</div>
                </div>
              </div>
            </div>
          </div>

          {/* Weight Settings */}
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

            {/* Weight Progress Preview */}
            {startWeight && goalWeight && (
              <div style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'14px 16px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                  <span style={{ fontSize:'0.65rem', fontWeight:800, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'1.5px' }}>Weight Journey</span>
                  <span style={{ fontSize:'0.65rem', fontWeight:900, color:'#c07800' }}>{startWeight} → {goalWeight} kg</span>
                </div>
                <div style={{ height:6, background:'var(--surface3)', borderRadius:99, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${Math.min(100,((parseFloat(startWeight)-parseFloat(currWeight==='--'?startWeight:currWeight))/(parseFloat(startWeight)-parseFloat(goalWeight)))*100||0)}%`, background:'linear-gradient(90deg,#f5a623,#ffb94a)', borderRadius:99 }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
                  <span style={{ fontSize:'0.62rem', color:'var(--text-3)', fontWeight:700 }}>Start: {startWeight} kg</span>
                  <span style={{ fontSize:'0.62rem', color:'#c07800', fontWeight:800 }}>Goal: {goalWeight} kg</span>
                </div>
              </div>
            )}
          </div>

          {/* Info cards */}
          <div className="section-tag">How It Works</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              { icon:'📅', title:'Day 0 = Reset Date', body:'Set today or any past date as your Day 0. All challenge progress counts from that date forward.' },
              { icon:'⚖️', title:'Weight Progress', body:'Set your starting weight and goal. The dashboard will show your progress % based on these values.' },
              { icon:'🔄', title:'Changing the Date', body:'If you restart the challenge, just update the start date here. Previous logs in Google Sheets are preserved.' },
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

          {/* Save Button */}
          <div style={{ marginTop:28, marginBottom:16 }}>
            <button className="btn" onClick={handleSave} style={{ background: saved ? '#1a8a3a' : 'var(--black)' }}>
              {saved ? '✅ Settings Saved!' : 'Save Settings →'}
            </button>
          </div>

          {/* Danger Zone */}
          <div style={{ background:'#fff0f0', border:'1.5px solid #ffd0d0', borderRadius:'var(--radius)', padding:'18px 20px', marginBottom:40 }}>
            <div style={{ fontSize:'0.65rem', fontWeight:900, color:'#d92b2b', textTransform:'uppercase', letterSpacing:'2px', marginBottom:10 }}>⚠️ Danger Zone</div>
            <p style={{ fontSize:'0.8rem', color:'#888', lineHeight:1.6, marginBottom:14 }}>
              Clear all local progress logs (streaks, daily logs). Your Google Sheets data is safe — only local backup data is cleared.
            </p>
            <button onClick={handleReset}
              style={{ background:'transparent', color:'#d92b2b', border:'2px solid #d92b2b', borderRadius:'var(--radius-sm)', padding:'10px 20px', fontFamily:'inherit', fontSize:'0.75rem', fontWeight:800, letterSpacing:'1.5px', textTransform:'uppercase', cursor:'pointer', width:'100%' }}>
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
