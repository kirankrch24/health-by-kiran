'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import AuthGuard from '@/components/AuthGuard';
import ToastContainer from '@/components/Toast';
import { formatDate, getTodayISO, getDayNumber } from '@/lib/utils';
import { CHALLENGE_START_DATE, FOOD_APPS_SCRIPT_URL, BODY_APPS_SCRIPT_URL, QUOTE } from '@/lib/config';

interface FoodLog {
  date?: string; Date?: string; time?: string; Time?: string;
  mealType?: string; mealtype?: string; source?: string; Source?: string;
  shop?: string; Shop?: string; notes?: string; Notes?: string;
  foodItem1?: string; fooditem1?: string; foodItem2?: string; fooditem2?: string;
  foodItem3?: string; fooditem3?: string; foodItem4?: string; fooditem4?: string;
  foodItem5?: string; fooditem5?: string;
}

function useBodyMetrics() {
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');

  useEffect(() => {
    const w = localStorage.getItem('current_weight') || '';
    const h = localStorage.getItem('current_height') || '';
    setWeight(w); setHeight(h);

    if (BODY_APPS_SCRIPT_URL) {
      fetch(BODY_APPS_SCRIPT_URL)
        .then((r) => r.json())
        .then((data) => {
          if (data?.weight && data?.height) {
            localStorage.setItem('current_weight', data.weight);
            localStorage.setItem('current_height', data.height);
            setWeight(data.weight); setHeight(data.height);
          }
        })
        .catch(() => {});
    }
  }, []);

  const bmi = weight && height
    ? (parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1)
    : '--';

  const weightProgress = (() => {
    if (!weight) return 0;
    const curr = parseFloat(weight);
    const target = 75, start = 120;
    if (curr <= target) return 100;
    if (curr >= start) return 5;
    return Math.max(0, Math.min(100, ((start - curr) / (start - target)) * 100));
  })();

  return { weight, height, bmi, weightProgress };
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
      const filtered = all.filter((item) => {
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
      filtered.forEach((log) => {
        const key = `${log.time||''}-${log.mealType||log.mealtype||''}-${log.source||''}`;
        seen.set(key, log);
      });
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

        <section className="premium-welcome" style={{ position: 'relative' }}>
          <div id="dayBadge" style={{ position:'absolute',top:28,right:20,fontSize:'0.75rem',background:'rgba(255,255,255,0.15)',padding:'5px 12px',borderRadius:20,fontWeight:700,letterSpacing:'0.5px',border:'1px solid rgba(255,255,255,0.25)',textTransform:'uppercase' }}>
            Day {safeDayNum} of 75
          </div>
          <div className="welcome-text" style={{ fontSize:'0.95rem',fontWeight:500,letterSpacing:'1px',color:'rgba(255,255,255,0.7)' }}>Work Until it&apos;s Done,</div>
          <div className="welcome-name" style={{ marginBottom:0,letterSpacing:'1.5px',fontWeight:800,fontSize:'1.7rem' }}>
            Hey Kiran 👋,<br />Just Do It ✔️
          </div>
        </section>

        <main className="dashboard-content pt-1">
          <div className="section-tag" style={{ marginTop:16 }}>Core Target Goals</div>

          <div className="three-block-grid" style={{ marginTop:16, marginBottom:30 }}>
            {/* Weight Card */}
            <div className="premium-card weight-card">
              <div className="card-bg-glow" />
              <div className="goal-header">
                <div className="goal-icon-box">⚖️</div>
                <div>
                  <div className="goal-title-text">Weight Target</div>
                  <div className="goal-subtitle" style={{ fontWeight:700,color:'#ff7eb3',fontSize:'0.8rem',marginTop:4 }}>
                    {weightRemaining} KG REMAINING. NO EXCUSES.
                  </div>
                </div>
              </div>
              <div className="goal-content">
                <div className="weight-stats">
                  <div>
                    <div className="weight-current">{weight || '--'} <span style={{ fontSize:'0.8rem' }}>kg</span></div>
                    <div style={{ display:'inline-block',marginTop:6,padding:'4px 12px',borderRadius:20,background:'rgba(214,51,108,0.15)',fontSize:'0.75rem',fontWeight:700,color:'#ff7eb3',border:'1px solid rgba(255,126,179,0.3)' }}>
                      BMI {bmi}
                    </div>
                  </div>
                  <div className="weight-target">Goal: 75 kg</div>
                </div>
                <div className="w-progress-track">
                  <div className="w-progress-fill" style={{ width:`${weightProgress}%`, background:'linear-gradient(90deg,#ff758c,#ff7eb3)' }} />
                  <div className="w-percent-label">{Math.round(weightProgress)}%</div>
                </div>
              </div>
            </div>

            {/* 75 Hard Card */}
            <div className="premium-card challenge-progress-card">
              <div className="card-bg-glow" style={{ background:'radial-gradient(100% 100% at 50% 0%,rgba(93,66,255,0.25) 0%,transparent 100%)' }} />
              <div className="goal-header">
                <div className="goal-icon-box" style={{ background:'rgba(93,66,255,0.15)',color:'#b6adff' }}>💪</div>
                <div>
                  <div className="goal-title-text">75 Hard Challenge</div>
                  <div className="goal-subtitle" style={{ fontWeight:700,color:'#b6adff',fontSize:'0.8rem',marginTop:4 }}>
                    {remaining75} DAYS REMAINING. NO EXCUSES.
                  </div>
                </div>
              </div>
              <div className="goal-content">
                <div className="weight-stats">
                  <div className="weight-current" style={{ color:'#fff' }}>Day {safeDayNum}</div>
                  <div className="weight-target">Goal: 75 Days</div>
                </div>
                <div className="w-progress-track" style={{ background:'rgba(93,66,255,0.1)' }}>
                  <div className="w-progress-fill" style={{ width:`${pct75}%`, background:'linear-gradient(90deg,#5d42ff,#8e7aff)', boxShadow:'0 0 10px rgba(93,66,255,0.5)' }} />
                  <div className="w-percent-label">{pct75}%</div>
                </div>
              </div>
            </div>

            {/* Quote Card */}
            <div className="premium-card quote-card">
              <div className="card-bg-glow" style={{ background:'radial-gradient(100% 100% at 50% 0%,rgba(253,160,133,0.25) 0%,transparent 100%)' }} />
              <div className="goal-header">
                <div className="goal-icon-box" style={{ background:'rgba(253,160,133,0.15)',color:'#fc8966' }}>💡</div>
                <div>
                  <div className="goal-title-text">Daily Motivation</div>
                  <div className="goal-subtitle" style={{ fontWeight:700,color:'#fc8966',fontSize:'0.8rem',marginTop:4 }}>FEED YOUR MIND.</div>
                </div>
              </div>
              <div className="goal-content" style={{ display:'flex',flexDirection:'column',justifyContent:'center',height:'100%' }}>
                <div style={{ fontSize:'1.05rem',fontWeight:600,lineHeight:1.45,color:'#111',marginTop:14 }}>
                  &ldquo;{QUOTE.text}&rdquo;
                </div>
                <div style={{ fontSize:'0.85rem',color:'#888',marginTop:8,fontStyle:'italic',fontWeight:600 }}>
                  — {QUOTE.author}
                </div>
              </div>
            </div>
          </div>

          {/* Food Logs */}
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:30,marginBottom:16,background:'#fff',padding:'10px 16px',borderRadius:12,border:'1.5px solid #e8e8e8',boxShadow:'0 4px 12px rgba(0,0,0,0.02)' }}>
            <div className="section-tag" style={{ margin:0,fontSize:'0.95rem',display:'flex',alignItems:'center',gap:6 }}>📅 What I Ate</div>
            <input type="date" value={foodDate} onChange={(e) => setFoodDate(e.target.value)}
              style={{ width:'auto',padding:'6px 10px',fontSize:'0.85rem',border:'none',borderRadius:8,background:'#f4f4f6',cursor:'pointer',color:'#111',fontWeight:600,fontFamily:'inherit',outline:'none',WebkitAppearance:'none' }} />
          </div>

          <div style={{ marginBottom:24 }}>
            {foodLoading ? (
              <div className="card" style={{ padding:16 }}>
                <div className="action-desc" style={{ textAlign:'center',width:'100%',marginTop:0 }}>Loading your meals from Google Sheets...</div>
              </div>
            ) : foodLogs.length === 0 ? (
              <div className="card action-card" style={{ padding:16,justifyContent:'center',background:'#fff',border:'1.5px dashed #ccc' }}>
                <div className="action-desc" style={{ textAlign:'center',width:'100%',marginTop:0,color:'#888' }}>No meals found for this date.</div>
              </div>
            ) : (
              <div style={{ display:'flex',flexDirection:'column',gap:14,position:'relative',paddingLeft:18 }}>
                {foodLogs.map((log, i) => {
                  const items = [log.foodItem1||log.fooditem1,log.foodItem2||log.fooditem2,log.foodItem3||log.fooditem3,log.foodItem4||log.fooditem4,log.foodItem5||log.fooditem5].filter(Boolean);
                  const sourceVal = log.source || log.Source || '';
                  const shopVal = log.shop || log.Shop || '';
                  const location = sourceVal === 'Homemade' ? 'Homemade' : (shopVal || sourceVal || 'Unknown');
                  const mealType = log.mealType || log.mealtype || 'Meal';
                  const timeVal = log.time || '--:--';
                  const notes = log.notes || log.Notes || '';
                  return (
                    <div key={i} style={{ display:'flex',gap:12,alignItems:'flex-start' }}>
                      <div style={{ background:'rgba(0,0,0,0.05)',color:'#000',padding:'6px 12px',borderRadius:8,fontWeight:700,fontSize:'0.85rem',minWidth:65,textAlign:'center',border:'1px solid rgba(0,0,0,0.1)',flexShrink:0 }}>
                        {displayTime(timeVal)}
                      </div>
                      <div style={{ flex:1,background:'#fff',border:'1.5px solid #e8e8e8',borderRadius:12,padding:14,boxShadow:'0 4px 12px rgba(0,0,0,0.02)',position:'relative' }}>
                        <div style={{ position:'absolute',left:-18,top:16,width:8,height:8,borderRadius:'50%',background:'#000' }} />
                        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8 }}>
                          <div style={{ fontWeight:700,fontSize:'0.95rem',color:'#111' }}>{mealType}</div>
                          <div style={{ fontSize:'0.75rem',background:'rgba(46,125,50,0.1)',color:'#2e7d32',padding:'3px 8px',borderRadius:6,fontWeight:600 }}>📍 {location}</div>
                        </div>
                        <div style={{ fontSize:'0.9rem',color:'#333',lineHeight:1.5,fontWeight:500 }}>{items.join(', ')}</div>
                        {notes && <div style={{ marginTop:10,paddingTop:10,borderTop:'1px solid #f0f0f0',fontSize:'0.8rem',color:'#777',fontStyle:'italic' }}>📝 &ldquo;{notes}&rdquo;</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="section-tag">Quick Actions</div>
          {[
            { href:'/hard75/', icon:'💪', title:'75 Hard Challenge', desc:'Log today\'s tasks & habits' },
            { href:'/food/', icon:'🍽️', title:'Food Eaten Log', desc:'Track your meals & hunger' },
            { href:'/body/', icon:'⚖️', title:'Body Metrics Log', desc:'Track your weight & target 75kg' },
          ].map((a) => (
            <Link href={a.href} key={a.href} className="action-link">
              <div className="card action-card">
                <div className="action-icon">{a.icon}</div>
                <div>
                  <div className="action-title">{a.title}</div>
                  <div className="action-desc">{a.desc}</div>
                </div>
                <div className="action-arrow">›</div>
              </div>
            </Link>
          ))}

          <h2 className="section-tag" style={{ marginTop:30 }}>Today&apos;s Date</h2>
          <section className="card mb-4">
            <div className="action-desc">Current Date</div>
            <div style={{ fontSize:'1rem',fontWeight:600 }}>{formatDate(new Date())}</div>
          </section>
        </main>

        <footer>Built with discipline by Kiran Kumar</footer>
        <ToastContainer />
      </div>
    </AuthGuard>
  );
}
