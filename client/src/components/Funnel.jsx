import {useEffect,useState} from 'react';
import {motion,AnimatePresence} from 'framer-motion';
import {QUESTIONS} from '../data.js';
import {saveLead} from '../lib/leads.js';

const EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const slide={initial:d=>({x:48*d,opacity:0}),animate:{x:0,opacity:1},exit:d=>({x:-48*d,opacity:0})};

export default function Funnel({onClose}){
  const n=QUESTIONS.length;
  const [i,setI]=useState(0),[dir,setDir]=useState(1),[ans,setAns]=useState({});
  const [c,setC]=useState({name:'',company:'',email:'',phone:''}),[err,setErr]=useState({}),[busy,setBusy]=useState(false),[fail,setFail]=useState('');
  const q=QUESTIONS[i],done=i>n,sel=q?ans[q.id]:null;
  const go=d=>{setDir(d);setI(x=>x+d)};
  const pick=o=>{
    if(q.type==='single'){setAns(a=>({...a,[q.id]:o}));setTimeout(()=>go(1),280);return}
    setAns(a=>{const cur=a[q.id]||[],has=cur.includes(o);
      if(!has&&q.max&&cur.length>=q.max)return a;
      return{...a,[q.id]:has?cur.filter(x=>x!==o):[...cur,o]}});
  };
  useEffect(()=>{
    document.body.style.overflow='hidden';
    const k=e=>{
      if(e.key==='Escape')onClose();
      else if(q&&/^[1-9]$/.test(e.key)&&q.options[e.key-1])pick(q.options[e.key-1]);
      else if(e.key==='Enter'&&q?.type==='multi'&&sel?.length)go(1);
    };
    window.addEventListener('keydown',k);
    return()=>{document.body.style.overflow='';window.removeEventListener('keydown',k)};
  });
  const submit=async e=>{
    e.preventDefault();const x={};
    if(!c.name.trim())x.name='Required';if(!c.company.trim())x.company='Required';
    if(!EMAIL.test(c.email.trim()))x.email='Enter a valid email';
    setErr(x);if(Object.keys(x).length)return;
    setBusy(true);setFail('');
    try{await saveLead({answers:ans,contact:c});setDir(1);setI(n+1)}catch{setFail('Something went wrong. Please try again.')}
    setBusy(false);
  };
  const set=k=>e=>{setC(v=>({...v,[k]:e.target.value}));setErr(v=>({...v,[k]:''}))};

  return(
    <motion.div className="funnel" role="dialog" aria-modal="true" aria-label="Book a free review"
      initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.25}}>
      <div className="f-top">
        {i>0&&!done?<button className="icon-btn" onClick={()=>go(-1)} aria-label="Back">←</button>:<span className="f-sp"/>}
        <div className="f-bar"><motion.i animate={{width:`${done?100:(i/(n+1))*100}%`}} transition={{duration:.4}}/></div>
        <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
      </div>
      <div className="f-body"><div className="f-card">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={i} custom={dir} variants={slide} initial="initial" animate="animate" exit="exit" transition={{duration:.28,ease:'easeOut'}}>
            {q&&<>
              <span className="eyebrow">Question {i+1} of {n}</span>
              <h2>{q.title}</h2>{q.hint&&<p className="f-hint">{q.hint}</p>}
              <div className="opts">
                {q.options.map((o,k)=>{const on=q.type==='single'?sel===o:sel?.includes(o);
                  return<motion.button key={o} whileTap={{scale:.98}} className={`opt${on?' sel':''}`} onClick={()=>pick(o)}>
                    <kbd>{k+1}</kbd><span>{o}</span>{on&&<b>✓</b>}</motion.button>})}
              </div>
              {q.type==='multi'&&<div className="f-foot"><span/><button className="btn btn-primary" disabled={!sel?.length} onClick={()=>go(1)}>Continue →</button></div>}
            </>}
            {i===n&&<form onSubmit={submit} noValidate>
              <span className="eyebrow">Last step</span><h2>Where should we send your review?</h2>
              <div className="f-fields">
                {[['name','Name','name'],['company','Company','organization'],['email','Work email','email'],['phone','Phone (optional)','tel']].map(([k,l,a])=>
                  <div className="field" key={k}><label htmlFor={`f-${k}`}>{l}</label>
                    <input id={`f-${k}`} value={c[k]} onChange={set(k)} autoComplete={a} type={k==='email'?'email':'text'}/>
                    {err[k]&&<span className="err">{err[k]}</span>}</div>)}
              </div>
              {fail&&<p className="err">{fail}</p>}
              <button className="btn btn-primary btn-lg" disabled={busy}>{busy?'Sending…':'Book my free review'}</button>
            </form>}
            {done&&<div className="f-done">
              <svg width="72" height="72" viewBox="0 0 72 72" fill="none"><motion.circle cx="36" cy="36" r="33" stroke="#fff" strokeWidth="3" initial={{pathLength:0}} animate={{pathLength:1}} transition={{duration:.6}}/>
                <motion.path d="M22 37l10 10 18-21" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" initial={{pathLength:0}} animate={{pathLength:1}} transition={{duration:.4,delay:.5}}/></svg>
              <h2>Request received</h2><p>Thanks, {c.name.split(' ')[0]}.</p>
              <ol className="next">{['We review your answers','We email you a time','30-minute call. One bottleneck.'].map((t,k)=><li key={t}><span>{k+1}</span>{t}</li>)}</ol>
              <button className="btn btn-primary btn-lg" onClick={onClose}>Done</button>
            </div>}
          </motion.div>
        </AnimatePresence>
      </div></div>
    </motion.div>
  );
}
