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

  useEffect(() => {
    const now = new Date();
    setTime(now.toTimeString().substring(0, 5));
  }, []);

  async function handleSubmit() {
    if (!weight || !height) {
      showToast('❌ Please enter both weight and height.', 'error');
      return;
    }
    setSubmitting(true);
    const data = { logType: 'BODY_METRICS', date, time, weight, height };
    localStorage.setItem('current_weight', weight);
    localStorage.setItem('current_height', height);
    localStorage.setItem('body_log_' + Date.now(), JSON.stringify(data));

    try {
      await fetch(BODY_APPS_SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      showToast('⚖️ Body metrics successfully saved to Sheets.', 'success');
    } catch {
      showToast('❌ Failed to push. Saved locally as backup.', 'error');
    }

    const now = new Date();
    setDate(getTodayISO());
    setTime(now.toTimeString().substring(0, 5));
    setWeight('');
    setSubmitting(false);
  }

  const bmi = weight && height
    ? (parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1)
    : null;

  return (
    <AuthGuard>
      <div className="dashboard-body">
        <Header active="⚖️ Body Metrics Log" />
        <main className="dashboard-content pt-1">
          <div className="challenge-intro" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 6 }}>⚖️ Body Metrics Log</h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
              Track your weight and height to monitor your BMI and progress towards your 75kg target.
            </p>
          </div>

          <div className="card" style={{ border: '1.5px solid #e8e8e8' }}>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Weight (Kgs)</label>
              <input type="number" inputMode="decimal" step={0.1} value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 80.5" />
            </div>
            <div className="form-group">
              <label>Height (cm)</label>
              <input type="number" inputMode="numeric" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g. 175" />
            </div>

            {bmi && (
              <div style={{ background: '#f3fcf6', border: '1px solid #43e97b', borderRadius: 10, padding: '12px 16px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1b5e20' }}>Calculated BMI</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: parseFloat(bmi) >= 18.5 && parseFloat(bmi) <= 24.9 ? '#2e7d32' : '#c62828' }}>
                  {bmi}
                </div>
              </div>
            )}

            <div className="submit-area" style={{ marginTop: 20, paddingBottom: 0 }}>
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
