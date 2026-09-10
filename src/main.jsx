import React, {useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Check, ChevronLeft, ChevronRight, Cloud, CloudOff, Copy, Dumbbell, Flame, Home, ListChecks, RotateCcw, Shield, Target, Trophy} from 'lucide-react';
import './styles.css';

const DAYS = {
  mon: {short:'Pzt', title:'Bacak + Çekiş', subtitle:'Taşıma gücü', exercises:[['Squat','3 × 8–12'],['Bulgarian split squat','3 × 8 / bacak'],['Band row','4 × 10–15'],['Push-up','3 set · tükenişten 2–3 önce'],['Romanian deadlift','3 × 10–12'],['Dead hang','3 set'],['Farmer carry','4 × hedef süre'],['Step-up','3 × 60 sn'],['Bear-hug carry','3 × 30–45 sn']]},
  wed: {short:'Çar', title:'Üst Gövde + Motor', subtitle:'Armor engine', exercises:[['Push-up / incline','4 × 8–15'],['Band row','4 × 12'],['Overhead press','3 × 8–12'],['Assisted pull-up / negative','3–4 set'],['Split squat','3 × 10'],['Band face pull','3 × 15–20'],['Armor circuit','Haftanın tur hedefi']]},
  fri: {short:'Cum', title:'Grappling Gövdesi', subtitle:'Clinch ve denge', exercises:[['Goblet squat','4 × 8–12'],['Reverse lunge','3 × 8 / bacak'],['One-arm band row','4 × 10'],['Push-up','3 × 10–15'],['Band pulldown','3 × 12–15'],['Clinch conditioning','2 dk × 3 tur']]}
};
const phases=[
  {weeks:[1,2],name:'GERİ DÖNÜŞ',load:'5–8 kg',carry:'30 sn',circuit:'2 tur',note:'Biraz daha yapabilirdim hissiyle bitir.'},
  {weeks:[3,4],name:'TEMEL YÜK',load:'8–10 kg',carry:'45–60 sn',circuit:'3 tur',note:'Step-up toplamı 5–8 dakikaya ulaşsın.'},
  {weeks:[5,6],name:'KUVVET + CARRY',load:'10–12 kg',carry:'45–60 sn',circuit:'3–4 tur',note:'Carry, march ve step-up yüklü. Koşu yok.'},
  {weeks:[7,8],name:'ARMOR ENGINE',load:'12–15 kg',carry:'60 sn',circuit:'4 tur',note:'Bir gün 10 dakikalık armor walk ekle.'},
  {weeks:[9,10],name:'FIGHT ENGINE',load:'12–15 kg',carry:'30 sn devre',circuit:'5 tur',note:'Yükü değil, hareket yoğunluğunu artır.'},
  {weeks:[11,12],name:'FIGHT CONDITIONING',load:'≈15 kg',carry:'3 dk bloklar',circuit:'15–20 dk',note:'Kontrollü karma çalışma: step-up, carry, march, squat, footwork.'}
];
const tests=[['Bodyweight squat','30 kontrollü'],['Bulgarian split squat','12 + 12'],['Push-up','15–20 temiz'],['Dead hang','30–45 sn'],['Farmer carry','60 sn × 4'],['Step-up','Kesintisiz 5 dk'],['Plank','60 sn'],['Side plank','40 sn / taraf'],['Yüklü yürüyüş','10–15 kg · 15 dk'],['Armor circuit','5 tur'],['Yoğun efor','60 sn · form bozulmadan']];
const core=['Plank','Side plank','Dead bug','Pallof press','Suitcase carry','Boyun izometrik'];
const fallback={week:1,done:{},tests:{}};
const storage={get:k=>{try{return localStorage.getItem(k)}catch{return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch{}},remove:k=>{try{localStorage.removeItem(k)}catch{}}};
const load=()=>{try{const value=JSON.parse(storage.get('buhurt-state'));return value?.week&&value?.done&&value?.tests?value:fallback}catch{return fallback}};

function App(){
 const [state,setState]=useState(load); const [tab,setTab]=useState('home'); const [day,setDay]=useState('mon');
 const [syncCode,setSyncCode]=useState(()=>storage.get('buhurt-sync-code')||''); const [cloud,setCloud]=useState(syncCode?'loading':'local'); const [syncReady,setSyncReady]=useState(false);
 useEffect(()=>storage.set('buhurt-state',JSON.stringify(state)),[state]);
 useEffect(()=>{if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').then(r=>r.update()).catch(()=>{})},[]);
 useEffect(()=>{if(!syncCode){setSyncReady(false);setCloud('local');return}let live=true;setCloud('loading');fetch('/api/progress',{headers:{'x-sync-code':syncCode}}).then(async r=>{const j=await r.json();if(!r.ok)throw Error(j.error);return j}).then(j=>{if(!live)return;if(j.progress)setState(j.progress);setSyncReady(true);setCloud('synced')}).catch(()=>{if(live)setCloud('error')});return()=>{live=false}},[syncCode]);
 useEffect(()=>{if(!syncCode||!syncReady)return;const t=setTimeout(()=>{setCloud('loading');fetch('/api/progress',{method:'PUT',headers:{'content-type':'application/json','x-sync-code':syncCode},body:JSON.stringify({progress:state})}).then(r=>{if(!r.ok)throw Error();setCloud('synced')}).catch(()=>setCloud('error'))},500);return()=>clearTimeout(t)},[state,syncCode,syncReady]);
 const connectCloud=code=>{const clean=code.trim().toUpperCase();storage.set('buhurt-sync-code',clean);setSyncCode(clean)};
 const disconnectCloud=()=>{storage.remove('buhurt-sync-code');setSyncCode('')};
 const phase=phases.find(p=>p.weeks.includes(state.week));
 const key=(d,i)=>`w${state.week}-${d}-${i}`; const doneCount=Object.values(DAYS).reduce((n,d,di)=>n+d.exercises.filter((_,i)=>state.done[key(Object.keys(DAYS)[di],i)]).length,0);
 const total=Object.values(DAYS).reduce((n,d)=>n+d.exercises.length,0); const pct=Math.round(doneCount/total*100);
 const toggle=(k,section='done')=>setState(s=>({...s,[section]:{...s[section],[k]:!s[section][k]}}));
 const selectDay=d=>{setDay(d);setTab('workout')};
 return <div className="app">
   <header><div className="brand"><span className="brandmark"><Shield size={19}/></span><span>BUHURT ARC</span></div><button className="weekpill" onClick={()=>setTab('plan')}>HAFTA {state.week}/12</button></header>
   <main>
    {tab==='home'&&<>
      <section className="hero"><div><div className="eyebrow">{phase.name} · {phase.weeks[0]}–{phase.weeks[1]}. HAFTA</div><h1>Hazır ol.<br/><em>Ayakta kal.</em></h1><p>{phase.note}</p></div><div className="ring" style={{'--p':`${pct*3.6}deg`}}><div><strong>{pct}%</strong><span>bu hafta</span></div></div></section>
      <section className="stats"><div><span>YÜK HEDEFİ</span><strong>{phase.load}</strong></div><div><span>CARRY</span><strong>{phase.carry}</strong></div><div><span>DEVRE</span><strong>{phase.circuit}</strong></div></section>
      <div className="section-title"><h2>Bu haftanın savaşları</h2><span>{doneCount}/{total}</span></div>
      <section className="daylist">{Object.entries(DAYS).map(([k,d])=>{const n=d.exercises.filter((_,i)=>state.done[key(k,i)]).length; return <button className="daycard" onClick={()=>selectDay(k)} key={k}><span className="daybadge">{d.short}</span><span className="daytext"><strong>{d.title}</strong><small>{d.subtitle} · {n}/{d.exercises.length}</small></span><span className={`mini ${n===d.exercises.length?'complete':''}`}>{n===d.exercises.length?<Check size={16}/>:<ChevronRight size={18}/>}</span></button>})}</section>
      <section className="streak"><Flame size={23}/><div><strong>Ritmi koru</strong><span>Haftada 3 ana antrenman. Dinlenmek de programın bir parçası.</span></div></section>
    </>}
    {tab==='workout'&&<Workout day={day} setDay={setDay} week={state.week} state={state} toggle={toggle} setTab={setTab}/>} 
    {tab==='plan'&&<Plan state={state} setState={setState} phase={phase} syncCode={syncCode} cloud={cloud} connectCloud={connectCloud} disconnectCloud={disconnectCloud}/>} 
    {tab==='tests'&&<Tests state={state} toggle={toggle}/>} 
   </main>
   <nav>{[['home',Home,'Ana Sayfa'],['workout',Dumbbell,'Antrenman'],['plan',ListChecks,'12 Hafta'],['tests',Target,'Testler']].map(([id,I,label])=><button className={tab===id?'active':''} onClick={()=>setTab(id)} key={id}><I size={21}/><span>{label}</span></button>)}</nav>
 </div>
}

function Workout({day,setDay,week,state,toggle,setTab}){const d=DAYS[day]; const complete=d.exercises.every((_,i)=>state.done[`w${week}-${day}-${i}`]);return <>
 <div className="pagehead"><button onClick={()=>setTab('home')}><ChevronLeft/></button><div><span>HAFTA {week} · {d.short.toUpperCase()}</span><h2>{d.title}</h2></div></div>
 <div className="dayswitch">{Object.entries(DAYS).map(([k,v])=><button className={k===day?'active':''} onClick={()=>setDay(k)} key={k}>{v.short}</button>)}</div>
 <p className="hint">Her hareketi bitirdiğinde dokun. İlerlemen otomatik kaydedilir.</p>
 <section className="checklist">{d.exercises.map((e,i)=>{const k=`w${week}-${day}-${i}`,on=state.done[k];return <button className={on?'checked':''} onClick={()=>toggle(k)} key={e[0]}><span className="check">{on&&<Check size={18}/>}</span><span><strong>{e[0]}</strong><small>{e[1]}</small></span></button>})}</section>
 <section className="core"><div className="coretitle"><Shield size={19}/><div><strong>Finisher: Core + boyun</strong><span>Her antrenman sonunda 2 tane seç</span></div></div><div className="chips">{core.map(x=><span key={x}>{x}</span>)}</div></section>
 {complete&&<div className="victory"><Trophy/><strong>Savaş tamamlandı.</strong><span>Şimdi toparlanma zamanı.</span></div>}
 </>}

function Plan({state,setState,phase,syncCode,cloud,connectCloud,disconnectCloud}){const move=n=>setState(s=>({...s,week:Math.max(1,Math.min(12,s.week+n))}));const [entry,setEntry]=useState('');const generate=()=>{const a=crypto.getRandomValues(new Uint32Array(2));const c=`ARC-${a[0].toString(36)}-${a[1].toString(36)}`.toUpperCase();setEntry(c);connectCloud(c)};return <>
 <div className="pagehead solo"><div><span>PRE-GUILD ARC</span><h2>12 haftalık yol</h2></div></div>
 <section className="weekcontrol"><button onClick={()=>move(-1)} disabled={state.week===1}><ChevronLeft/></button><div><span>AKTİF HAFTA</span><strong>{state.week}</strong></div><button onClick={()=>move(1)} disabled={state.week===12}><ChevronRight/></button></section>
 <section className="phasecard"><span>{phase.name}</span><h3>{phase.weeks[0]}.–{phase.weeks[1]}. Hafta</h3><p>{phase.note}</p><div><b>{phase.load}</b><small>Yük</small><b>{phase.carry}</b><small>Carry</small><b>{phase.circuit}</b><small>Devre</small></div></section>
 <section className="cloudcard"><div className="cloudtitle">{cloud==='synced'?<Cloud/>:<CloudOff/>}<div><strong>Bulut senkronizasyonu</strong><span>{cloud==='synced'?'Aiven ile senkronize':cloud==='loading'?'Senkronize ediliyor…':cloud==='error'?'Database bağlantısı bekleniyor':'Yalnızca bu cihazda'}</span></div></div>{syncCode?<><div className="codebox"><code>{syncCode}</code><button onClick={()=>navigator.clipboard.writeText(syncCode)} aria-label="Kodu kopyala"><Copy size={16}/></button></div><p>Diğer tarayıcıda bu kodu girerek aynı ilerlemeyi aç.</p><button className="textbtn" onClick={disconnectCloud}>Bu cihazın bağlantısını kes</button></>:<><p>Yeni bir kod oluştur veya diğer cihazındaki kodu gir.</p><div className="connect"><input value={entry} onChange={e=>setEntry(e.target.value.toUpperCase())} placeholder="ARC-XXXX-XXXX"/><button onClick={()=>connectCloud(entry)} disabled={entry.length<8}>Bağlan</button></div><button className="textbtn" onClick={generate}>Yeni kod oluştur</button></>}</section>
 <div className="timeline">{phases.map(p=><button className={p.weeks.includes(state.week)?'active':''} onClick={()=>setState(s=>({...s,week:p.weeks[0]}))} key={p.name}><i/><span><small>HAFTA {p.weeks[0]}–{p.weeks[1]}</small><strong>{p.name}</strong><em>{p.load} · {p.circuit}</em></span></button>)}</div>
 <button className="reset" onClick={()=>confirm('Tüm ilerleme silinsin mi?')&&setState({week:1,done:{},tests:{}})}><RotateCcw size={16}/> Tüm ilerlemeyi sıfırla</button>
 </>}

function Tests({state,toggle}){const n=tests.filter(([x])=>state.tests[x]).length;return <>
 <div className="pagehead solo"><div><span>GUILD READINESS</span><h2>Arena testi</h2></div></div>
 <section className="testhero"><Target/><div><strong>{n}/{tests.length}</strong><span>hedef tamamlandı</span></div><p>Hepsi yeşil olduğunda guild'e çok sağlam bir giriş yapmaya hazırsın.</p></section>
 <section className="checklist tests">{tests.map(([name,target])=><button className={state.tests[name]?'checked':''} onClick={()=>toggle(name,'tests')} key={name}><span className="check">{state.tests[name]&&<Check size={18}/>}</span><span><strong>{name}</strong><small>{target}</small></span></button>)}</section>
 </>}

class ErrorBoundary extends React.Component{constructor(p){super(p);this.state={error:false}}static getDerivedStateFromError(){return{error:true}}render(){return this.state.error?<div className="booterror"><Shield/><h1>Uygulama açılamadı</h1><p>Eski tarayıcı verileri sorun çıkarmış olabilir.</p><button onClick={()=>{localStorage.clear();location.reload()}}>Verileri temizle ve yeniden aç</button></div>:this.props.children}}
createRoot(document.getElementById('root')).render(<ErrorBoundary><App/></ErrorBoundary>);
