'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import AuthGuard from '@/components/AuthGuard';
import ToastContainer from '@/components/Toast';
import { formatDate, getTodayISO, getDayNumber } from '@/lib/utils';
import { FOOD_APPS_SCRIPT_URL, BODY_APPS_SCRIPT_URL, QUOTE } from '@/lib/config';

interface FoodLog {
  date?: string; Date?: string; time?: string; mealType?: string; mealtype?: string;
  source?: string; Source?: string; shop?: string; Shop?: string;
  notes?: string; Notes?: string;
  foodItem1?: string; fooditem1?: string; foodItem2?: string; fooditem2?: string;
  foodItem3?: string; fooditem3?: string; foodItem4?: string; fooditem4?: string;
  foodItem5?: string; fooditem5?: string;
}

function getSettings() {
  if (typeof window === 'undefined') return { startDate: '2026-04-13', goalWeight: '75', startWeight: '120' };
  return {
    startDate:   localStorage.getItem('setting_start_date')   || '2026-04-13',
    goalWeight:  localStorage.getItem('setting_goal_weight')  || '75',
    startWeight: localStorage.getItem('setting_start_weight') || '120',
  };
}

export default function DashboardPage() {
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState('--');
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [foodLoading, setFoodLoading] = useState(true);
  const [foodDate, setFoodDate] = useState(getTodayISO());
  const [settings, setSettings] = useState(getSettings());

  useEffect(() => {
    const s = getSettings(); setSettings(s);
    const w = localStorage.getItem('current_weight') || '';
    const h = localStorage.getItem('current_height') || '';
    setWeight(w);
    if (w && h) setBmi((parseFloat(w) / Math.pow(parseFloat(h)/100, 2)).toFixed(1));
    if (BODY_APPS_SCRIPT_URL) {
      fetch(BODY_APPS_SCRIPT_URL).then(r=>r.json()).then(data=>{
        if (data?.weight && data?.height) {
          localStorage.setItem('current_weight', data.weight);
          localStorage.setItem('current_height', data.height);
          setWeight(data.weight);
          setBmi((parseFloat(data.weight)/Math.pow(parseFloat(data.height)/100,2)).toFixed(1));
        }
      }).catch(()=>{});
    }
  }, []);

  const dayNum     = getDayNumber(settings.startDate);
  const safeDayNum = Math.max(0, Math.min(75, dayNum));
  const remaining75 = 75 - safeDayNum;
  const pct75 = Math.round((safeDayNum / 75) * 100);

  const goalW  = parseFloat(settings.goalWeight)  || 75;
  const startW = parseFloat(settings.startWeight) || 120;
  const currW  = parseFloat(weight) || 0;
  const weightRemaining = currW ? Math.max(0, currW - goalW).toFixed(1) : '--';
  const weightProgress  = currW ? Math.max(0, Math.min(100, ((startW - currW)/(startW - goalW))*100)) : 0;

  const loadFood = useCallback(async (date: string) => {
    setFoodLoading(true);
    try {
      const resp = await fetch(FOOD_APPS_SCRIPT_URL);
      if (!resp.ok) { setFoodLogs([]); setFoodLoading(false); return; }
      const all: FoodLog[] = await resp.json();
      const filtered = all.filter(item => {
        const d = item.date || item.Date; if (!d) return false;
        if (typeof d === 'string') {
          if (d.startsWith(date)) return true;
          const p = new Date(d);
          if (!isNaN(p.getTime())) {
            return `${p.getFullYear()}-${String(p.getMonth()+1).padStart(2,'0')}-${String(p.getDate()).padStart(2,'0')}` === date;
          }
        }
        return false;
      });
      const seen = new Map<string, FoodLog>();
      filtered.forEach(log => seen.set(`${log.time||''}-${log.mealType||log.mealtype||''}`, log));
      setFoodLogs(Array.from(seen.values()).sort((a,b)=>(a.time||'').localeCompare(b.time||'')));
    } catch { setFoodLogs([]); }
    setFoodLoading(false);
  }, []);

  useEffect(() => { loadFood(foodDate); }, [foodDate, loadFood]);

  function displayTime(t: string) {
    if (!t || t.length<=5) return t||'--:--';
    const m = t.match(/(\d{2}:\d{2}):\d{2}/); if (m) return m[1];
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
          <div className="welcome-name">Hey Kiran 👋<br/>Just Do It ✔️</div>
          <div className="micro-stats-row">
            <div className="micro-stat"><div className="micro-stat-val">Day {safeDayNum}</div><div className="micro-stat-lbl">75 Hard</div></div>
            <div className="micro-stat"><div className="micro-stat-val">{weight||'--'} kg</div><div className="micro-stat-lbl">Weight</div></div>
            <div className="micro-stat"><div className="micro-stat-val">{bmi}</div><div className="micro-stat-lbl">BMI</div></div>
          </div>
        </section>

        <main className="dashboard-content" style={{ paddingTop:24 }}>

          {/* JDI + Ikigai strip */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:4 }}>
            <div className="jdi-banner">
              <div><div className="jdi-text">Just<br/>Do It.</div><div className="jdi-sub">No excuses</div></div>
              <div className="jdi-swoosh">✔️</div>
            </div>
            <div style={{ background:'#000', borderRadius:'var(--radius)', padding:'16px 18px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
              <div style={{ fontSize:'0.58rem', color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'2px', fontWeight:800, marginBottom:8 }}>🌸 Ikigai</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                {[['🔥','Passion'],['🎯','Purpose'],['⚔️','Mastery'],['♾️','Consistency']].map(([icon,label])=>(
                  <div key={label} style={{ background:'rgba(255,255,255,0.06)', borderRadius:8, padding:'8px 6px', textAlign:'center' }}>
                    <div style={{ fontSize:'1rem' }}>{icon}</div>
                    <div style={{ fontSize:'0.58rem', color:'rgba(255,255,255,0.6)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', marginTop:3 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

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
                  <div className="goal-subtitle" style={{ color:'#c07800' }}>{weightRemaining} kg to go</div>
                </div>
              </div>
              <div className="goal-content">
                <div className="weight-stats">
                  <div>
                    <div className="weight-current" style={{ color:'#c07800' }}>{weight||'--'}<span style={{ fontSize:'1rem' }}> kg</span></div>
                    <div className="bmi-badge">BMI {bmi}</div>
                  </div>
                  <div className="weight-target">Goal<br/>{goalW} kg</div>
                </div>
                <div className="w-progress-track">
                  <div className="w-progress-fill" style={{ width:`${weightProgress}%`, background:'linear-gradient(90deg,#f5a623,#ffb94a)' }} />
                </div>
                <div className="w-percent-label">{Math.round(weightProgress)}% complete</div>
              </div>
            </div>

            {/* 75 Hard */}
            <div className="premium-card challenge-progress-card">
              <div className="card-bg-glow" style={{ background:'#7b31d4' }} />
              <div className="goal-header">
                <div className="goal-icon-box" style={{ background:'rgba(123,49,212,0.1)', borderColor:'rgba(123,49,212,0.3)' }}>💪</div>
                <div>
                  <div className="goal-title-text">75 Hard</div>
                  <div className="goal-subtitle" style={{ color:'#7b31d4' }}>{remaining75} days remaining</div>
                </div>
              </div>
              <div className="goal-content">
                <div className="weight-stats">
                  <div className="weight-current" style={{ color:'#7b31d4' }}>Day {safeDayNum}<span style={{ fontSize:'1rem' }}>/75</span></div>
                  <div className="weight-target">Goal<br/>75 days</div>
                </div>
                <div className="w-progress-track">
                  <div className="w-progress-fill" style={{ width:`${pct75}%`, background:'linear-gradient(90deg,#7b31d4,#a855f7)' }} />
                </div>
                <div className="w-percent-label">{pct75}% complete</div>
              </div>
            </div>

            {/* Quote */}
            <div className="premium-card quote-card">
              <div className="card-bg-glow" style={{ background:'#0060c0' }} />
              <div className="goal-header">
                <div className="goal-icon-box" style={{ background:'rgba(0,96,192,0.08)', borderColor:'rgba(0,96,192,0.25)' }}>💡</div>
                <div>
                  <div className="goal-title-text">Daily Fuel</div>
                  <div className="goal-subtitle" style={{ color:'#0060c0' }}>Feed your mind</div>
                </div>
              </div>
              <div className="goal-content">
                <div style={{ fontSize:'0.85rem', fontWeight:600, lineHeight:1.65, color:'var(--text-2)', marginTop:8, fontStyle:'italic' }}>&ldquo;{QUOTE.text}&rdquo;</div>
                <div style={{ fontSize:'0.65rem', color:'var(--text-3)', marginTop:10, fontWeight:800, letterSpacing:'1px', textTransform:'uppercase' }}>— {QUOTE.author}</div>
              </div>
            </div>
          </div>

          {/* Philosophy Strip */}
          <div className="section-tag">Nike Philosophy</div>
          <div style={{ background:'#000', borderRadius:'var(--radius)', padding:'20px 22px', marginBottom:4 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, textAlign:'center' }}>
              {[['⚡','Act','Stop thinking. Start moving.'],['🧱','Build','One brick. Every day.'],['🔄','Repeat','No days off. Ever.']].map(([icon,title,sub])=>(
                <div key={title}>
                  <div style={{ fontSize:'1.4rem', marginBottom:6 }}>{icon}</div>
                  <div style={{ fontSize:'0.78rem', fontWeight:900, color:'#fff', textTransform:'uppercase', letterSpacing:'1px' }}>{title}</div>
                  <div style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.45)', marginTop:4, lineHeight:1.5 }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Food Log */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:28, marginBottom:12 }}>
            <div className="section-tag" style={{ margin:0 }}>📅 What I Ate</div>
            <input type="date" value={foodDate} onChange={e=>setFoodDate(e.target.value)}
              style={{ padding:'7px 12px', fontSize:'0.78rem', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', background:'var(--surface)', cursor:'pointer', color:'var(--text-1)', fontWeight:700, fontFamily:'inherit', outline:'none' }} />
          </div>

          <div style={{ marginBottom:28 }}>
            {foodLoading ? (
              <div className="card" style={{ textAlign:'center', padding:24 }}>
                <div style={{ color:'var(--text-3)', fontSize:'0.72rem', fontWeight:800, letterSpacing:'2px', textTransform:'uppercase' }}>Loading meals...</div>
              </div>
            ) : foodLogs.length === 0 ? (
              <div className="card" style={{ textAlign:'center', padding:24, border:'1.5px dashed var(--border)' }}>
                <div style={{ color:'var(--text-3)', fontSize:'0.72rem', fontWeight:800, letterSpacing:'1.5px', textTransform:'uppercase' }}>No meals logged for this date</div>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {foodLogs.map((log, i) => {
                  const its = [log.foodItem1||log.fooditem1,log.foodItem2||log.fooditem2,log.foodItem3||log.fooditem3,log.foodItem4||log.fooditem4,log.foodItem5||log.fooditem5].filter(Boolean);
                  const src = log.source||log.Source||'', shop = log.shop||log.Shop||'';
                  const loc = src==='Homemade'?'Homemade':(shop||src||'Unknown');
                  const mt  = log.mealType||log.mealtype||'Meal';
                  const notes = log.notes||log.Notes||'';
                  return (
                    <div key={i} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'14px 18px', boxShadow:'var(--shadow-sm)' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ background:'#000', color:'#fff', padding:'3px 10px', borderRadius:6, fontSize:'0.68rem', fontWeight:800, letterSpacing:'1px' }}>{displayTime(log.time||'--:--')}</div>
                          <div style={{ fontWeight:800, fontSize:'0.88rem', color:'var(--text-1)' }}>{mt}</div>
                        </div>
                        <div style={{ fontSize:'0.68rem', color:'var(--text-3)', fontWeight:700 }}>📍 {loc}</div>
                      </div>
                      <div style={{ fontSize:'0.86rem', color:'var(--text-2)', lineHeight:1.6 }}>{its.join(' · ')}</div>
                      {notes && <div style={{ marginTop:8, paddingTop:8, borderTop:'1px solid var(--border)', fontSize:'0.76rem', color:'var(--text-3)', fontStyle:'italic' }}>📝 {notes}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="section-tag">Quick Actions</div>
          {[
            { href:'/hard75/',   icon:'💪', title:'75 Hard Challenge',  desc:'Log today\'s tasks & habits' },
            { href:'/food/',     icon:'🍽️', title:'Food Eaten Log',     desc:'Track your meals & hunger' },
            { href:'/body/',     icon:'⚖️', title:'Body Metrics',        desc:'Track weight · target '+goalW+' kg' },
            { href:'/settings/', icon:'⚙️', title:'Settings',            desc:'Adjust goals & challenge date' },
          ].map(a => (
            <Link href={a.href} key={a.href} className="action-link">
              <div className="action-card">
                <div className="action-icon">{a.icon}</div>
                <div><div className="action-title">{a.title}</div><div className="action-desc">{a.desc}</div></div>
                <div className="action-arrow">›</div>
              </div>
            </Link>
          ))}

          <div className="section-tag">Today</div>
          <div className="card">
            <div style={{ fontSize:'0.62rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'1.5px', fontWeight:800, marginBottom:6 }}>Date</div>
            <div style={{ fontSize:'0.95rem', fontWeight:700, color:'var(--text-1)' }}>{formatDate(new Date())}</div>
          </div>

        </main>
        <footer>Built with discipline by Kiran Kumar</footer>
        <ToastContainer />
      </div>
    </AuthGuard>
  );
}
