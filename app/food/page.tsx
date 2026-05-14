'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import AuthGuard from '@/components/AuthGuard';
import ToastContainer, { showToast } from '@/components/Toast';
import { getTodayISO } from '@/lib/utils';
import { FOOD_APPS_SCRIPT_URL } from '@/lib/config';

export default function FoodPage() {
  const [date, setDate] = useState(getTodayISO());
  const [time, setTime] = useState('');
  const [mealType, setMealType] = useState('Breakfast');
  const [numItems, setNumItems] = useState(1);
  const [items, setItems] = useState(['','','','','']);
  const [source, setSource] = useState('Homemade');
  const [shop, setShop] = useState('');
  const [price, setPrice] = useState('');
  const [portion, setPortion] = useState('');
  const [hunger, setHunger] = useState('Medium');
  const [required, setRequired] = useState('Yes');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const showPrice = ['Grocery','Takeaway','Restaurant'].includes(source);

  useEffect(() => {
    const now = new Date();
    setTime(now.toTimeString().substring(0,5));
  }, []);

  function updateItem(i: number, val: string) {
    setItems((prev) => { const n=[...prev]; n[i]=val; return n; });
  }

  function reset() {
    setDate(getTodayISO());
    const now = new Date();
    setTime(now.toTimeString().substring(0,5));
    setMealType('Breakfast'); setNumItems(1);
    setItems(['','','','','']); setSource('Homemade');
    setShop(''); setPrice(''); setPortion('');
    setHunger('Medium'); setRequired('Yes'); setNotes('');
  }

  async function handleSubmit() {
    setSubmitting(true);
    const data = {
      logType:'FOOD_LOG', date, time, mealType,
      noOfItems: String(numItems),
      foodItem1: items[0], foodItem2: items[1], foodItem3: items[2],
      foodItem4: items[3], foodItem5: items[4],
      source, shop: showPrice ? shop : '', price: showPrice ? price : '',
      portionSize: portion, hunger, required, notes,
    };
    localStorage.setItem('food_log_' + Date.now(), JSON.stringify(data));
    try {
      await fetch(FOOD_APPS_SCRIPT_URL, { method:'POST', mode:'no-cors', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
      showToast('🍽️ Delicious! Food log submitted successfully.', 'success');
      reset();
    } catch {
      showToast('❌ Failed to push. Saved locally as backup.', 'error');
    }
    setSubmitting(false);
  }

  return (
    <AuthGuard>
      <div className="dashboard-body">
        <Header active="🍽️ Food Eaten Log" />
        <main className="dashboard-content pt-1">
          <div className="challenge-intro mb-5">
            <h2 style={{ fontSize:'1.2rem',fontWeight:700,marginBottom:6 }}>🍽️ Food Eaten Log</h2>
            <p style={{ fontSize:'0.85rem',color:'rgba(255,255,255,0.6)' }}>Track your meals, portions, and hunger levels.</p>
          </div>

          <section className="card" style={{ border:'1.5px solid #e8e8e8' }}>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input type="time" value={time} onChange={(e)=>setTime(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Meal Type</label>
              <select value={mealType} onChange={(e)=>setMealType(e.target.value)}>
                {['Breakfast','Lunch','Dinner','Snacks'].map((m)=><option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>No. of Food Items</label>
              <select value={numItems} onChange={(e)=>setNumItems(Number(e.target.value))}>
                {[1,2,3,4,5].map((n)=><option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            {items.slice(0, numItems).map((val, i) => (
              <div className="form-group" key={i}>
                <label>Food Item {i+1}</label>
                <input type="text" value={val} onChange={(e)=>updateItem(i,e.target.value)} placeholder={i===0?'What did you eat?':`Item ${i+1}`} />
              </div>
            ))}
            <div className="form-group">
              <label>Source</label>
              <select value={source} onChange={(e)=>setSource(e.target.value)}>
                {['Homemade','Grocery','Takeaway','Restaurant'].map((s)=><option key={s}>{s}</option>)}
              </select>
            </div>
            {showPrice && (
              <>
                <div className="form-group">
                  <label>Which Shop / Restaurant?</label>
                  <input type="text" value={shop} onChange={(e)=>setShop(e.target.value)} placeholder="Enter name" />
                </div>
                <div className="form-group">
                  <label>Price (£)</label>
                  <input type="number" inputMode="decimal" step={0.1} value={price} onChange={(e)=>setPrice(e.target.value)} placeholder="Enter amount" />
                </div>
              </>
            )}
            <div className="form-group">
              <label>Portion Size (grams)</label>
              <input type="number" inputMode="numeric" value={portion} onChange={(e)=>setPortion(e.target.value)} placeholder="e.g. 200" />
            </div>
            <div className="form-group">
              <label>Hunger</label>
              <select value={hunger} onChange={(e)=>setHunger(e.target.value)}>
                {['Low','Medium','High','Very'].map((h)=><option key={h}>{h}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Required</label>
              <select value={required} onChange={(e)=>setRequired(e.target.value)}>
                <option>Yes</option><option>No</option>
              </select>
            </div>
            <div className="form-group">
              <label>Notes (Improvement text)</label>
              <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Any thoughts on improving this meal?" />
            </div>
            <div className="submit-area" style={{ marginTop:20,paddingBottom:0 }}>
              <button className="btn" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Food Log →'}
              </button>
            </div>
          </section>
        </main>
        <footer>Built with discipline by Kiran Kumar</footer>
        <ToastContainer />
      </div>
    </AuthGuard>
  );
}
