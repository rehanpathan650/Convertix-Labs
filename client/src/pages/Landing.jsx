import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import {motion,AnimatePresence} from 'framer-motion';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import Funnel from '../components/Funnel.jsx';
import useRevealAnimations from '../hooks/useRevealAnimations.js';
import {NAV,FLOW,MARQUEE,INDUSTRIES,SOLUTIONS,STEPS,FAQS} from '../data.js';
import { TrendingUp, Truck, ShieldCheck, ArrowUpRight, ArrowRight, Target, Activity } from "lucide-react";
gsap.registerPlugin(ScrollTrigger);

const up=(d=0)=>({initial:{opacity:0,y:24},animate:{opacity:1,y:0},transition:{duration:.7,delay:d,ease:[.22,1,.36,1]}});
const Book=({onBook,className='btn btn-primary btn-lg',children='Book a Free Review'})=><button className={className} onClick={onBook}>{children}</button>;

const Nav=({onBook})=>(
  <nav className="nav"><div className="navbar wrap">
    <a href="#top" className="brand"><span className="brand-mark"/>CONVERTIX <span className="grad-text">LABS</span></a>
    <ul className="navlinks">{NAV.map(([h,l])=><li key={h}><a href={h}>{l}</a></li>)}</ul>
    <div className="nav-right"><Link to="/login" className="login-link">Log in</Link><Book onBook={onBook} className="btn btn-primary btn-sm"/></div>
  </div></nav>);

function Hero({onBook}){
  const [a,setA]=useState(0);
  useEffect(()=>{const t=setInterval(()=>setA(x=>(x+1)%FLOW.length),1700);return()=>clearInterval(t)},[]);
  return(
  <header className="hero" id="top"><div className="hero-bg"/>
    <div className="wrap hero-grid"><div className="hero-copy">
      <motion.div className="badge" {...up(0)}><span className="dot"/>Free 30-minute review</motion.div>
      <motion.h1 {...up(.1)}>Every lead answered.<br/><span className="grad-text">Every job tracked.</span></motion.h1>
      <motion.p className="lead" {...up(.2)}>Lead capture and workflow automation for excavating contractors and machine shops.</motion.p>
      <motion.div className="hero-cta" {...up(.3)}><Book onBook={onBook}/><a href="#process" className="btn btn-ghost btn-lg">How it works</a></motion.div>
    </div>
    <motion.aside className="flow-card" {...up(.4)} aria-label="Lead pipeline">
      <div className="flow-head"><span className="flow-dot"/>Lead pipeline<span className="flow-pill">Automated</span></div>
      <ol className="flow-list">{FLOW.map(([t,s],i)=><li key={t} className={i===a?'active':''}><span className="flow-num">{i+1}</span><div><b>{t}</b><span>{s}</span></div></li>)}</ol>
    </motion.aside></div>
  </header>);
}

function Marquee(){
  const r=useRef(null);
  useLayoutEffect(()=>{
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const t=gsap.to(r.current,{xPercent:-50,duration:32,ease:'none',repeat:-1});return()=>t.kill();
  },[]);
  const items=[...MARQUEE,...MARQUEE];
  return<div className="marquee" aria-hidden="true"><div className="track" ref={r}>{items.map((m,i)=><span key={i}>{m}<i/></span>)}</div></div>;
}

const Head=({eyebrow,title})=><div className="section-head reveal"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>;

const Industries=({onBook})=>(
  <section className="section" id="industries"><div className="wrap">
    <Head eyebrow="Industries" title="Built for two trades."/>
    <div className="grid-2">{INDUSTRIES.map(([t,s,p])=>
      <motion.article className="card card-lg reveal" key={t} whileHover={{y:-4}}>
        <h3>{t}</h3><p>{s}</p>
        <ul className="checks">{p.map(x=><li key={x}><span className="check">✓</span>{x}</li>)}</ul>
        <button className="learn" onClick={onBook}>Book a Free Review →</button>
      </motion.article>)}</div>
  </div></section>);

const Solutions=()=>(
  <section className="section section-alt" id="solutions"><div className="wrap">
    <Head eyebrow="Solutions" title="What we build."/>
    <div className="svc-grid">{SOLUTIONS.map(([t,s],i)=>
      <motion.div className="svc-item reveal" key={t} whileHover={{y:-4}}><span className="svc-n">0{i+1}</span><h4>{t}</h4><p>{s}</p></motion.div>)}</div>
  </div></section>);

function Process(){
  const r=useRef(null),l=useRef(null);
  useLayoutEffect(()=>{
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){gsap.set(l.current,{scaleY:1});return}
    const c=gsap.context(()=>gsap.fromTo(l.current,{scaleY:0},{scaleY:1,ease:'none',scrollTrigger:{trigger:r.current,start:'top 65%',end:'bottom 65%',scrub:true}}),r);
    return()=>c.revert();
  },[]);
  return(
  <section className="section" id="process"><div className="wrap">
    <Head eyebrow="Process" title="Four steps. Weeks, not quarters."/>
    <ol className="steps" ref={r}><div className="steps-line"><i ref={l}/></div>
      {STEPS.map(([t,s],i)=><li className="reveal" key={t}><span>0{i+1}</span><div><h3>{t}</h3><p>{s}</p></div></li>)}</ol>
  </div></section>);
}

// const Case=()=>(
  
