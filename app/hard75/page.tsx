'use client';
import { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import AuthGuard from '@/components/AuthGuard';
import ToastContainer, { showToast } from '@/components/Toast';
import { getTodayISO, getDayNumber, loadSettings } from '@/lib/utils';
import { APPS_SCRIPT_URL } from '@/lib/config';

interface Task { id: string; emoji: string; name: string; desc: string; done: boolean; }

const INITIAL_TASKS: Task[] = [
  { id:'nofap',    emoji:'🧘', name:'NoFap',                  desc:'Mental clarity & discipline',     done:false },
  { id:'meals',    emoji:'🍽️', name:'Two Meals (Until 6 PM)', desc:'Intermittent fasting window',     done:false },
  { id:'exercise', emoji:'🏋️', name:'45 Minutes Exercise',    desc:'Push your body every day',        done:false },
  { id:'study',    emoji:'📡', name:'CCNA (60 mins Study)',   desc:'Network certifications & growth', done:false },
  { id:'reading',  emoji:'📚', name:'30 Min Reading',         desc:'Feed your mind daily',            done:false },
];

export default function Hard75Page() {
  const [tasks,        setTasks]        = useState<Task[]>(INITIAL_TASKS);
  const [date,         setDate]         = useState(getTodayISO());
  const [note,         setNote]         = useState('');
  const [submitting,   setSubmitting]   = useState(false);
  const [selfieB64,    setSelfieB64]    = useState('');
  const [selfiePreview,setSelfiePreview]= useState('');
  // startDate loaded from localStorage in useEffect — never hardcoded
  const [startDate,    setStartDate]    = useState('2026-04-13');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Always read from localStorage so Settings page changes take effect immediately
    const s = loadSettings();
    setStartDate(s.startDate);
  }, []);

  const dayNum    = getDayNumber(startDate, date);
  const doneCount = tasks.filter(t => t.done).length;
  const pct       = Math.round((doneCount / tasks.length) * 100);

  function toggleTask(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  function handleSelfie(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale  = img.width > 600 ? 600 / img.width : 1;
        canvas.width  = img.width  * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        const b64 = canvas.toDataURL('image/jpeg', 0.6);
        setSelfieB64(b64); setSelfiePreview(b64);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit() {
    setSubmitting(true);
    const data = {
      date, day: dayNum,
      nofap:    tasks.find(t=>t.id==='nofap')?.done    ? 'YES':'NO',
      meals:    tasks.find(t=>t.id==='meals')?.done    ? 'YES':'NO',
      exercise: tasks.find(t=>t.id==='exercise')?.done ? 'YES':'NO',
      study:    tasks.find(t=>t.id==='study')?.done    ? 'YES':'NO',
      reading:  tasks.find(t=>t.id==='reading')?.done  ? 'YES':'NO',
      note, selfie: selfieB64,
    };
    localStorage.setItem('last_log_' + date, JSON.stringify(data));
    const streakCount = Object.keys(localStorage).filter(k => k.startsWith('last_log_')).length;
    localStorage.setItem('streak_days', String(streakCount));
    try {
      await fetch(APPS_SCRIPT_URL, {
        method:'POST', mode:'no-cors',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(data),
      });
      showToast("🎉 Today's log saved to Sheets!", 'success');
    } catch {
      showToast("❌ Failed to submit. Saved locally.", 'error');
    }
    setTasks(INITIAL_TASKS); setNote('');
    setSelfieB64(''); setSelfiePreview('');
    setDate(getTodayISO());
    if (fileRef.current) fileRef.current.value = '';
    setSubmitting(false);
  }

  return (
    <AuthGuard>
      <div className="dashboard-body">
        <Header active="💪 75 Hard" />
        <main className="dashboard-content">

          <div className="challenge-intro">
            <h2>💪 75 Hard Challenge</h2>
            <p>Complete all 5 tasks every single day. No excuses. No compromises.</p>
            <div className="day-badge">Day {dayNum} of 75</div>
          </div>

          <section className="date-display">
            <div>
              <div className="date-label">Today&apos;s Date</div>
              <input
                type="date"
                className="date-value transparent-input"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
            <div style={{ fontSize:'1.4rem' }}>📅</div>
          </section>

          <div className="progress-wrap">
            <div className="progress-header">
              <span className="progress-label">Daily Progress</span>
              <span className="progress-count">{doneCount} / 5 tasks</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width:`${pct}%` }} />
            </div>
          </div>

          <div className="task-list">
            {tasks.map(task => (
              <div
                key={task.id}
                className={`task-item ${task.done ? 'done' : ''}`}
                onClick={() => toggleTask(task.id)}
              >
                <div className="task-checkbox">
                  <div className="task-checkbox-inner" />
                </div>
                <div style={{ flex:1 }}>
                  <div className="task-name">{task.emoji} {task.name}</div>
                  <div className="task-desc">{task.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Selfie */}
          <div
            onClick={() => fileRef.current?.click()}
            style={{ marginTop:20, padding:'18px 20px', background:'var(--surface)', border:'1px dashed rgba(0,0,0,0.18)', borderRadius:'var(--radius)', cursor:'pointer', display:'flex', alignItems:'center', gap:16 }}
          >
            <div style={{ width:46, height:46, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', flexShrink:0 }}>📸</div>
            <div>
              <div style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--text-1)' }}>Daily Progress Selfie</div>
              <div style={{ fontSize:'0.78rem', color:'var(--text-3)', marginTop:2 }}>Tap to take or upload your progress photo</div>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleSelfie} />
          {selfiePreview && (
            <div style={{ marginTop:12, textAlign:'center' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selfiePreview} alt="Preview" style={{ maxHeight:200, borderRadius:'var(--radius)', border:'1px solid var(--border)' }} />
            </div>
          )}

          <div className="form-group" style={{ marginTop:20 }}>
            <label htmlFor="note">Daily Notes</label>
            <textarea
              id="note"
              placeholder="How did today go? Any wins, struggles, or observations..."
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          <div className="submit-area">
            <button className="btn" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : "Submit Today's Log →"}
            </button>
          </div>
        </main>
        <footer>Built with discipline by Kiran Kumar</footer>
        <ToastContainer />
      </div>
    </AuthGuard>
  );
}
