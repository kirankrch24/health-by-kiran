'use client';
import { useState, useRef } from 'react';
import Header from '@/components/Header';
import AuthGuard from '@/components/AuthGuard';
import ToastContainer, { showToast } from '@/components/Toast';
import { getTodayISO, getDayNumber } from '@/lib/utils';
import { APPS_SCRIPT_URL, CHALLENGE_START_DATE } from '@/lib/config';

interface Task { id: string; name: string; desc: string; done: boolean; }

const INITIAL_TASKS: Task[] = [
  { id: 'nofap',    name: '🧘 NoFap',                 desc: 'Mental clarity & discipline',        done: false },
  { id: 'meals',    name: '🍽️ Two Meals (Until 6 PM)', desc: 'Intermittent fasting window',        done: false },
  { id: 'exercise', name: '🏋️ 45 Minutes Exercise',    desc: 'Push your body every day',           done: false },
  { id: 'study',    name: '📡 CCNA (60 mins Study)',   desc: 'Network certifications & growth',    done: false },
  { id: 'reading',  name: '📚 30 Min Self-Help Reading',desc: 'Feed your mind daily',              done: false },
];

export default function Hard75Page() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [date, setDate] = useState(getTodayISO());
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selfieB64, setSelfieB64] = useState('');
  const [selfiePreview, setSelfiePreview] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const dayNum = getDayNumber(CHALLENGE_START_DATE, date);
  const doneCount = tasks.filter((t) => t.done).length;
  const pct = Math.round((doneCount / tasks.length) * 100);

  function toggleTask(id: string) {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  }

  function handleSelfie(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_W = 600;
        const scale = img.width > MAX_W ? MAX_W / img.width : 1;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        const b64 = canvas.toDataURL('image/jpeg', 0.6);
        setSelfieB64(b64);
        setSelfiePreview(b64);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit() {
    setSubmitting(true);
    const data = {
      date, day: dayNum,
      nofap:    tasks.find(t=>t.id==='nofap')?.done    ? 'YES' : 'NO',
      meals:    tasks.find(t=>t.id==='meals')?.done    ? 'YES' : 'NO',
      exercise: tasks.find(t=>t.id==='exercise')?.done ? 'YES' : 'NO',
      study:    tasks.find(t=>t.id==='study')?.done    ? 'YES' : 'NO',
      reading:  tasks.find(t=>t.id==='reading')?.done  ? 'YES' : 'NO',
      note, selfie: selfieB64,
    };
    localStorage.setItem('last_log_' + date, JSON.stringify(data));
    const allKeys = Object.keys(localStorage).filter((k) => k.startsWith('last_log_'));
    localStorage.setItem('streak_days', String(allKeys.length));

    try {
      await fetch(APPS_SCRIPT_URL, { method:'POST', mode:'no-cors', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
      showToast("🎉 Awesome! Today's log is saved to Sheets.", 'success');
    } catch {
      showToast("❌ Failed to submit. Saved locally as backup.", 'error');
    }
    setTasks(INITIAL_TASKS);
    setNote('');
    setSelfieB64('');
    setSelfiePreview('');
    setDate(getTodayISO());
    if (fileRef.current) fileRef.current.value = '';
    setSubmitting(false);
  }

  return (
    <AuthGuard>
      <div className="dashboard-body">
        <Header active="💪 75 Hard Challenge" />
        <main className="dashboard-content pt-1">

          <div className="challenge-intro">
            <h2>💪 75 Hard Challenge</h2>
            <p>Complete all 5 tasks every single day. No excuses. No compromises.</p>
            <div className="day-badge">Day {dayNum}</div>
          </div>

          <section className="date-display">
            <div>
              <div className="date-label">Today&apos;s Date</div>
              <input type="date" className="date-value transparent-input" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div style={{ fontSize:'1.4rem' }}>📅</div>
          </section>

          <div className="progress-wrap">
            <div className="progress-header">
              <span className="progress-label">Daily Progress</span>
              <span className="progress-count">{doneCount}/5 tasks</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width:`${pct}%` }} />
            </div>
          </div>

          <div className="task-list">
            {tasks.map((task) => (
              <div key={task.id} className={`task-item ${task.done ? 'done' : ''}`} onClick={() => toggleTask(task.id)}>
                <div className="task-checkbox">
                  <div className="task-checkbox-inner" />
                </div>
                <div>
                  <div className="task-name">{task.name}</div>
                  <div className="task-desc">{task.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Selfie */}
          <div onClick={() => fileRef.current?.click()}
            style={{ marginTop:20,padding:15,background:'rgba(93,66,255,0.1)',border:'1px dashed rgba(93,66,255,0.5)',borderRadius:12,cursor:'pointer',display:'flex',alignItems:'center',gap:15 }}>
            <div style={{ fontSize:'2rem' }}>📸</div>
            <div>
              <div style={{ fontWeight:600,fontSize:'1rem' }}>Take Daily Selfie</div>
              <div style={{ fontSize:'0.85rem',color:'rgba(0,0,0,0.5)' }}>Tap here to take or upload your progress picture</div>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleSelfie} />
          {selfiePreview && (
            <div style={{ marginTop:10,textAlign:'center' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selfiePreview} alt="Selfie preview" style={{ maxHeight:200,borderRadius:8,border:'2px solid #5d42ff' }} />
            </div>
          )}

          <div className="form-group" style={{ marginTop:20 }}>
            <label htmlFor="challengeNote">Notes (Daily Observations)</label>
            <textarea id="challengeNote" placeholder="How did it go today? Any difficulties, observations, or challenges faced?" value={note} onChange={(e) => setNote(e.target.value)} />
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