// <section className="band">
//   <div className="wrap band-inner">
//     <div className="reveal case-study">
//       <div className="case-study-top">
//         <span className="eyebrow">Case study / Field operations</span>
//         <ArrowUpRight size={16} className="case-study-corner" />
//       </div>

//       <h3>From spreadsheet chaos to real-time control.</h3>

//       <p className="case-study-sub">
//         One dashboard for job costs, production progress, and operational performance.
//       </p>

//       <div className="case-study-features">
//         <div className="case-study-row">
//           <TrendingUp size={20} className="cs-icon" />
//           <div className="cs-text">
//             <strong>Job cost tracking</strong>
//             <p>Estimated vs. actual spending</p>
//           </div>
//           <TrendingUp size={16} className="cs-trail" />
//         </div>

//         <div className="case-study-row">
//           <Truck size={20} className="cs-icon" />
//           <div className="cs-text">
//             <strong>Production visibility</strong>
//             <p>Progress, workloads, and bottlenecks</p>
//           </div>
//           <Activity size={16} className="cs-trail" />
//         </div>

//         <div className="case-study-row">
//           <ShieldCheck size={20} className="cs-icon" />
//           <div className="cs-text">
//             <strong>Margin protection</strong>
//             <p>Identify cost overruns early</p>
//           </div>
//           <Target size={16} className="cs-trail" />
//         </div>
//       </div>

//       <h4>Less guesswork. More control. Better margins.</h4>

//       <a href="#case-study" className="case-study-link">
//         Explore the Case Study <ArrowRight size={16} />
//       </a>
//     </div>
//   </div>
// </section>
// );

const S = {
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  eyebrow: { fontSize: 12, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9aa0ad' },
  heading: { margin: '0 0 20px', lineHeight: 1.15, letterSpacing: '-0.01em' },
  sub: { color: '#8b93a7', fontSize: 17, lineHeight: 1.6, margin: '0 0 48px' },
  row: { display: 'flex', alignItems: 'center', gap: 20, padding: '32px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' },
  rowLast: { borderBottom: '1px solid rgba(255,255,255,0.1)' },
  text: { flex: 1 },
  title: { display: 'block', fontSize: 19, fontWeight: 600, color: '#fff', marginBottom: 8, lineHeight: 1.3 },
  desc: { margin: 0, fontSize: 15, lineHeight: 1.5, color: '#8b93a7' },
  tagline: { fontSize: 19, fontWeight: 700, color: '#fff', lineHeight: 1.4, margin: '48px 0 28px' },
  link: { display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 17, fontWeight: 600, color: '#fff', textDecoration: 'none' },
};

const FEATURES = [
  [TrendingUp, 'Job cost tracking', 'Estimated vs. actual spending', TrendingUp],
  [Truck, 'Production visibility', 'Progress, workloads, and bottlenecks', Activity],
  [ShieldCheck, 'Margin protection', 'Identify cost overruns early', Target],
];

const Case = () => (
  <section className="band" id="case-study" style={{ padding: '96px 0' }}>
    <div className="wrap band-inner">
      <div className="reveal" style={{ maxWidth: 760 }}>
        <div style={S.top}>
          <span style={S.eyebrow}>Case study / Field operations</span>
          <ArrowUpRight size={16} color="#9aa0ad" />
        </div>

        <h3 style={S.heading}>From spreadsheet chaos to real-time control.</h3>
        <p style={S.sub}>
          One dashboard for job costs, production progress, and operational performance.
        </p>

        <div>
          {FEATURES.map(([Icon, title, desc, Trail], i) => (
            <div key={title} style={{ ...S.row, ...(i === FEATURES.length - 1 ? S.rowLast : {}) }}>
              <Icon size={20} color="#fff" style={{ flexShrink: 0 }} />
              <div style={S.text}>
                <strong style={S.title}>{title}</strong>
                <p style={S.desc}>{desc}</p>
              </div>
              <Trail size={16} color="#9aa0ad" style={{ flexShrink: 0 }} />
            </div>
          ))}
        </div>

        <h4 style={S.tagline}>Less guesswork. More control. Better margins.</h4>

      </div>
    </div>
  </section>
);

const Faq=()=>(
  <section className="section section-alt" id="faq"><div className="wrap">
    <Head eyebrow="FAQ" title="Straight answers."/>
    <div className="faq">{FAQS.map(([q,a])=><details className="reveal" key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
  </div></section>);

const Cta=({onBook})=>(
  <section className="section cta-block"><div className="wrap reveal"><h2>Find your bottleneck.</h2><p>6 quick questions. 2 minutes.</p><Book onBook={onBook}/></div></section>);

const Footer=()=>(
  <footer><div className="wrap foot-min"><span className="brand"><span className="brand-mark"/>CONVERTIX <span className="grad-text">LABS</span></span><span>© {new Date().getFullYear()} Convertix Labs</span></div></footer>);

export default function Landing(){
  const root=useRef(null),[open,setOpen]=useState(false),book=()=>setOpen(true);
  useRevealAnimations(root);
  return(<div ref={root}>
    <Nav onBook={book}/>
    <main><Hero onBook={book}/><Marquee/><Industries onBook={book}/><Solutions/><Process/><Case/><Faq/><Cta onBook={book}/></main>
    <Footer/>
    <AnimatePresence>{open&&<Funnel onClose={()=>setOpen(false)}/>}</AnimatePresence>
  </div>);
}
