'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import AuthGuard from '@/components/AuthGuard';
import ToastContainer from '@/components/Toast';
import { formatDate, getTodayISO, getDayNumber } from '@/lib/utils';
import { CHALLENGE_START_DATE, FOOD_APPS_SCRIPT_URL, BODY_APPS_SCRIPT_URL, QUOTE } from '@/lib/config';

interface FoodLog {
  date?: string; Date?: string; time?: string; mealType?: string; mealtype?: string;
  source?: string; Source?: string; shop?: string; Shop?: string;
  notes?: string; Notes?: string;
  foodItem1?: string; fooditem1?: string; foodItem2?: string; fooditem2?: string;
  foodItem3?: string; fooditem3?: string; foodItem4?: string; fooditem4?: string;
  foodItem5?: string; fooditem5?: string;
}

function useBodyMetrics() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  useEffect(() => {
    const w = localStorage.getItem('current_weight') || '';
    const h = localStorage.getItem('current_height') || '';
    setWeight(w); setHeight(h);
    if (BODY_APPS_SCRIPT_URL) {
      fetch(BODY_APPS_SCRIPT_URL).then(r => r.json()).then(data => {
        if (data?.weight && data?.height) {
          localStorage.setItem('current_weight', data.weight);
          localStorage.setItem('current_height', data.height);
          setWeight(data.weight); setHeight(data.height);
        }
      }).catch(() => {});
    }
  }, []);
  const bmi = weight && height ? (parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1) : '--';
  const weightProgress = (() => {
    if (!weight) return 0;
    const curr = parseFloat(weight), target = 75, start = 120;
    if (curr <= target) return 100;
    if (curr >= start) return 5;
    return Math.max(0, Math.min(100, ((start - curr) / (start - target)) * 100));
  })();
  return { weight, bmi, weightProgress };
}

