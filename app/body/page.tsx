'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import AuthGuard from '@/components/AuthGuard';
import ToastContainer, { showToast } from '@/components/Toast';
import { getTodayISO } from '@/lib/utils';
import { BODY_APPS_SCRIPT_URL } from '@/lib/config';

export default function BodyPage() {
  const [date, setDate] = useState(getTodayISO());
  const [time, setTime] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { setTime(new Date().toTimeString().substring(0, 5)); }, []);

  const bmi = weight && height
    ? (parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1)
    : null;

  const bmiStatus = bmi
    ? parseFloat(bmi) < 18.5 ? { label:'Underweight', color:'#0a84ff' }
    : parseFloat(bmi) <= 24.9 ? { label:'Healthy', color:'#30d158' }
    : parseFloat(bmi) <= 29.9 ? { label:'Overweight', color:'#f5a623' }
    : { label:'Obese', color:'#ff3b30' }
    : null;

  const weightProgress = weight ? (() => {
    const curr = parseFloat(weight), target = 75, start = 120;
    if (curr <= target) return 100;
    if (curr >= start) return 5;
    return Math.max(0, Math.min(100, ((start - curr) / (start - target)) * 100));
  })() : 0;

  async function handleSubmit() {
    if (!weight || !height) {
      showToast('❌ Please enter both weight and height.', 'error');
      return;
    }
    setSubmitting(true);
    const data = { logType:'BODY_METRICS', date, time, weight, height };
    localStorage.setItem('current_weight', weight);
    localStorage.setItem('current_height', height);
    localStorage.setItem('body_log_' + Date.now(), JSON.stringify(data));
    try {
      await fetch(BODY_APPS_SCRIPT_URL, { method:'POST', mode:'no-cors', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
      showToast('⚖️ Body metrics saved to Sheets!', 'success');
    } catch {
      showToast('❌ Failed. Saved locally.', 'error');
    }
    setDate(getTodayISO());
    setTime(new Date().toTimeString().substring(0, 5));
    setWeight('');
    setSubmitting(false);
  }

  return (
    <AuthGuard>
      <div className="dashboard-body">
        <Header active="⚖️ Body Metrics Log" />
        <main className="dashboard-content">

          <div className="challenge-intro">
            <h2>⚖️ Body Metrics Log</h2>
            <p>Track weight & height — monitor your BMI and progress to 75 kg.</p>
          </div>

          {/* Live BMI Preview */}
          {bmi && bmiStatus && (
            <div style={{ background:'var(--surface)', border:`1px solid ${bmiStatus.color}30`, borderRadius:'var(--radius)', padding:'20px 22px', marginBottom:16, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, textAlign:'center' }}>
              <div>
                <div style={{ fontSize:'0.65rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'1.5px', fontWeight:700, marginBottom:6 }}>Weight</div>
                <div style={{ fontSize:'1.6rem', fontWeight:900, color:'var(--accent)', letterSpacing:'-1px' }}>{weight} <span style={{ fontSize:'0.9rem' }}>kg</span></div>
              </div>
              <div>
                <div style={{ fontSize:'0.65rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'1.5px', fontWeight:700, marginBottom:6 }}>BMI</div>
                <div style={{ fontSize:'1.6rem', fontWeight:900, color:bmiStatus.color, letterSpacing:'-1px' }}>{bmi}</div>
                <div style={{ fontSize:'0.65rem', fontWeight:800, color:bmiStatus.color, textTransform:'uppercase', letterSpacing:'1px', marginTop:2 }}>{bmiStatus.label}</div>
              </div>
              <div>
                <div style={{ fontSize:'0.65rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'1.5px', fontWeight:700, marginBottom:6 }}>To Goal</div>
                <div style={{ fontSize:'1.6rem', fontWeight:900, color:'var(--text-1)', letterSpacing:'-1px' }}>
                  {Math.max(0, parseFloat(weight) - 75).toFixed(1)} <span style={{ fontSize:'0.9rem' }}>kg</span>
                </div>
              </div>
              {/* progress bar */}
              <div style={{ gridColumn:'1/-1' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:'0.65rem', color:'var(--text-3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px' }}>Progress to 75 kg</span>
                  <span style={{ fontSize:'0.65rem', color:'var(--accent)', fontWeight:800, textTransform:'uppercase', letterSpacing:'1px' }}>{Math.round(weightProgress)}%</span>
                </div>
                <div style={{ height:4, background:'var(--surface3)', borderRadius:99, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${weightProgress}%`, background:'linear-gradient(90deg,#f5a623,#ffb94a)', borderRadius:99, transition:'width 0.8s ease' }} />
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label>Date</label>
                <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label>Time</label>
                <input type="time" value={time} onChange={e=>setTime(e.target.value)} />
              </div>
            </div>

            <div style={{ height:16 }} />

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label>Weight (kg)</label>
                <input type="number" inputMode="decimal" step={0.1} value={weight} onChange={e=>setWeight(e.target.value)} placeholder="e.g. 80.5" />
              </div>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label>Height (cm)</label>
                <input type="number" inputMode="numeric" value={height} onChange={e=>setHeight(e.target.value)} placeholder="e.g. 175" />
              </div>
            </div>

            <div className="submit-area" style={{ marginTop:24, paddingBottom:0 }}>
              <button className="btn" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Body Metrics →'}
              </button>
            </div>
          </div>

        </main>
        <footer>Built with discipline by Kiran Kumar</footer>
        <ToastContainer />
      </div>
    </AuthGuard>
  );
}
