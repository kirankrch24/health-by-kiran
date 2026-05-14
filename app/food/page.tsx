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

  useEffect(() => { setTime(new Date().toTimeString().substring(0,5)); }, []);

  function updateItem(i: number, val: string) {
    setItems(prev => { const n=[...prev]; n[i]=val; return n; });
  }

  function reset() {
    setDate(getTodayISO()); setTime(new Date().toTimeString().substring(0,5));
    setMealType('Breakfast'); setNumItems(1); setItems(['','','','','']);
    setSource('Homemade'); setShop(''); setPrice(''); setPortion('');
    setHunger('Medium'); setRequired('Yes'); setNotes('');
  }

  async function handleSubmit() {
    setSubmitting(true);
    const data = {
      logType:'FOOD_LOG', date, time, mealType, noOfItems:String(numItems),
      foodItem1:items[0], foodItem2:items[1], foodItem3:items[2], foodItem4:items[3], foodItem5:items[4],
      source, shop:showPrice?shop:'', price:showPrice?price:'',
      portionSize:portion, hunger, required, notes,
    };
    localStorage.setItem('food_log_' + Date.now(), JSON.stringify(data));
    try {
      await fetch(FOOD_APPS_SCRIPT_URL, { method:'POST', mode:'no-cors', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
      showToast('🍽️ Food log submitted!', 'success');
      reset();
    } catch {
      showToast('❌ Failed. Saved locally.', 'error');
    }
    setSubmitting(false);
  }

  return (
    <AuthGuard>
      <div className="dashboard-body">
        <Header active="🍽️ Food Eaten Log" />
        <main className="dashboard-content">

          <div className="challenge-intro">
            <h2>🍽️ Food Eaten Log</h2>
            <p>Track every meal — portions, sources, and hunger levels.</p>
          </div>

          <div className="card" style={{ display:'flex', flexDirection:'column', gap:0 }}>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:0 }}>
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
                <label>Meal Type</label>
                <select value={mealType} onChange={e=>setMealType(e.target.value)}>
                  {['Breakfast','Lunch','Dinner','Snacks'].map(m=><option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label>No. of Items</label>
                <select value={numItems} onChange={e=>setNumItems(Number(e.target.value))}>
                  {[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            <div style={{ height:16 }} />

            {items.slice(0, numItems).map((val, i) => (
              <div className="form-group" key={i}>
                <label>Food Item {i+1}</label>
                <input type="text" value={val} onChange={e=>updateItem(i,e.target.value)} placeholder={i===0?'What did you eat?':`Item ${i+1}`} />
              </div>
            ))}

            <div className="form-group">
              <label>Source</label>
              <select value={source} onChange={e=>setSource(e.target.value)}>
                {['Homemade','Grocery','Takeaway','Restaurant'].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>

            {showPrice && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label>Shop / Restaurant</label>
                  <input type="text" value={shop} onChange={e=>setShop(e.target.value)} placeholder="Name" />
                </div>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label>Price (£)</label>
                  <input type="number" inputMode="decimal" step={0.1} value={price} onChange={e=>setPrice(e.target.value)} placeholder="0.00" />
                </div>
              </div>
            )}

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginTop: showPrice ? 16 : 0 }}>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label>Portion (grams)</label>
                <input type="number" inputMode="numeric" value={portion} onChange={e=>setPortion(e.target.value)} placeholder="e.g. 200" />
              </div>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label>Hunger Level</label>
                <select value={hunger} onChange={e=>setHunger(e.target.value)}>
                  {['Low','Medium','High','Very'].map(h=><option key={h}>{h}</option>)}
                </select>
              </div>
            </div>

            <div style={{ height:16 }} />

            <div className="form-group">
              <label>Was it Required?</label>
              <select value={required} onChange={e=>setRequired(e.target.value)}>
                <option>Yes</option><option>No</option>
              </select>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Any thoughts on improving this meal?" />
            </div>

            <div className="submit-area" style={{ marginTop:8, paddingBottom:0 }}>
              <button className="btn" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Food Log →'}
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