export default function DashboardPage() {
  const { weight, bmi, weightProgress } = useBodyMetrics();
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [foodLoading, setFoodLoading] = useState(true);
  const [foodDate, setFoodDate] = useState(getTodayISO());

  const dayNum = getDayNumber(CHALLENGE_START_DATE);
  const safeDayNum = Math.max(0, Math.min(75, dayNum));
  const remaining75 = 75 - safeDayNum;
  const pct75 = Math.round((safeDayNum / 75) * 100);
  const weightRemaining = weight ? Math.max(0, parseFloat(weight) - 75).toFixed(1) : '--';

  const loadFood = useCallback(async (date: string) => {
    setFoodLoading(true);
    try {
      const resp = await fetch(FOOD_APPS_SCRIPT_URL);
      if (!resp.ok) { setFoodLogs([]); setFoodLoading(false); return; }
      const all: FoodLog[] = await resp.json();
      const filtered = all.filter(item => {
        const d = item.date || item.Date;
        if (!d) return false;
        if (typeof d === 'string') {
          if (d.startsWith(date)) return true;
          const parsed = new Date(d);
          if (!isNaN(parsed.getTime())) {
            const iso = `${parsed.getFullYear()}-${String(parsed.getMonth()+1).padStart(2,'0')}-${String(parsed.getDate()).padStart(2,'0')}`;
            return iso === date;
          }
        }
        return false;
      });
      const seen = new Map<string, FoodLog>();
      filtered.forEach(log => { const k = `${log.time||''}-${log.mealType||log.mealtype||''}`; seen.set(k, log); });
      setFoodLogs(Array.from(seen.values()).sort((a,b) => (a.time||'').localeCompare(b.time||'')));
    } catch { setFoodLogs([]); }
    setFoodLoading(false);
  }, []);

  useEffect(() => { loadFood(foodDate); }, [foodDate, loadFood]);

  function displayTime(t: string): string {
    if (!t || t.length <= 5) return t || '--:--';
    const m = t.match(/(\d{2}:\d{2}):\d{2}/);
    if (m) return m[1];
    if (t.includes('T')) return new Date(t).toTimeString().substring(0,5);
    return t.substring(0,5);
  }

  return (
    <AuthGuard>
      <div className="dashboard-body">
        <Header active="🏠 Home" />

        {/* Welcome Banner */}
        <section className="premium-welcome">
          <div className="welcome-text">Keep Going, Champion</div>
          <div className="welcome-name">Hey Kiran 👋<br />Just Do It ✔️</div>
          <div className="micro-stats-row">
            <div className="micro-stat">
              <div className="micro-stat-val">Day {safeDayNum}</div>
              <div className="micro-stat-lbl">75 Hard</div>
            </div>
            <div className="micro-stat">
              <div className="micro-stat-val">{weight || '--'} kg</div>
              <div className="micro-stat-lbl">Current Weight</div>
            </div>
            <div className="micro-stat">
              <div className="micro-stat-val">{bmi}</div>
              <div className="micro-stat-lbl">BMI</div>
            </div>
          </div>
        </section>

        <main className="dashboard-content">

          {/* Goal Cards */}
          <div className="section-tag">Core Goals</div>
          <div className="three-block-grid">

            {/* Weight */}
            <div className="premium-card weight-card">
              <div className="card-bg-glow" style={{ background:'#f5a623' }} />
              <div className="goal-header">
                <div className="goal-icon-box" style={{ background:'rgba(245,166,35,0.1)', borderColor:'rgba(245,166,35,0.3)' }}>⚖️</div>
                <div>
                  <div className="goal-title-text">Weight Goal</div>
                  <div className="goal-subtitle" style={{ color:'#f5a623' }}>{weightRemaining} kg to go</div>
                </div>
              </div>
              <div className="goal-content">
                <div className="weight-stats">
                  <div>
                    <div className="weight-current" style={{ color:'#f5a623' }}>
                      {weight || '--'}<span style={{ fontSize:'1rem', fontWeight:600 }}> kg</span>
                    </div>
                    <div className="bmi-badge">BMI {bmi}</div>
                  </div>
                  <div className="weight-target">Goal<br />75 kg</div>
                </div>
                <div className="w-progress-track">
                  <div className="w-progress-fill" style={{ width:`${weightProgress}%`, background:'linear-gradient(90deg,#f5a623,#ffb94a)' }} />
                </div>
                <div className="w-percent-label">{Math.round(weightProgress)}% complete</div>
              </div>
            </div>

            {/* 75 Hard */}
            <div className="premium-card challenge-progress-card">
              <div className="card-bg-glow" style={{ background:'#bf5af2' }} />
              <div className="goal-header">
                <div className="goal-icon-box" style={{ background:'rgba(191,90,242,0.1)', borderColor:'rgba(191,90,242,0.3)' }}>💪</div>
                <div>
                  <div className="goal-title-text">75 Hard</div>
                  <div className="goal-subtitle" style={{ color:'#bf5af2' }}>{remaining75} days remaining</div>
                </div>
              </div>
              <div className="goal-content">
                <div className="weight-stats">
                  <div className="weight-current" style={{ color:'#bf5af2' }}>
                    Day {safeDayNum}<span style={{ fontSize:'1rem', fontWeight:600 }}>/75</span>
                  </div>
                  <div className="weight-target">Goal<br />75 Days</div>
                </div>
                <div className="w-progress-track">
                  <div className="w-progress-fill" style={{ width:`${pct75}%`, background:'linear-gradient(90deg,#bf5af2,#d97aff)' }} />
                </div>
                <div className="w-percent-label">{pct75}% complete</div>
              </div>
            </div>

            {/* Quote */}
            <div className="premium-card quote-card">
              <div className="card-bg-glow" style={{ background:'#0a84ff' }} />
              <div className="goal-header">
                <div className="goal-icon-box" style={{ background:'rgba(10,132,255,0.1)', borderColor:'rgba(10,132,255,0.3)' }}>💡</div>
                <div>
                  <div className="goal-title-text">Daily Fuel</div>
                  <div className="goal-subtitle" style={{ color:'#0a84ff' }}>Feed your mind</div>
                </div>
              </div>
              <div className="goal-content">
                <div style={{ fontSize:'0.9rem', fontWeight:600, lineHeight:1.6, color:'#e0e0e0', marginTop:8, fontStyle:'italic' }}>
                  &ldquo;{QUOTE.text}&rdquo;
                </div>
                <div style={{ fontSize:'0.72rem', color:'var(--text-3)', marginTop:10, fontWeight:700, letterSpacing:'1px', textTransform:'uppercase' }}>
                  — {QUOTE.author}
                </div>
              </div>
            </div>
          </div>

          {/* Food Log */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:32, marginBottom:14 }}>
            <div className="section-tag" style={{ margin:0 }}>📅 What I Ate</div>
            <input type="date" value={foodDate} onChange={e => setFoodDate(e.target.value)}
              style={{ padding:'8px 12px', fontSize:'0.8rem', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', background:'var(--surface)', cursor:'pointer', color:'var(--text-1)', fontWeight:600, fontFamily:'inherit', outline:'none', colorScheme:'dark' }} />
          </div>

          <div style={{ marginBottom:28 }}>
            {foodLoading ? (
              <div className="card" style={{ textAlign:'center', padding:24 }}>
                <div style={{ color:'var(--text-3)', fontSize:'0.85rem', fontWeight:600, letterSpacing:'1px', textTransform:'uppercase' }}>Loading meals...</div>
              </div>
            ) : foodLogs.length === 0 ? (
              <div className="card" style={{ textAlign:'center', padding:24, border:'1px dashed var(--border)' }}>
                <div style={{ color:'var(--text-3)', fontSize:'0.85rem', fontWeight:600, letterSpacing:'1px', textTransform:'uppercase' }}>No meals logged for this date</div>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {foodLogs.map((log, i) => {
                  const items = [log.foodItem1||log.fooditem1,log.foodItem2||log.fooditem2,log.foodItem3||log.fooditem3,log.foodItem4||log.fooditem4,log.foodItem5||log.fooditem5].filter(Boolean);
                  const src = log.source||log.Source||'';
                  const shopVal = log.shop||log.Shop||'';
                  const location = src === 'Homemade' ? 'Homemade' : (shopVal||src||'Unknown');
                  const mealType = log.mealType||log.mealtype||'Meal';
                  const notes = log.notes||log.Notes||'';
                  return (
                    <div key={i} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'16px 18px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ background:'var(--accent-dim)', color:'var(--accent)', padding:'4px 10px', borderRadius:6, fontSize:'0.72rem', fontWeight:800, letterSpacing:'1px', textTransform:'uppercase' }}>
                            {displayTime(log.time||'--:--')}
                          </div>
                          <div style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--text-1)' }}>{mealType}</div>
                        </div>
                        <div style={{ fontSize:'0.72rem', color:'var(--text-3)', fontWeight:600, letterSpacing:'0.5px' }}>📍 {location}</div>
                      </div>
                      <div style={{ fontSize:'0.88rem', color:'var(--text-2)', lineHeight:1.6 }}>{items.join(' · ')}</div>
                      {notes && <div style={{ marginTop:8, paddingTop:8, borderTop:'1px solid var(--border)', fontSize:'0.78rem', color:'var(--text-3)', fontStyle:'italic' }}>📝 {notes}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="section-tag">Quick Actions</div>
          {[
            { href:'/hard75/', icon:'💪', title:'75 Hard Challenge', desc:'Log today\'s tasks & habits' },
            { href:'/food/',   icon:'🍽️', title:'Food Eaten Log',    desc:'Track your meals & hunger' },
            { href:'/body/',   icon:'⚖️', title:'Body Metrics Log',  desc:'Track your weight · target 75kg' },
          ].map(a => (
            <Link href={a.href} key={a.href} className="action-link">
              <div className="action-card">
                <div className="action-icon">{a.icon}</div>
                <div>
                  <div className="action-title">{a.title}</div>
                  <div className="action-desc">{a.desc}</div>
                </div>
                <div className="action-arrow">›</div>
              </div>
            </Link>
          ))}

          <div className="section-tag">Today</div>
          <div className="card">
            <div style={{ fontSize:'0.65rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'1.5px', fontWeight:700, marginBottom:6 }}>Date</div>
            <div style={{ fontSize:'0.95rem', fontWeight:700, color:'var(--text-1)' }}>{formatDate(new Date())}</div>
          </div>

        </main>
        <footer>Built with discipline by Kiran Kumar</footer>
        <ToastContainer />
      </div>
    </AuthGuard>
  );
}
