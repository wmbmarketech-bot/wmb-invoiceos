import { useState, useMemo, useEffect, useRef, createContext, useContext } from "react";
import { supabase, mapInvoice, mapCompany, mapExpense, mapService, mapUser, mapSettings,
  saveInvoiceToDB, saveExpenseToDB, saveCompanyToDB, saveServiceToDB,
  saveUserToDB, saveSettingsToDB, deleteFromDB, uploadReceipt } from './supabase.js';

/* ═══════════════════════════════════════════════════
   THEMES
═══════════════════════════════════════════════════ */
const DARK = {
  pageBg:      "linear-gradient(135deg,#0d1b3e 0%,#1a2d5a 35%,#0e2244 65%,#0a1628 100%)",
  mesh1:       "radial-gradient(ellipse 80% 60% at 15% 10%,rgba(56,189,248,0.18) 0%,transparent 55%)",
  mesh2:       "radial-gradient(ellipse 60% 50% at 85% 85%,rgba(139,92,246,0.15) 0%,transparent 55%)",
  mesh3:       "radial-gradient(ellipse 50% 40% at 50% 50%,rgba(14,165,233,0.07) 0%,transparent 70%)",
  sidebar:     "rgba(10,20,50,0.55)",
  sideBar2:    "rgba(10,20,50,0.55)",
  sideBdr:     "rgba(255,255,255,0.1)",
  card:        "rgba(255,255,255,0.07)",
  cardHov:     "rgba(255,255,255,0.11)",
  cardBdr:     "rgba(255,255,255,0.12)",
  cardShadow:  "0 8px 32px rgba(0,0,0,0.25),inset 0 1px 0 rgba(255,255,255,0.1)",
  activeNav:   "linear-gradient(135deg,rgba(56,189,248,0.3),rgba(99,102,241,0.25))",
  activeNavBdr:"rgba(56,189,248,0.5)",
  input:       "rgba(255,255,255,0.08)",
  inputBdr:    "rgba(255,255,255,0.15)",
  accent:      "#38bdf8",
  accentSolid: "linear-gradient(135deg,#38bdf8,#0ea5e9)",
  accentGlow:  "rgba(56,189,248,0.35)",
  purple:      "#a78bfa",
  green:       "#34d399",
  red:         "#fb7185",
  amber:       "#fbbf24",
  pink:        "#f472b6",
  text:        "#e2eeff",
  textSub:     "#7ea4cc",
  textFaint:   "#6a90c0",
  modal:       "rgba(5,15,40,0.3)",
  scrollbar:   "rgba(255,255,255,0.1)",
  isDark:      true,
};

const LIGHT = {
  pageBg:      "linear-gradient(135deg,#dbeafe 0%,#ede9fe 35%,#fce7f3 65%,#e0f2fe 100%)",
  mesh1:       "radial-gradient(ellipse 80% 60% at 15% 10%,rgba(56,189,248,0.25) 0%,transparent 55%)",
  mesh2:       "radial-gradient(ellipse 60% 50% at 85% 85%,rgba(139,92,246,0.15) 0%,transparent 55%)",
  mesh3:       "radial-gradient(ellipse 50% 40% at 50% 50%,rgba(14,165,233,0.06) 0%,transparent 70%)",
  sidebar:     "rgba(255,255,255,0.55)",
  sideBar2:    "rgba(255,255,255,0.55)",
  sideBdr:     "rgba(255,255,255,0.8)",
  card:        "rgba(255,255,255,0.6)",
  cardHov:     "rgba(255,255,255,0.8)",
  cardBdr:     "rgba(255,255,255,0.9)",
  cardShadow:  "0 8px 32px rgba(100,120,180,0.12),inset 0 1px 0 rgba(255,255,255,0.9)",
  activeNav:   "linear-gradient(135deg,rgba(56,189,248,0.25),rgba(99,102,241,0.15))",
  activeNavBdr:"rgba(56,189,248,0.6)",
  input:       "rgba(255,255,255,0.7)",
  inputBdr:    "rgba(180,200,240,0.6)",
  accent:      "#0284c7",
  accentSolid: "linear-gradient(135deg,#0284c7,#0369a1)",
  accentGlow:  "rgba(2,132,199,0.25)",
  purple:      "#7c3aed",
  green:       "#059669",
  red:         "#e11d48",
  amber:       "#d97706",
  pink:        "#db2777",
  text:        "#0f172a",
  textSub:     "#475569",
  textFaint:   "#94a3b8",
  modal:       "rgba(200,220,255,0.15)",
  scrollbar:   "rgba(100,130,200,0.2)",
  isDark:      false,
};

const ThemeCtx = createContext(LIGHT);
const useT = () => useContext(ThemeCtx);
let T = LIGHT;
const FONT = "'Inter',sans-serif";
const FONT_SIZE_BASE = 15;
const MONO = "'JetBrains Mono',monospace";

/* ═══════════════════════════════════════════════════
   SEED DATA
═══════════════════════════════════════════════════ */
const SEED = {
  companies:[
    {id:"c1",legalName:"WMB Marketech LTD",tradeName:"HealthTech Cyprus Expo",logoUrl:"",website:"healthtechcyprusexpo.com",address:"Limassol, Cyprus",vat:"60021843M",email:"info@healthtechcyprusexpo.com",phone:"+35795604079",reg:"HE408385",color:"#38bdf8",bank:{name:"Bank of Cyprus",iban:"CY08002001950000357038391815",swift:"BCYPCY2N",holder:"WMB MARKETECH LTD"}},
    {id:"c2",legalName:"WMB Marketech LTD",tradeName:"Kartatek Solutions",logoUrl:"",website:"kartatek.com",address:"Limassol, Cyprus",vat:"60021843M",email:"info@kartatek.com",phone:"+35795604079",reg:"HE408385",color:"#a78bfa",bank:{name:"Bank of Cyprus",iban:"CY08002001950000357038391815",swift:"BCYPCY2N",holder:"WMB MARKETECH LTD"}},
  ],
  services:[
    {id:"sv1",name:"Exhibitor Package — Standard",price:2400,vat:true,companyId:"c1"},
    {id:"sv2",name:"Exhibitor Package — Premium",price:4800,vat:true,companyId:"c1"},
    {id:"sv3",name:"Sponsor Package",price:8500,vat:true,companyId:"c1"},
    {id:"sv4",name:"Attendee Ticket",price:120,vat:true,companyId:"c1"},
    {id:"sv5",name:"Networking Dinner",price:175,vat:true,companyId:"c1"},
    {id:"sv6",name:"Monthly Subscription",price:299,vat:true,companyId:"c2"},
    {id:"sv7",name:"Annual Subscription",price:2990,vat:true,companyId:"c2"},
    {id:"sv8",name:"Setup Fee",price:350,vat:true,companyId:"c2"},
  ],
  invoices:[
    {id:"INV-0001",companyId:"c1",client:{name:"Acme Corp Ltd",email:"billing@acme.com",vat:"CY98765432X",address:"Limassol, Cyprus"},clientType:"business",date:"2026-05-01",status:"Paid",paymentMethod:"IBAN transfer",source:"Manual",items:[{desc:"Exhibitor Package — Standard",qty:1,rate:2400,vat:true},{desc:"Networking Dinner",qty:2,rate:175,vat:true}]},
    {id:"INV-0002",companyId:"c2",client:{name:"Nova Tech Ltd",email:"accounts@novatech.io",vat:"CY11223344X",address:"Nicosia, Cyprus"},clientType:"business",date:"2026-05-10",status:"Sent",paymentMethod:"Stripe",source:"Kartatek",items:[{desc:"Annual Subscription",qty:1,rate:2990,vat:true}]},
    {id:"INV-0003",companyId:"c1",client:{name:"Andreas Papadopoulos",email:"andreas@gmail.com",vat:"",address:"Nicosia, Cyprus"},clientType:"individual",date:"2026-05-15",status:"Paid",paymentMethod:"JCC POS",source:"Lovable",items:[{desc:"Attendee Ticket",qty:2,rate:120,vat:true}]},
    {id:"INV-0004",companyId:"c1",client:{name:"Bloom Health Ltd",email:"cfo@bloomhealth.cy",vat:"CY55667788X",address:"Paphos, Cyprus"},clientType:"business",date:"2026-05-28",status:"Awaiting payment",paymentMethod:"IBAN transfer",source:"Manual",items:[{desc:"Sponsor Package",qty:1,rate:8500,vat:true}]},
  ],
  expenses:[
    {id:"EXP-0001",supplier:"Papantoniou Supplies",date:"2026-05-03",category:"Materials",net:340,vatIn:64.60,paymentMethod:"IBAN transfer",notes:"Raw materials",file:null},
    {id:"EXP-0002",supplier:"JCC Payment Systems",date:"2026-05-31",category:"Gateway fees",net:42.50,vatIn:0,paymentMethod:"IBAN transfer",notes:"April fees",file:null},
    {id:"EXP-0003",supplier:"Google Workspace",date:"2026-05-01",category:"Software",net:14,vatIn:0,paymentMethod:"Stripe",notes:"Monthly plan",file:null},
  ],
  users:[
    {id:"u1",name:"Admin",email:"admin@wmbmarketech.com",role:"admin",active:true},
    {id:"u2",name:"Maria Accountant",email:"accountant@wmbmarketech.com",role:"accountant",active:true},
  ],
  bankTransactions:[],
  settings:{invoicePrefix:"INV",nextSeq:5,vatRate:19,adminName:"Admin",adminEmail:"admin@wmbmarketech.com"},
};

/* ═══════════════════════════════════════════════════
   PERSISTENCE + UTILS
═══════════════════════════════════════════════════ */

const VAT_RATE  = 0.19;
const today     = () => new Date().toISOString().split("T")[0];
const fmt       = n => new Intl.NumberFormat("en-US",{style:"currency",currency:"EUR",minimumFractionDigits:2}).format(n||0);
const calcItem  = i => (i.qty||0)*(i.rate||0);
const calcNet   = it => it.reduce((s,i)=>s+calcItem(i),0);
const calcVat   = it => it.filter(i=>i.vat).reduce((s,i)=>s+calcItem(i)*VAT_RATE,0);
const calcTotal = it => calcNet(it)+calcVat(it);
const peekNext  = s => `${s.invoicePrefix}-${String(s.nextSeq).padStart(4,"0")}`;
const bumpNext  = s => [peekNext(s),{...s,nextSeq:s.nextSeq+1}];
const newExpId  = () => `EXP-${String(Date.now()).slice(-5)}`;

const STATUSES    = ["Paid","Awaiting payment","Sent","Draft","Cancelled"];
const PAY_METHODS = ["IBAN transfer","Stripe","JCC POS","Cash"];
const SOURCES     = ["Manual","Lovable","Kartatek"];
const EXP_CATS    = ["Materials","Software","Travel","Marketing","Gateway fees","Venue","Office","Other"];
const ROLES       = ["admin","accountant","editor"];

const STATUS_CFG = {
  "Paid":             {bg:"rgba(52,211,153,0.18)", text:"#34d399", bdr:"rgba(52,211,153,0.35)"},
  "Awaiting payment": {bg:"rgba(251,191,36,0.18)", text:"#fbbf24", bdr:"rgba(251,191,36,0.35)"},
  "Sent":             {bg:"rgba(56,189,248,0.18)", text:"#38bdf8", bdr:"rgba(56,189,248,0.35)"},
  "Draft":            {bg:"rgba(148,163,184,0.15)",text:"#94a3b8", bdr:"rgba(148,163,184,0.3)"},
  "Cancelled":        {bg:"rgba(251,113,133,0.18)",text:"#fb7185", bdr:"rgba(251,113,133,0.35)"},
};

/* ═══════════════════════════════════════════════════
   GLASS HELPERS
═══════════════════════════════════════════════════ */
const card = (th, extra={}) => ({
  background: th.card,
  border: `1px solid ${th.cardBdr}`,
  borderRadius: 20,
  boxShadow: th.cardShadow,
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  ...extra,
});

/* ═══════════════════════════════════════════════════
   BASE COMPONENTS
═══════════════════════════════════════════════════ */
const Pill = ({status}) => {
  const c = STATUS_CFG[status]||STATUS_CFG["Draft"];
  return <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 12px",borderRadius:20,
    fontSize:11,fontWeight:700,background:c.text,color:"#fff",border:"none",
    backdropFilter:"blur(8px)",whiteSpace:"nowrap",letterSpacing:"0.02em"}}>
    {status}
  </span>;
};

const Btn = ({children,onClick,variant="primary",disabled,sm,full,style={}}) => {
  const th = useT();
  const vs = {
    primary:{bg:th.accentSolid,color:th.isDark?"#041828":"#fff",shadow:`0 4px 18px ${th.accentGlow}`,bdr:"transparent",hov:"0.85"},
    ghost:  {bg:"rgba(255,255,255,0.08)",color:th.textSub,shadow:"none",bdr:th.cardBdr,hov:"0.75"},
    danger: {bg:"linear-gradient(135deg,#f43f5e,#be123c)",color:"#fff",shadow:"0 4px 16px rgba(244,63,94,0.3)",bdr:"transparent",hov:"0.85"},
    purple: {bg:"linear-gradient(135deg,#8b5cf6,#6d28d9)",color:"#fff",shadow:"0 4px 16px rgba(139,92,246,0.3)",bdr:"transparent",hov:"0.85"},
  };
  const s = vs[variant]||vs.primary;
  return <button disabled={disabled} onClick={onClick} style={{
    cursor:disabled?"not-allowed":"pointer",
    padding:sm?"6px 14px":"9px 22px",
    borderRadius:12,fontFamily:FONT,fontSize:sm?12:13,fontWeight:600,
    background:s.bg,color:s.color,border:`1px solid ${s.bdr}`,
    boxShadow:s.shadow,transition:"all 0.2s",opacity:disabled?0.4:1,
    backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",
    width:full?"100%":undefined,whiteSpace:"nowrap",...style}}
    onMouseEnter={e=>{if(!disabled){e.currentTarget.style.opacity=s.hov;e.currentTarget.style.transform="translateY(-1px)";}}}
    onMouseLeave={e=>{if(!disabled){e.currentTarget.style.opacity="1";e.currentTarget.style.transform="translateY(0)";}}}
  >{children}</button>;
};

const GInput = ({value,onChange,type="text",placeholder="",style={}}) => {
  const th = useT();
  return <input type={type} value={value||""} onChange={onChange} placeholder={placeholder}
    style={{background:th.input,border:`1px solid ${th.inputBdr}`,color:th.text,
      borderRadius:12,padding:"9px 14px",fontFamily:FONT,fontSize:13,outline:"none",
      width:"100%",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",
      transition:"border-color 0.2s",...style}}
    onFocus={e=>e.target.style.borderColor=th.accent}
    onBlur={e=>e.target.style.borderColor=th.inputBdr}/>;
};

const GSelect = ({value,onChange,options,style={}}) => {
  const th = useT();
  return <select value={value} onChange={onChange}
    style={{background:th.isDark?"rgba(10,20,55,0.7)":"rgba(255,255,255,0.8)",
      border:`1px solid ${th.inputBdr}`,color:th.text,borderRadius:12,
      padding:"9px 14px",fontFamily:FONT,fontSize:13,outline:"none",width:"100%",
      backdropFilter:"blur(12px)",...style}}>
    {options.map(o=><option key={typeof o==="string"?o:o.value} value={typeof o==="string"?o:o.value}
      style={{background:th.isDark?"#0d1b3e":"#f0f4ff",color:th.text}}>
      {typeof o==="string"?o:o.label}
    </option>)}
  </select>;
};

const Lbl = ({children}) => {
  const th = useT();
  return <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",
    color:th.textFaint,marginBottom:6,fontFamily:MONO}}>{children}</div>;
};

const StatCard = ({label,value,sub,icon,color}) => {
  const th = useT();
  const c = color||th.accent;
  return <div style={{...card(th,{padding:"20px 22px",position:"relative",overflow:"hidden"})}}>
    <div style={{position:"absolute",top:-24,right:-24,width:88,height:88,borderRadius:"50%",
      background:`radial-gradient(circle,${c}22,transparent 70%)`}}/>
    <div style={{position:"absolute",bottom:0,left:0,width:"60%",height:2,
      background:`linear-gradient(90deg,${c}80,transparent)`}}/>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
      <span style={{fontSize:11,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",
        color:th.textSub}}>{label}</span>
      <span style={{fontSize:20,opacity:0.75}}>{icon}</span>
    </div>
    <div style={{fontSize:26,fontWeight:700,color:th.text,fontFamily:MONO,letterSpacing:"-0.02em",lineHeight:1}}>{value}</div>
    {sub&&<div style={{fontSize:11,color:th.textFaint,marginTop:6}}>{sub}</div>}
  </div>;
};

/* ═══════════════════════════════════════════════════
   SLIDE-IN PANEL (replaces modal overlay)
═══════════════════════════════════════════════════ */
function SlidePanel({open, onClose, title, subtitle, children, width=600}) {
  const th = useT();
  if(!open) return null;
  return (
    <>
      {/* Minimal backdrop — just a subtle blur, NO darkening */}
      <div
        onClick={onClose}
        style={{position:"fixed",inset:0,zIndex:200,
          backdropFilter:"blur(2px)",WebkitBackdropFilter:"blur(2px)",
          background:"rgba(0,0,0,0.05)"}}
      />
      {/* Panel slides in from right */}
      <div style={{
        position:"fixed",top:0,right:0,bottom:0,width:Math.min(width,window.innerWidth),
        zIndex:201,display:"flex",flexDirection:"column",
        background:th.isDark?"rgba(10,22,55,0.82)":"rgba(255,255,255,0.82)",
        backdropFilter:"blur(32px)",WebkitBackdropFilter:"blur(32px)",
        borderLeft:`1px solid ${th.cardBdr}`,
        boxShadow:th.isDark?"-20px 0 60px rgba(0,0,0,0.4)":"-20px 0 60px rgba(100,130,200,0.15)",
        animation:"slideIn 0.28s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
        {/* Panel header */}
        <div style={{padding:"22px 28px 18px",borderBottom:`1px solid ${th.cardBdr}`,flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontSize:17,fontWeight:700,color:th.text,letterSpacing:"-0.01em"}}>{title}</div>
              {subtitle&&<div style={{fontSize:12,color:th.textSub,marginTop:3}}>{subtitle}</div>}
            </div>
            <button onClick={onClose} style={{background:"none",border:`1px solid ${th.cardBdr}`,
              width:32,height:32,borderRadius:8,color:th.textSub,cursor:"pointer",fontSize:16,
              display:"flex",alignItems:"center",justifyContent:"center",
              backdropFilter:"blur(8px)",flexShrink:0}}>×</button>
          </div>
        </div>
        {/* Scrollable content */}
        <div style={{flex:1,overflowY:"auto",padding:"22px 28px"}}>
          {children}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   THEME TOGGLE
═══════════════════════════════════════════════════ */
const ThemeToggle = ({isDark,onToggle}) => {
  const th = isDark?DARK:LIGHT;
  return <button onClick={onToggle}
    style={{width:46,height:26,borderRadius:13,border:`1px solid ${th.cardBdr}`,
      background:th.card,cursor:"pointer",position:"relative",padding:0,
      backdropFilter:"blur(12px)",flexShrink:0}}>
    <span style={{position:"absolute",top:3,left:isDark?23:3,width:18,height:18,
      borderRadius:"50%",transition:"left 0.3s",
      background:isDark?"linear-gradient(135deg,#38bdf8,#818cf8)":"linear-gradient(135deg,#fbbf24,#f59e0b)",
      boxShadow:isDark?"0 0 8px rgba(56,189,248,0.7)":"0 0 8px rgba(251,191,36,0.6)",
      display:"flex",alignItems:"center",justifyContent:"center",fontSize:9}}>
      {isDark?"🌙":"☀️"}
    </span>
  </button>;
};

/* ═══════════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════════ */
const NAV = [
  {id:"income",     icon:"🧾", label:"Income"},
  {id:"expenses",   icon:"💸", label:"Expenses"},
  {id:"financials", icon:"🏦", label:"Financials"},
  {id:"entities",   icon:"🏢", label:"Entities"},
  {id:"services",   icon:"⚡", label:"Services"},
  {id:"users",      icon:"👥", label:"Users"},
  {id:"settings",   icon:"⚙️",  label:"Settings"},
];

function Sidebar({page,setPage,settings,isDark,onToggle}) {
  const [exp,setExp] = useState(true);
  const th = useT();
  return (
    <div style={{width:exp?220:68,transition:"width 0.3s cubic-bezier(0.4,0,0.2,1)",
        background:th.sidebar,backdropFilter:"blur(28px)",WebkitBackdropFilter:"blur(28px)",
        borderRight:`1px solid ${th.sideBdr}`,display:"flex",flexDirection:"column",
        flexShrink:0,overflow:"hidden",zIndex:10,position:"relative",
        boxShadow:th.isDark?"4px 0 24px rgba(0,0,0,0.3)":"4px 0 24px rgba(100,130,200,0.1)"}}>

      {/* Logo + collapse button */}
      <div style={{padding:"18px 14px 14px",borderBottom:`1px solid ${th.sideBdr}`,
        display:"flex",alignItems:"center",gap:10,overflow:"hidden",flexShrink:0}}>
        <div style={{width:36,height:36,borderRadius:12,background:th.accentSolid,flexShrink:0,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,
          boxShadow:`0 4px 16px ${th.accentGlow}`}}>⚡</div>
        <div style={{opacity:exp?1:0,transition:"opacity 0.18s",whiteSpace:"nowrap",overflow:"hidden",flex:1}}>
          <div style={{fontSize:14,fontWeight:800,color:th.text,letterSpacing:"-0.01em"}}>InvoiceOS</div>
          <div style={{fontSize:9,color:th.textFaint,fontFamily:MONO,letterSpacing:"0.08em",textTransform:"uppercase",marginTop:1}}>WMB Marketech</div>
        </div>
        <button onClick={()=>setExp(e=>!e)}
          title={exp?"Collapse sidebar":"Expand sidebar"}
          style={{width:28,height:28,borderRadius:8,border:`1px solid ${th.sideBdr}`,
            background:"transparent",color:th.textSub,cursor:"pointer",flexShrink:0,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,
            transition:"all 0.2s"}}
          onMouseEnter={e=>{e.currentTarget.style.background=th.cardHov;e.currentTarget.style.color=th.text;}}
          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=th.textSub;}}>
          {exp?"◀":"▶"}
        </button>
      </div>

      {/* Next invoice badge */}
      <div style={{padding:"12px 16px",borderBottom:`1px solid ${th.sideBdr}`,
        display:"flex",alignItems:"center",gap:12,overflow:"hidden",flexShrink:0}}>
        <div style={{width:36,height:36,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:10,fontFamily:MONO,fontWeight:700,color:th.accent,
            background:th.isDark?"rgba(56,189,248,0.12)":"rgba(2,132,199,0.1)",
            padding:"4px 6px",borderRadius:6,border:`1px solid ${th.isDark?"rgba(56,189,248,0.25)":"rgba(2,132,199,0.25)"}`,
            whiteSpace:"nowrap"}}>#</span>
        </div>
        <div style={{opacity:exp?1:0,transition:"opacity 0.15s",whiteSpace:"nowrap",overflow:"hidden"}}>
          <div style={{fontSize:9,color:th.textFaint,fontFamily:MONO,textTransform:"uppercase",letterSpacing:"0.08em"}}>Next invoice</div>
          <div style={{fontSize:14,fontWeight:700,color:th.accent,fontFamily:MONO}}>{peekNext(settings)}</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{flex:1,padding:"10px 10px",overflowY:"auto",overflowX:"hidden"}}>
        {NAV.map(item=>{
          const active = page===item.id;
          return <div key={item.id} onClick={()=>setPage(item.id)}
            title={!exp?item.label:undefined}
            style={{display:"flex",alignItems:"center",gap:12,padding:"11px 12px",
              borderRadius:12,cursor:"pointer",marginBottom:3,overflow:"hidden",
              background:active?th.activeNav:"transparent",
              borderLeft:`2px solid ${active?th.activeNavBdr:"transparent"}`,
              transition:"all 0.15s"}}
            onMouseEnter={e=>{if(!active)e.currentTarget.style.background=th.cardHov;}}
            onMouseLeave={e=>{if(!active)e.currentTarget.style.background="transparent";}}>
            <span style={{fontSize:18,width:22,textAlign:"center",flexShrink:0,
              filter:active?`drop-shadow(0 0 5px ${th.accent})`:"none"}}>{item.icon}</span>
            <span style={{fontSize:13,fontWeight:active?600:400,color:active?th.accent:th.textSub,
              whiteSpace:"nowrap",opacity:exp?1:0,transition:"opacity 0.15s"}}>{item.label}</span>
          </div>;
        })}
      </nav>

      {/* Bottom */}
      <div style={{padding:"12px 14px",borderTop:`1px solid ${th.sideBdr}`,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10,overflow:"hidden"}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:th.accentSolid,flexShrink:0,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:13,fontWeight:800,color:th.isDark?"#041828":"#fff",
            boxShadow:`0 2px 10px ${th.accentGlow}`}}>A</div>
          <div style={{flex:1,minWidth:0,opacity:exp?1:0,transition:"opacity 0.15s"}}>
            <div style={{fontSize:12,fontWeight:600,color:th.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{settings.adminName||"Admin"}</div>
            <div style={{fontSize:10,color:th.textFaint,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{settings.adminEmail||"Administrator"}</div>
          </div>
          <div style={{opacity:exp?1:0,transition:"opacity 0.15s",flexShrink:0}}>
            <ThemeToggle isDark={isDark} onToggle={onToggle}/>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   INVOICE FORM (inside SlidePanel)
═══════════════════════════════════════════════════ */
function InvoiceForm({invoice,companies,services,onSave,onClose}) {
  const th = useT();
  const [inv,setInv] = useState(invoice);
  const set  = (k,v)=>setInv(p=>({...p,[k]:v}));
  const setC = (k,v)=>setInv(p=>({...p,client:{...p.client,[k]:v}}));
  const compSvcs = services.filter(s=>s.companyId===inv.companyId);
  const setItem=(idx,k,v)=>setInv(p=>{const it=[...p.items];it[idx]={...it[idx],[k]:["qty","rate"].includes(k)?+v:v};return{...p,items:it};});
  const addItem=()=>setInv(p=>({...p,items:[...p.items,{desc:"",qty:1,rate:0,vat:true}]}));
  const addSvc=s=>setInv(p=>({...p,items:[...p.items,{desc:s.name,qty:1,rate:s.price||0,vat:s.vat,_np:!s.price}]}));
  const delItem=i=>setInv(p=>({...p,items:p.items.filter((_,j)=>j!==i)}));
  const net=calcNet(inv.items),vat=calcVat(inv.items),tot=calcTotal(inv.items);
  const needsPrice=inv.items.some(i=>i._np&&!i.rate);

  return <div style={{display:"flex",flexDirection:"column",gap:18}}>
    {/* Company */}
    <div>
      <Lbl>Issue from</Lbl>
      <div style={{display:"flex",gap:10}}>
        {companies.map(co=><button key={co.id} onClick={()=>set("companyId",co.id)} style={{
          flex:1,padding:"12px 14px",borderRadius:14,cursor:"pointer",textAlign:"left",
          background:inv.companyId===co.id?`${co.color||th.accent}18`:th.input,
          border:`2px solid ${inv.companyId===co.id?co.color||th.accent:th.inputBdr}`,
          backdropFilter:"blur(8px)",transition:"all 0.15s"}}>
          <div style={{fontSize:12,fontWeight:700,color:th.text}}>{co.legalName}</div>
          <div style={{fontSize:11,color:co.color||th.accent,fontWeight:600,marginTop:2}}>{co.tradeName}</div>
        </button>)}
      </div>
    </div>
    {/* Client */}
    <div style={{background:th.isDark?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.5)",borderRadius:14,padding:"16px",border:`1px solid ${th.cardBdr}`}}>
      <Lbl>Client</Lbl>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        {["business","individual"].map(t=><button key={t} onClick={()=>set("clientType",t)} style={{
          padding:"6px 16px",borderRadius:8,cursor:"pointer",fontFamily:FONT,fontSize:12,fontWeight:600,
          background:inv.clientType===t?`${th.accent}18`:"transparent",
          border:`1px solid ${inv.clientType===t?th.accent:th.inputBdr}`,
          color:inv.clientType===t?th.accent:th.textSub,transition:"all 0.15s"}}>
          {t==="business"?"🏢 Business":"👤 Individual"}
        </button>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div><Lbl>Name</Lbl><GInput value={inv.client.name} onChange={e=>setC("name",e.target.value)} placeholder="Name or company"/></div>
        <div><Lbl>Email</Lbl><GInput value={inv.client.email} onChange={e=>setC("email",e.target.value)} type="email"/></div>
        {inv.clientType==="business"&&<>
          <div><Lbl>VAT number</Lbl><GInput value={inv.client.vat} onChange={e=>setC("vat",e.target.value)} placeholder="CY12345678X"/></div>
          <div><Lbl>Reg. no.</Lbl><GInput value={inv.client.reg||""} onChange={e=>setC("reg",e.target.value)} placeholder="HE000000"/></div>
        </>}
        <div style={{gridColumn:"1/-1"}}><Lbl>Address</Lbl><GInput value={inv.client.address} onChange={e=>setC("address",e.target.value)}/></div>
      </div>
    </div>
    {/* Meta */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      <div><Lbl>Date</Lbl><GInput type="date" value={inv.date} onChange={e=>set("date",e.target.value)}/></div>
      <div><Lbl>Status</Lbl><GSelect value={inv.status} onChange={e=>set("status",e.target.value)} options={STATUSES}/></div>
      <div><Lbl>Payment</Lbl><GSelect value={inv.paymentMethod} onChange={e=>set("paymentMethod",e.target.value)} options={PAY_METHODS}/></div>
      <div><Lbl>Source</Lbl><GSelect value={inv.source} onChange={e=>set("source",e.target.value)} options={SOURCES}/></div>
    </div>
    {/* Services */}
    {compSvcs.length>0&&<div>
      <Lbl>Quick-add service</Lbl>
      <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
        {compSvcs.map(s=><button key={s.id} onClick={()=>addSvc(s)} style={{
          padding:"5px 12px",borderRadius:8,border:`1px solid ${th.cardBdr}`,
          background:th.card,color:th.text,cursor:"pointer",fontSize:12,fontFamily:FONT,fontWeight:500,
          backdropFilter:"blur(8px)",transition:"all 0.15s"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=th.accent;e.currentTarget.style.color=th.accent;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=th.cardBdr;e.currentTarget.style.color=th.text;}}>
          + {s.name}{s.price?` · ${fmt(s.price)}`:" · enter price"}
        </button>)}
      </div>
    </div>}
    {/* Items */}
    <div>
      <Lbl>Line items</Lbl>
      <div style={{border:`1px solid ${th.cardBdr}`,borderRadius:14,overflow:"hidden",
        background:th.isDark?"rgba(255,255,255,0.03)":"rgba(255,255,255,0.5)",backdropFilter:"blur(8px)"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:th.isDark?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.6)",borderBottom:`1px solid ${th.cardBdr}`}}>
            {["Description","Qty","Rate","VAT?","Total",""].map((h,i)=><th key={i} style={{padding:"9px 10px",fontSize:9,color:th.textFaint,fontWeight:700,fontFamily:MONO,textAlign:"left",letterSpacing:"0.08em",textTransform:"uppercase"}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {inv.items.map((item,idx)=><tr key={idx} style={{borderBottom:`1px solid ${th.cardBdr}`}}>
              <td style={{padding:"7px 8px",width:"40%"}}>
                <GInput value={item.desc} onChange={e=>setItem(idx,"desc",e.target.value)} placeholder="Description"/>
                {item._np&&!item.rate&&<div style={{fontSize:10,color:th.amber,marginTop:3}}>⚠ Enter price</div>}
              </td>
              <td style={{padding:"7px 6px",width:"9%"}}>
                <input type="number" value={item.qty} min={1} onChange={e=>setItem(idx,"qty",e.target.value)}
                  style={{width:"100%",background:th.input,border:`1px solid ${th.inputBdr}`,color:th.text,borderRadius:10,padding:"9px 6px",fontFamily:MONO,fontSize:12,outline:"none"}}/>
              </td>
              <td style={{padding:"7px 6px",width:"18%"}}>
                <input type="number" value={item.rate} min={0} step={0.01} onChange={e=>setItem(idx,"rate",e.target.value)}
                  style={{width:"100%",background:item._np&&!item.rate?`${th.amber}12`:th.input,border:`1px solid ${item._np&&!item.rate?th.amber:th.inputBdr}`,color:th.text,borderRadius:10,padding:"9px 6px",fontFamily:MONO,fontSize:12,outline:"none"}}/>
              </td>
              <td style={{padding:"7px 6px",textAlign:"center"}}>
                <input type="checkbox" checked={item.vat} onChange={e=>setItem(idx,"vat",e.target.checked)} style={{width:16,height:16,accentColor:th.accent,cursor:"pointer"}}/>
              </td>
              <td style={{padding:"7px 10px",fontFamily:MONO,fontSize:12,color:th.accent,fontWeight:600}}>{fmt(calcItem(item))}</td>
              <td style={{padding:"7px 6px"}}>{inv.items.length>1&&<button onClick={()=>delItem(idx)} style={{background:"none",border:"none",color:th.textFaint,cursor:"pointer",fontSize:16,lineHeight:1}}>×</button>}</td>
            </tr>)}
          </tbody>
        </table>
        <div style={{padding:"8px 10px",borderTop:`1px solid ${th.cardBdr}`}}>
          <Btn variant="ghost" sm onClick={addItem}>+ Add line</Btn>
        </div>
      </div>
    </div>
    {/* Notes */}
    <div>
      <Lbl>Notes (optional)</Lbl>
      <textarea value={inv.notes||""} onChange={e=>set("notes",e.target.value)}
        placeholder="Payment instructions, thank you note, or any other info to appear on the invoice…"
        rows={3}
        style={{width:"100%",background:th.input,border:`1px solid ${th.inputBdr}`,color:th.text,
          borderRadius:12,padding:"10px 14px",fontFamily:FONT,fontSize:13,outline:"none",
          resize:"vertical",lineHeight:1.5}}
        onFocus={e=>e.target.style.borderColor=th.accent}
        onBlur={e=>e.target.style.borderColor=th.inputBdr}/>
    </div>
    {/* Totals */}
    <div style={{...card(th,{padding:"14px 18px",alignSelf:"flex-end",minWidth:230})}}>
      {[["Subtotal",fmt(net)],["VAT 19%",fmt(vat)]].map(([k,v])=>
        <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:th.textSub,padding:"3px 0"}}><span>{k}</span><span style={{fontFamily:MONO}}>{v}</span></div>)}
      <div style={{display:"flex",justifyContent:"space-between",fontSize:18,fontWeight:700,
        borderTop:`1px solid ${th.accent}40`,paddingTop:10,marginTop:6}}>
        <span style={{color:th.text}}>Total</span>
        <span style={{fontFamily:MONO,color:th.accent}}>{fmt(tot)}</span>
      </div>
    </div>
    {needsPrice&&<div style={{background:`${th.amber}15`,border:`1px solid ${th.amber}40`,borderRadius:10,padding:"10px 14px",fontSize:12,color:th.amber}}>⚠ One or more items need a price.</div>}
    <div style={{display:"flex",gap:8,justifyContent:"flex-end",paddingBottom:8}}>
      <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
      <Btn disabled={needsPrice} onClick={()=>onSave(inv)}>{invoice._isNew?"Create invoice":"Save changes"}</Btn>
    </div>
  </div>;
}

/* ═══════════════════════════════════════════════════
   INVOICE PREVIEW
═══════════════════════════════════════════════════ */
function InvoicePreview({invoice,companies}) {
  const co=companies.find(c=>c.id===invoice.companyId)||companies[0];
  const net=calcNet(invoice.items),vat=calcVat(invoice.items),tot=calcTotal(invoice.items);
  return <div style={{background:"#fff",borderRadius:14,overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,0.1)"}}>
    <div style={{display:"flex"}}>
      <div style={{width:5,background:`linear-gradient(to bottom,${co.color||"#38bdf8"},#6366f1)`,flexShrink:0}}/>
      <div style={{flex:1,padding:"28px 36px 22px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",borderBottom:"1px solid #e8edf5"}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
          {co.logoUrl&&<img src={co.logoUrl} alt={co.tradeName} style={{height:52,maxWidth:140,objectFit:"contain",flexShrink:0}}/>}
          <div>
            <div style={{fontSize:13,fontWeight:700,color:"#0a1628",letterSpacing:"0.06em",textTransform:"uppercase"}}>{co.legalName}</div>
            <div style={{fontSize:10,color:co.color||"#0284c7",letterSpacing:"0.14em",textTransform:"uppercase",marginTop:3,fontWeight:600}}>{co.tradeName}</div>
            <div style={{fontSize:10,color:"#94a3b8",marginTop:8,lineHeight:1.9}}>{co.address}<br/>{co.email}<br/>VAT: {co.vat}</div>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:10,letterSpacing:"0.16em",textTransform:"uppercase",color:co.color||"#0284c7",fontWeight:600,marginBottom:4}}>Invoice</div>
          <div style={{fontSize:22,fontWeight:700,color:"#0a1628",fontFamily:MONO}}>{invoice.id}</div>
          <div style={{marginTop:8}}><Pill status={invoice.status}/></div>
        </div>
      </div>
    </div>
    <div style={{height:1,background:`linear-gradient(to right,${co.color||"#38bdf8"},#e8edf5 60%)`}}/>
    <div style={{padding:"22px 36px 28px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px",background:"linear-gradient(135deg,#0a1628,#1e3a5f)",borderRadius:10,marginBottom:18}}>
        <div>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase",color:"rgba(56,189,248,0.7)",marginBottom:3}}>Total due</div>
          <div style={{fontSize:26,fontWeight:700,color:"#fff",fontFamily:MONO}}>{fmt(tot)}</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginTop:2}}>incl. VAT 19% · {fmt(vat)}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:9,textTransform:"uppercase",color:"rgba(56,189,248,0.5)",marginBottom:3}}>Payment</div>
          <div style={{fontSize:13,fontWeight:600,color:"#fff"}}>{invoice.paymentMethod}</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginTop:1}}>{invoice.date}</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        {[{lbl:"Billed to",c:<><div style={{fontSize:13,fontWeight:700,color:"#0a1628",marginBottom:3}}>{invoice.client.name||"—"}</div><div style={{fontSize:11,color:"#94a3b8",lineHeight:1.8}}>{invoice.client.email}{invoice.client.vat&&<><br/>VAT: {invoice.client.vat}</>}{invoice.client.address&&<><br/>{invoice.client.address}</>}</div></>},
          {lbl:"Details",c:<>{[["Invoice #",invoice.id],["Issued",invoice.date],["Source",invoice.source]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4}}><span style={{color:"#94a3b8"}}>{k}</span><span style={{fontWeight:600,color:"#0a1628"}}>{v}</span></div>)}</>}
        ].map(({lbl,c})=><div key={lbl} style={{border:"1px solid #e8edf5",borderRadius:8,padding:"12px 14px"}}>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:co.color||"#0284c7",marginBottom:8}}>{lbl}</div>{c}
        </div>)}
      </div>
      <table style={{width:"100%",borderCollapse:"collapse",marginBottom:14}}>
        <thead><tr style={{borderBottom:`2px solid ${co.color||"#38bdf8"}`}}>
          {["Description","Qty","Unit price","VAT","Amount"].map(h=><th key={h} style={{padding:"0 0 8px",fontSize:9,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"#94a3b8",textAlign:h==="Description"?"left":"right"}}>{h}</th>)}
        </tr></thead>
        <tbody>{invoice.items.map((it,i)=><tr key={i} style={{borderBottom:"1px solid #f5f7fa"}}>
          <td style={{padding:"10px 0",fontSize:13,fontWeight:600,color:"#0a1628"}}>{it.desc}</td>
          <td style={{padding:"10px 0",textAlign:"right",fontSize:12,color:"#94a3b8"}}>{it.qty}</td>
          <td style={{padding:"10px 0",textAlign:"right",fontSize:12,fontFamily:MONO,color:"#94a3b8"}}>{fmt(it.rate)}</td>
          <td style={{padding:"10px 0",textAlign:"right",fontSize:11,color:it.vat?"#0284c7":"#ccc"}}>{it.vat?"19%":"—"}</td>
          <td style={{padding:"10px 0",textAlign:"right",fontSize:13,fontFamily:MONO,fontWeight:600,color:"#0a1628"}}>{fmt(calcItem(it))}</td>
        </tr>)}</tbody>
      </table>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
        <div style={{width:210}}>
          {[["Subtotal",fmt(net)],["VAT 19%",fmt(vat)]].map(([k,v])=>
            <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#94a3b8",padding:"3px 0",borderBottom:"1px solid #f0f2f5"}}><span>{k}</span><span style={{fontFamily:MONO}}>{v}</span></div>)}
          <div style={{display:"flex",justifyContent:"space-between",fontSize:16,fontWeight:700,borderTop:"2px solid #0a1628",padding:"9px 0",marginTop:4}}>
            <span style={{color:"#0a1628"}}>Total due</span><span style={{fontFamily:MONO,color:co.color||"#0284c7"}}>{fmt(tot)}</span>
          </div>
        </div>
      </div>
      {invoice.status!=="Paid"&&invoice.status!=="Cancelled"&&co.bank&&
        <div style={{border:"1px solid rgba(0,150,200,0.2)",background:"rgba(0,150,200,0.04)",borderRadius:10,padding:"12px 16px",marginBottom:12}}>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:"#0284c7",marginBottom:8}}>Payment instructions — ref: {invoice.id}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {[["Bank",co.bank.name],["IBAN",co.bank.iban],["SWIFT",co.bank.swift]].map(([k,v])=>
              <div key={k}><div style={{fontSize:9,color:"#94a3b8",marginBottom:2,textTransform:"uppercase",letterSpacing:"0.06em"}}>{k}</div><div style={{fontSize:11,fontWeight:600,color:"#0a1628"}}>{v}</div></div>)}
          </div>
        </div>}
      {invoice.status==="Paid"&&<div style={{textAlign:"center",padding:10,background:"#f0fdf9",borderRadius:8,marginBottom:12}}><span style={{fontSize:12,fontWeight:600,color:"#059669"}}>✓ Payment received — thank you</span></div>}
      {invoice.notes&&<div style={{background:"#f8fafc",borderRadius:8,padding:"12px 14px",marginBottom:12,borderLeft:`3px solid ${co.color||"#38bdf8"}`}}>
        <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"#94a3b8",marginBottom:6}}>Notes</div>
        <div style={{fontSize:12,color:"#374151",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{invoice.notes}</div>
      </div>}
      <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#94a3b8",borderTop:"1px solid #f0f2f5",paddingTop:10}}>
        <span>{co.legalName} · Reg. {co.reg}</span><span>{co.phone}</span>
      </div>
    </div>
  </div>;
}

/* ═══════════════════════════════════════════════════
   INCOME PAGE
═══════════════════════════════════════════════════ */
function IncomePage({invoices,setInvoices,companies,services,settings,setSettings}) {
  const th = useT();
  const [formOpen,setFormOpen]     = useState(false);
  const [previewOpen,setPreviewOpen] = useState(false);
  const [editing,setEditing]       = useState(null);
  const [previewing,setPreviewing] = useState(null);
  const [fCo,setFCo]   = useState("all");
  const [fSrc,setFSrc] = useState("all");
  const [fPay,setFPay] = useState("all");
  const [fStat,setFStat] = useState("all");
  const [fFrom,setFFrom] = useState("");
  const [fTo,setFTo]   = useState("");
  const [search,setSearch] = useState("");

  const openNew = () => {
    const [id,ns]=bumpNext(settings); setSettings(ns);
    setEditing({id,companyId:companies[0]?.id||"",client:{name:"",email:"",vat:"",address:""},
      clientType:"business",date:today(),status:"Awaiting payment",paymentMethod:"IBAN transfer",
      source:"Manual",items:[{desc:"",qty:1,rate:0,vat:true}],_isNew:true});
    setFormOpen(true);
  };
  const openEdit = inv => { setEditing(JSON.parse(JSON.stringify(inv))); setFormOpen(true); };
  const openPreview = inv => { setPreviewing(inv); setPreviewOpen(true); };
  const saveInv = inv => {
    setInvoices(p=>{const i=p.findIndex(x=>x.id===inv.id);return i>=0?p.map((x,j)=>j===i?inv:x):[...p,inv]});
    setFormOpen(false);
  };

  const filtered = useMemo(()=>invoices.filter(inv=>{
    if(fCo!=="all"&&inv.companyId!==fCo) return false;
    if(fSrc!=="all"&&inv.source!==fSrc) return false;
    if(fPay!=="all"&&inv.paymentMethod!==fPay) return false;
    if(fStat!=="all"&&inv.status!==fStat) return false;
    if(fFrom&&inv.date<fFrom) return false;
    if(fTo&&inv.date>fTo) return false;
    if(search&&!inv.id.toLowerCase().includes(search.toLowerCase())&&!(inv.client?.name||"").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }),[invoices,fCo,fSrc,fPay,fStat,fFrom,fTo,search]);

  const totalRev=invoices.reduce((s,i)=>s+calcTotal(i.items),0);
  const paid=invoices.filter(i=>i.status==="Paid").reduce((s,i)=>s+calcTotal(i.items),0);
  const outstand=invoices.filter(i=>["Awaiting payment","Sent"].includes(i.status)).reduce((s,i)=>s+calcTotal(i.items),0);

  const filterSel={background:th.input,border:`1px solid ${th.inputBdr}`,color:th.text,
    borderRadius:10,padding:"7px 12px",fontFamily:FONT,fontSize:12,outline:"none",cursor:"pointer",backdropFilter:"blur(8px)"};

  return <>
    <div style={{marginBottom:24}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div>
          <h1 style={{fontSize:26,fontWeight:700,color:th.text,margin:0,letterSpacing:"-0.02em"}}>Invoices</h1>
          <div style={{fontSize:12,color:th.textSub,marginTop:4}}>Next: <span style={{color:th.accent,fontFamily:MONO,fontWeight:600}}>{peekNext(settings)}</span></div>
        </div>
        <Btn onClick={openNew}>+ New invoice</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
        <StatCard label="Total invoiced" value={fmt(totalRev)} color={th.accent} icon="🧾"/>
        <StatCard label="Collected" value={fmt(paid)} color={th.green} icon="✅"/>
        <StatCard label="Outstanding" value={fmt(outstand)} color={th.amber} icon="⏳"/>
        <StatCard label="Total invoices" value={invoices.length} color={th.purple} sub={`${invoices.filter(i=>i.status==="Paid").length} paid`} icon="📊"/>
      </div>
    </div>
    {/* Filters */}
    <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
      <input placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} style={{...filterSel,width:170}}/>
      {[
        {s:fCo,  fn:setFCo,  opts:[{value:"all",label:"All entities"},...companies.map(c=>({value:c.id,label:c.tradeName}))]},
        {s:fSrc, fn:setFSrc, opts:[{value:"all",label:"All sources"},...SOURCES.map(s=>({value:s,label:s}))]},
        {s:fPay, fn:setFPay, opts:[{value:"all",label:"All methods"},...PAY_METHODS.map(m=>({value:m,label:m}))]},
        {s:fStat,fn:setFStat,opts:[{value:"all",label:"All statuses"},...STATUSES.map(s=>({value:s,label:s}))]},
      ].map((f,i)=><select key={i} value={f.s} onChange={e=>f.fn(e.target.value)} style={filterSel}>
        {f.opts.map(o=><option key={o.value} value={o.value} style={{background:th.isDark?"#0d1b3e":"#f0f4ff",color:th.text}}>{o.label}</option>)}
      </select>)}
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <span style={{fontSize:11,color:th.textFaint,whiteSpace:"nowrap"}}>From</span>
        <input type="date" value={fFrom} onChange={e=>setFFrom(e.target.value)} style={{...filterSel,width:140}}/>
        <span style={{fontSize:11,color:th.textFaint}}>To</span>
        <input type="date" value={fTo} onChange={e=>setFTo(e.target.value)} style={{...filterSel,width:140}}/>
        {(fFrom||fTo)&&<button onClick={()=>{setFFrom("");setFTo("");}} style={{padding:"5px 10px",borderRadius:8,border:`1px solid ${th.cardBdr}`,background:"transparent",color:th.textSub,cursor:"pointer",fontSize:11}}>✕</button>}
      </div>
    </div>
    {/* Table */}
    <div style={{...card(th,{overflow:"hidden"})}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead style={{position:"sticky",top:0,zIndex:5}}>
          <tr style={{background:th.isDark?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.7)",borderBottom:`1px solid ${th.cardBdr}`,backdropFilter:"blur(8px)"}}>
            {["Invoice","Date","Client","Entity","Method","Total","Status","Actions"].map(h=>
              <th key={h} style={{padding:"12px 14px",fontSize:9,color:th.textFaint,fontWeight:700,fontFamily:MONO,textAlign:"left",textTransform:"uppercase",letterSpacing:"0.08em",whiteSpace:"nowrap"}}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {filtered.length===0&&<tr><td colSpan={8} style={{padding:36,textAlign:"center",color:th.textFaint}}>No invoices found.</td></tr>}
          {filtered.map(inv=>{
            const co=companies.find(c=>c.id===inv.companyId);
            return <tr key={inv.id}
              style={{borderBottom:`1px solid ${th.cardBdr}`,cursor:"pointer",transition:"background 0.12s"}}
              onMouseEnter={e=>e.currentTarget.style.background=th.cardHov}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}
              onClick={()=>openPreview(inv)}>
              <td style={{padding:"12px 14px",fontFamily:MONO,fontSize:12,color:th.accent,fontWeight:600,whiteSpace:"nowrap"}}>{inv.id}</td>
              <td style={{padding:"12px 14px",fontSize:12,color:th.textSub,fontFamily:MONO,whiteSpace:"nowrap"}}>{inv.date}</td>
              <td style={{padding:"12px 14px"}}>
                <div style={{fontSize:13,fontWeight:500,color:th.text}}>{inv.client?.name||"—"}</div>
                <div style={{fontSize:10,color:th.textFaint}}>{inv.clientType==="business"?"🏢":"👤"}</div>
              </td>
              <td style={{padding:"12px 14px"}}>
                {co&&<span style={{fontSize:11,padding:"3px 9px",borderRadius:6,fontWeight:600,whiteSpace:"nowrap",
                  background:th.isDark?`${co.color||th.accent}18`:co.color||th.accent,
                  color:th.isDark?co.color||th.accent:"#fff",
                  border:`1px solid ${co.color||th.accent}${th.isDark?"30":""}`}}>{co.tradeName}</span>}
              </td>
              <td style={{padding:"12px 14px",fontSize:11,color:th.textSub,whiteSpace:"nowrap"}}>{inv.paymentMethod}</td>
              <td style={{padding:"12px 14px",fontFamily:MONO,fontSize:13,fontWeight:600,color:th.text,whiteSpace:"nowrap"}}>{fmt(calcTotal(inv.items))}</td>
              <td style={{padding:"12px 14px"}}><Pill status={inv.status}/></td>
              <td style={{padding:"12px 10px"}}>
                <div style={{display:"flex",gap:5,alignItems:"center"}}>
                  <Btn sm variant="ghost" onClick={e=>{e.stopPropagation();openEdit(inv)}}>Edit</Btn>
                  <button title="Print / Download PDF" onClick={e=>{e.stopPropagation();setPreviewing(inv);setPreviewOpen(true);setTimeout(()=>window.print(),400);}}
                    style={{padding:"5px 8px",borderRadius:7,border:`1px solid ${th.cardBdr}`,background:"transparent",
                      color:th.textSub,cursor:"pointer",fontSize:13,lineHeight:1,transition:"all 0.15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.color=th.accent;e.currentTarget.style.borderColor=th.accent;}}
                    onMouseLeave={e=>{e.currentTarget.style.color=th.textSub;e.currentTarget.style.borderColor=th.cardBdr;}}>
                    🖨
                  </button>
                  <button title="Send by email" onClick={e=>{e.stopPropagation();const sub=encodeURIComponent(`Invoice ${inv.id}`);const body=encodeURIComponent(`Dear ${inv.client?.name||""},\n\nPlease find attached invoice ${inv.id} for ${fmt(calcTotal(inv.items))}.\n\nKind regards`);window.open(`mailto:${inv.client?.email||""}?subject=${sub}&body=${body}`);}}
                    style={{padding:"5px 8px",borderRadius:7,border:`1px solid ${th.cardBdr}`,background:"transparent",
                      color:th.textSub,cursor:"pointer",fontSize:13,lineHeight:1,transition:"all 0.15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.color=th.green;e.currentTarget.style.borderColor=th.green;}}
                    onMouseLeave={e=>{e.currentTarget.style.color=th.textSub;e.currentTarget.style.borderColor=th.cardBdr;}}>
                    ✉
                  </button>
                  {inv.id===invoices[invoices.length-1]?.id&&<button title="Delete invoice (last only)" onClick={e=>{e.stopPropagation();if(confirm(`Delete ${inv.id}? The invoice number will be reused.`)){setInvoices(p=>p.filter(x=>x.id!==inv.id));setSettings(p=>({...p,nextSeq:p.nextSeq-1}));deleteFromDB("invoices",inv.id).catch(()=>{});}}}
                    style={{padding:"5px 8px",borderRadius:7,border:`1px solid ${th.cardBdr}`,background:"transparent",
                      color:th.textSub,cursor:"pointer",fontSize:13,lineHeight:1,transition:"all 0.15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.color=th.red;e.currentTarget.style.borderColor=th.red;}}
                    onMouseLeave={e=>{e.currentTarget.style.color=th.textSub;e.currentTarget.style.borderColor=th.cardBdr;}}>
                    🗑
                  </button>}
                </div>
              </td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>

    {/* Form panel */}
    <SlidePanel open={formOpen} onClose={()=>setFormOpen(false)}
      title={editing?._isNew?"New Invoice":"Edit Invoice"}
      subtitle={editing?._isNew?`Will be assigned: ${editing?.id}`:editing?.id}>
      {editing&&<InvoiceForm invoice={editing} companies={companies} services={services} onSave={saveInv} onClose={()=>setFormOpen(false)}/>}
    </SlidePanel>

    {/* Preview panel */}
    <SlidePanel open={previewOpen} onClose={()=>setPreviewOpen(false)}
      title={`Invoice ${previewing?.id||""}`} subtitle="Print-ready preview" width={720}>
      {previewing&&<>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          <Btn sm onClick={()=>{openEdit(previewing);setPreviewOpen(false);}}>Edit</Btn>
          <Btn sm variant="ghost" onClick={()=>window.print()}>🖨 Print / PDF</Btn>
        </div>
        <InvoicePreview invoice={previewing} companies={companies}/>
      </>}
    </SlidePanel>
  </>;
}

/* ═══════════════════════════════════════════════════
   EXPENSES PAGE
═══════════════════════════════════════════════════ */
function ExpensesPage({expenses,setExpenses}) {
  const th = useT();
  const [open,setOpen]   = useState(false);
  const [editing,setEdit] = useState(null);
  const blank = {id:newExpId(),supplier:"",date:today(),category:"Materials",net:0,vatIn:0,paymentMethod:"IBAN transfer",notes:"",file:null};
  const save = exp=>{setExpenses(p=>{const i=p.findIndex(x=>x.id===exp.id);return i>=0?p.map((x,j)=>j===i?exp:x):[...p,exp]});setOpen(false);};
  const del  = id =>{setExpenses(p=>p.filter(x=>x.id!==id));setOpen(false);};
  const tn=expenses.reduce((s,e)=>s+e.net,0), tv=expenses.reduce((s,e)=>s+e.vatIn,0);

  return <>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <div><h1 style={{fontSize:26,fontWeight:700,color:th.text,margin:0,letterSpacing:"-0.02em"}}>Expenses</h1>
        <div style={{fontSize:12,color:th.textSub,marginTop:4}}>Track supplier invoices and receipts</div></div>
      <Btn onClick={()=>{setEdit({...blank,_isNew:true});setOpen(true);}}>+ New expense</Btn>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
      <StatCard label="Total net" value={fmt(tn)} color={th.red} icon="💸"/>
      <StatCard label="Input VAT" value={fmt(tv)} color={th.purple} sub="Reclaimable" icon="🔄"/>
      <StatCard label="Gross" value={fmt(tn+tv)} color={th.amber} icon="📋"/>
    </div>
    <div style={{...card(th,{overflow:"hidden"})}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{background:th.isDark?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.7)",borderBottom:`1px solid ${th.cardBdr}`}}>
          {["ID","Supplier","Category","Date","Method","Net","VAT","Gross","Receipt",""].map(h=>
            <th key={h} style={{padding:"11px 14px",fontSize:9,color:th.textFaint,fontWeight:700,fontFamily:MONO,textAlign:"left",textTransform:"uppercase",letterSpacing:"0.08em"}}>{h}</th>)}
        </tr></thead>
        <tbody>
          {expenses.length===0&&<tr><td colSpan={10} style={{padding:36,textAlign:"center",color:th.textFaint}}>No expenses yet.</td></tr>}
          {expenses.map(exp=><tr key={exp.id} style={{borderBottom:`1px solid ${th.cardBdr}`,cursor:"pointer",transition:"background 0.12s"}}
            onMouseEnter={e=>e.currentTarget.style.background=th.cardHov}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}
            onClick={()=>{setEdit({...exp});setOpen(true);}}>
            <td style={{padding:"11px 14px",fontFamily:MONO,fontSize:12,color:th.red}}>{exp.id}</td>
            <td style={{padding:"11px 14px",fontSize:13,fontWeight:500,color:th.text}}>{exp.supplier||"—"}</td>
            <td style={{padding:"11px 14px"}}><span style={{fontSize:11,padding:"2px 8px",borderRadius:6,background:`${th.purple}18`,color:th.purple,fontWeight:500,border:`1px solid ${th.purple}30`}}>{exp.category}</span></td>
            <td style={{padding:"11px 14px",fontSize:12,color:th.textSub,fontFamily:MONO}}>{exp.date}</td>
            <td style={{padding:"11px 14px",fontSize:11,color:th.textSub}}>{exp.paymentMethod}</td>
            <td style={{padding:"11px 14px",fontFamily:MONO,fontSize:12}}>{fmt(exp.net)}</td>
            <td style={{padding:"11px 14px",fontFamily:MONO,fontSize:12,color:th.purple}}>{fmt(exp.vatIn)}</td>
            <td style={{padding:"11px 14px",fontFamily:MONO,fontSize:13,fontWeight:600,color:th.red}}>{fmt(exp.net+exp.vatIn)}</td>
            <td style={{padding:"11px 14px",fontSize:12,color:exp.file?th.green:th.textFaint}}>{exp.file?"📎":"—"}</td>
            <td style={{padding:"11px 14px"}}>
              <div style={{display:"flex",gap:6}}>
                <Btn sm variant="ghost" onClick={e=>{e.stopPropagation();setEdit({...exp});setOpen(true);}}>Edit</Btn>
                <button onClick={e=>{e.stopPropagation();alert("Attach receipt — connect to Supabase Storage or Google Drive");}}
                  title="Attach receipt"
                  style={{padding:"5px 9px",borderRadius:8,border:`1px solid ${th.cardBdr}`,background:th.card,
                    color:th.green,cursor:"pointer",fontSize:13,backdropFilter:"blur(8px)",
                    transition:"all 0.15s",lineHeight:1}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=th.green;e.currentTarget.style.background=`${th.green}15`;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=th.cardBdr;e.currentTarget.style.background=th.card;}}>
                  📎
                </button>
              </div>
            </td>
          </tr>)}
        </tbody>
      </table>
    </div>
    <SlidePanel open={open} onClose={()=>setOpen(false)}
      title={editing?._isNew?"New Expense":"Edit Expense"} subtitle={editing?.supplier}>
      {editing&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><Lbl>Supplier</Lbl><GInput value={editing.supplier} onChange={e=>setEdit(p=>({...p,supplier:e.target.value}))}/></div>
          <div><Lbl>Category</Lbl><GSelect value={editing.category} onChange={e=>setEdit(p=>({...p,category:e.target.value}))} options={EXP_CATS}/></div>
          <div><Lbl>Date</Lbl><GInput type="date" value={editing.date} onChange={e=>setEdit(p=>({...p,date:e.target.value}))}/></div>
          <div><Lbl>Payment</Lbl><GSelect value={editing.paymentMethod} onChange={e=>setEdit(p=>({...p,paymentMethod:e.target.value}))} options={PAY_METHODS}/></div>
          <div><Lbl>Net amount</Lbl><GInput type="number" value={editing.net} onChange={e=>setEdit(p=>({...p,net:+e.target.value}))}/></div>
          <div><Lbl>Input VAT</Lbl><GInput type="number" value={editing.vatIn} onChange={e=>setEdit(p=>({...p,vatIn:+e.target.value}))}/></div>
        </div>
        <div><Lbl>Notes</Lbl><GInput value={editing.notes} onChange={e=>setEdit(p=>({...p,notes:e.target.value}))}/></div>
        <div style={{border:`2px dashed ${th.cardBdr}`,borderRadius:12,padding:14,textAlign:"center",cursor:"pointer",fontSize:12,color:th.textFaint}}
          onClick={()=>alert("Connect to Supabase Storage for file uploads")}>📎 Attach receipt or invoice</div>
        <div style={{...card(th,{padding:"12px 16px",display:"flex",gap:20})}}>
          {[["Net",fmt(editing.net),th.text],["VAT",fmt(editing.vatIn),th.purple],["Gross",fmt(editing.net+editing.vatIn),th.red]].map(([k,v,c])=>
            <div key={k}><div style={{fontSize:9,color:th.textFaint,fontFamily:MONO,textTransform:"uppercase",marginBottom:2}}>{k}</div>
            <div style={{fontFamily:MONO,fontWeight:700,color:c,fontSize:15}}>{v}</div></div>)}
        </div>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          {!editing._isNew&&<Btn variant="danger" onClick={()=>{if(confirm("Delete?"))del(editing.id)}}>Delete</Btn>}
          <div style={{display:"flex",gap:8,marginLeft:"auto"}}>
            <Btn variant="ghost" onClick={()=>setOpen(false)}>Cancel</Btn>
            <Btn onClick={()=>save(editing)}>Save expense</Btn>
          </div>
        </div>
      </div>}
    </SlidePanel>
  </>;
}

/* ═══════════════════════════════════════════════════
   FINANCIALS PAGE
═══════════════════════════════════════════════════ */
function FinancialsPage({invoices,expenses,transactions,setTransactions}) {
  const th=useT(), [csv,setCsv]=useState(""), [loading,setLoading]=useState(false), [status,setStatus]=useState(""), fileRef=useRef();
  const handleFile=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setCsv(ev.target.result);r.readAsText(f);};
  const analyse=async()=>{
    if(!csv)return;setLoading(true);setStatus("🤖 Analysing with AI…");
    const refs=[...invoices.map(i=>({type:"invoice",id:i.id,amount:calcTotal(i.items),date:i.date,name:i.client?.name||""})),...expenses.map(e=>({type:"expense",id:e.id,amount:e.net+e.vatIn,date:e.date,name:e.supplier||""}))];
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:`Analyse this bank CSV and match each transaction. Return ONLY valid JSON array.\n\nCSV:\n${csv.slice(0,3000)}\n\nRecords:\n${JSON.stringify(refs.slice(0,30))}\n\nReturn array of: {date,description,amount,matchedId,matchType(invoice|expense|bank_fee|unknown),confidence(high|medium|low),aiNote,userNote:""}`}]})});
      const d=await r.json();
      const parsed=JSON.parse((d.content?.find(b=>b.type==="text")?.text||"[]").replace(/```json|```/g,"").trim());
      setTransactions(parsed);setStatus(`✓ ${parsed.length} transactions detected.`);
    }catch{
      const lines=csv.split("\n").filter(l=>l.trim()).slice(1);
      const txns=lines.slice(0,50).map(line=>{const c=line.split(",").map(x=>x.trim().replace(/"/g,""));return{date:c[0]||today(),description:c[1]||"Unknown",amount:parseFloat(c[3]||c[4]||0)||0,matchedId:null,matchType:"unknown",confidence:"low",aiNote:"Manual parse",userNote:""};}).filter(t=>t.description);
      setTransactions(txns);setStatus("⚠ AI unavailable — manual parse.");
    }
    setLoading(false);
  };
  const upd=(idx,k,v)=>setTransactions(p=>{const t=[...p];t[idx]={...t[idx],[k]:v};return t;});

  return <div>
    <div style={{marginBottom:20}}>
      <h1 style={{fontSize:26,fontWeight:700,color:th.text,margin:0,letterSpacing:"-0.02em"}}>Financials</h1>
      <div style={{fontSize:12,color:th.textSub,marginTop:4}}>Upload bank statement · AI matches transactions</div>
    </div>
    {transactions.length>0&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
      <StatCard label="Credits" value={fmt(transactions.filter(t=>t.amount>0).reduce((s,t)=>s+t.amount,0))} color={th.green} icon="⬆"/>
      <StatCard label="Debits" value={fmt(Math.abs(transactions.filter(t=>t.amount<0).reduce((s,t)=>s+t.amount,0)))} color={th.red} icon="⬇"/>
      <StatCard label="Matched" value={`${transactions.filter(t=>t.matchedId).length}/${transactions.length}`} color={th.accent} icon="🔗"/>
      <StatCard label="Unmatched" value={transactions.filter(t=>!t.matchedId).length} color={th.amber} icon="❓"/>
    </div>}
    <div style={{...card(th,{padding:24,marginBottom:20})}}>
      <div style={{fontSize:14,fontWeight:600,color:th.text,marginBottom:14}}>Upload bank statement CSV</div>
      <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
        <div style={{flex:1,border:`2px dashed ${th.cardBdr}`,borderRadius:14,padding:24,textAlign:"center",cursor:"pointer",minWidth:180,transition:"border-color 0.2s"}}
          onClick={()=>fileRef.current?.click()}
          onMouseEnter={e=>e.currentTarget.style.borderColor=th.accent}
          onMouseLeave={e=>e.currentTarget.style.borderColor=th.cardBdr}>
          <div style={{fontSize:32,marginBottom:8}}>📄</div>
          <div style={{fontSize:13,color:th.text,fontWeight:500}}>Click to upload CSV</div>
          {csv&&<div style={{marginTop:8,fontSize:11,color:th.green}}>✓ {csv.split("\n").length} lines loaded</div>}
          <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile} style={{display:"none"}}/>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <Btn onClick={analyse} disabled={!csv||loading}>{loading?"Analysing…":"🤖 Analyse with AI"}</Btn>
          <Btn variant="ghost" onClick={()=>{setCsv("");setTransactions([]);setStatus("");}}>Clear</Btn>
        </div>
      </div>
      {status&&<div style={{marginTop:12,fontSize:12,color:loading?th.accent:th.green,fontFamily:MONO}}>{status}</div>}
    </div>
    {transactions.length>0&&<div style={{...card(th,{overflow:"hidden"})}}>
      <div style={{padding:"14px 20px",borderBottom:`1px solid ${th.cardBdr}`,fontSize:13,fontWeight:600,color:th.text}}>Transactions — confirm AI matches</div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
          <thead><tr style={{background:th.isDark?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.7)",borderBottom:`1px solid ${th.cardBdr}`}}>
            {["Date","Description","Amount","Match","Type","Confidence","Note"].map(h=><th key={h} style={{padding:"9px 12px",fontSize:9,color:th.textFaint,fontWeight:700,fontFamily:MONO,textAlign:"left",textTransform:"uppercase",letterSpacing:"0.08em",whiteSpace:"nowrap"}}>{h}</th>)}
          </tr></thead>
          <tbody>{transactions.map((t,idx)=><tr key={idx} style={{borderBottom:`1px solid ${th.cardBdr}`,background:t.matchedId?`${th.green}08`:"transparent"}}>
            <td style={{padding:"10px 12px",fontSize:12,color:th.textSub,fontFamily:MONO,whiteSpace:"nowrap"}}>{t.date}</td>
            <td style={{padding:"10px 12px",fontSize:12,color:th.text,maxWidth:180}}><div style={{fontWeight:500}}>{t.description}</div>{t.aiNote&&<div style={{fontSize:10,color:th.textFaint,marginTop:2}}>{t.aiNote}</div>}</td>
            <td style={{padding:"10px 12px",fontFamily:MONO,fontSize:13,fontWeight:600,color:t.amount>=0?th.green:th.red,whiteSpace:"nowrap"}}>{t.amount>=0?"+":""}{fmt(t.amount)}</td>
            <td style={{padding:"10px 12px"}}>{t.matchedId?<span style={{fontSize:11,fontWeight:600,color:th.accent,fontFamily:MONO}}>{t.matchedId}</span>:<span style={{color:th.textFaint}}>—</span>}</td>
            <td style={{padding:"10px 12px"}}><GSelect value={t.matchType||"unknown"} onChange={e=>upd(idx,"matchType",e.target.value)} options={["invoice","expense","bank_fee","salary","tax","unknown"]} style={{fontSize:11,padding:"4px 8px",width:"auto"}}/></td>
            <td style={{padding:"10px 12px"}}><span style={{fontSize:11,fontWeight:600,color:t.confidence==="high"?th.green:t.confidence==="medium"?th.amber:th.textFaint}}>{t.confidence||"—"}</span></td>
            <td style={{padding:"7px 8px",minWidth:150}}><GInput value={t.userNote||""} onChange={e=>upd(idx,"userNote",e.target.value)} placeholder="Note…" style={{fontSize:12,padding:"5px 9px"}}/></td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>}
  </div>;
}

/* ═══════════════════════════════════════════════════
   ENTITIES PAGE
═══════════════════════════════════════════════════ */
function EntitiesPage({companies,setCompanies}) {
  const th=useT(), [open,setOpen]=useState(false), [editing,setEdit]=useState(null);
  const blank={id:`c${Date.now()}`,legalName:"WMB Marketech LTD",tradeName:"",website:"",address:"Limassol, Cyprus",vat:"60021843M",email:"",phone:"+35795604079",reg:"HE408385",color:th.accent,bank:{name:"Bank of Cyprus",iban:"CY08002001950000357038391815",swift:"BCYPCY2N",holder:"WMB MARKETECH LTD"}};
  const COLS=[th.accent,th.purple,th.green,th.red,th.amber,th.pink];
  const save=co=>{setCompanies(p=>{const i=p.findIndex(x=>x.id===co.id);return i>=0?p.map((x,j)=>j===i?co:x):[...p,co]});setOpen(false);};
  const del=id=>{setCompanies(p=>p.filter(x=>x.id!==id));setOpen(false);};
  return <>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <div><h1 style={{fontSize:26,fontWeight:700,color:th.text,margin:0,letterSpacing:"-0.02em"}}>Entities</h1>
        <div style={{fontSize:12,color:th.textSub,marginTop:4}}>Companies and trade names</div></div>
      <Btn onClick={()=>{setEdit({...blank,_isNew:true});setOpen(true);}}>+ Add entity</Btn>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}}>
      {companies.map(co=><div key={co.id} onClick={()=>{setEdit({...co});setOpen(true);}}
        style={{...card(th,{overflow:"hidden",cursor:"pointer",transition:"all 0.2s"})}}
        onMouseEnter={e=>{e.currentTarget.style.borderColor=co.color||th.accent;e.currentTarget.style.boxShadow=`0 12px 40px rgba(0,0,0,0.2),0 0 24px ${co.color||th.accent}20`;}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor=th.cardBdr;e.currentTarget.style.boxShadow=th.cardShadow;}}>
        <div style={{height:4,background:`linear-gradient(90deg,${co.color||th.accent},transparent)`}}/>
        <div style={{padding:"18px 20px"}}>
          <div style={{fontSize:13,fontWeight:700,color:th.text}}>{co.legalName}</div>
          <div style={{fontSize:12,color:co.color||th.accent,fontWeight:600,marginTop:3}}>{co.tradeName}</div>
          <div style={{fontSize:11,color:th.isDark?th.textSub:th.textFaint,marginTop:10,lineHeight:1.9}}>{co.website}<br/>{co.email}<br/>VAT: {co.vat} · Reg: {co.reg}</div>
          {co.bank&&<div style={{marginTop:10,padding:"7px 10px",background:th.isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.04)",borderRadius:8,fontSize:10,color:th.isDark?th.textSub:th.textFaint,fontFamily:MONO}}>IBAN: ···{co.bank.iban?.slice(-8)}</div>}
        </div>
      </div>)}
    </div>
    <SlidePanel open={open} onClose={()=>setOpen(false)} title={editing?._isNew?"New Entity":"Edit Entity"}>
      {editing&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[["Legal name","legalName"],["Trade name","tradeName"],["Website","website"],["Address","address"],["VAT number","vat"],["Email","email"],["Phone","phone"],["Reg. number","reg"]].map(([lbl,key])=><div key={key}><Lbl>{lbl}</Lbl><GInput value={editing[key]||""} onChange={e=>setEdit(p=>({...p,[key]:e.target.value}))}/></div>)}
        </div>
        {/* Logo upload */}
        <div>
          <Lbl>Logo</Lbl>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            {editing.logoUrl&&<img src={editing.logoUrl} alt="logo" style={{height:44,maxWidth:120,objectFit:"contain",borderRadius:6,border:`1px solid ${th.cardBdr}`,background:"#fff",padding:4}}/>}
            <label style={{cursor:"pointer",padding:"8px 14px",borderRadius:10,border:`2px dashed ${th.cardBdr}`,
              fontSize:12,color:th.textSub,background:th.input,transition:"border-color 0.2s",display:"inline-block"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=th.accent}
              onMouseLeave={e=>e.currentTarget.style.borderColor=th.cardBdr}>
              {editing.logoUrl?"📎 Change logo":"📎 Upload logo (PNG/JPG/SVG)"}
              <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{
                const f=e.target.files[0]; if(!f) return;
                const reader=new FileReader();
                reader.onload=ev=>setEdit(p=>({...p,logoUrl:ev.target.result}));
                reader.readAsDataURL(f);
              }}/>
            </label>
            {editing.logoUrl&&<button onClick={()=>setEdit(p=>({...p,logoUrl:""}))}
              style={{background:"none",border:"none",color:th.red,cursor:"pointer",fontSize:12}}>Remove</button>}
          </div>
        </div>
        {/* Brand color — swatches + hex input */}
        <div>
          <Lbl>Brand color</Lbl>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginTop:4}}>
            {COLS.map(col=><button key={col} onClick={()=>setEdit(p=>({...p,color:col}))}
              style={{width:28,height:28,borderRadius:"50%",background:col,
                border:editing.color===col?"3px solid #fff":"3px solid transparent",
                cursor:"pointer",boxShadow:editing.color===col?`0 0 12px ${col}`:"none",transition:"all 0.15s"}}/>)}
            <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:8}}>
              <input type="color" value={editing.color||"#38bdf8"} onChange={e=>setEdit(p=>({...p,color:e.target.value}))}
                style={{width:32,height:32,border:"none",borderRadius:6,cursor:"pointer",padding:2,background:"transparent"}}/>
              <input type="text" value={editing.color||""} onChange={e=>setEdit(p=>({...p,color:e.target.value}))}
                placeholder="#hex" style={{width:80,background:th.input,border:`1px solid ${th.inputBdr}`,
                  color:th.text,borderRadius:8,padding:"6px 8px",fontFamily:MONO,fontSize:12,outline:"none"}}/>
            </div>
            <div style={{width:24,height:24,borderRadius:6,background:editing.color||"#38bdf8",border:`1px solid ${th.cardBdr}`}}/>
          </div>
        </div>
        <div style={{borderTop:`1px solid ${th.cardBdr}`,paddingTop:12}}>
          <Lbl>Bank details</Lbl>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[["Bank name","name"],["Account holder","holder"],["IBAN","iban"],["SWIFT","swift"]].map(([lbl,k])=><div key={k}><Lbl>{lbl}</Lbl><GInput value={editing.bank?.[k]||""} onChange={e=>setEdit(p=>({...p,bank:{...p.bank,[k]:e.target.value}}))}/></div>)}
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
          {!editing._isNew&&<Btn variant="danger" onClick={()=>{if(confirm("Delete entity?"))del(editing.id)}}>Delete</Btn>}
          <div style={{display:"flex",gap:8,marginLeft:"auto"}}>
            <Btn variant="ghost" onClick={()=>setOpen(false)}>Cancel</Btn>
            <Btn onClick={()=>save(editing)}>Save entity</Btn>
          </div>
        </div>
      </div>}
    </SlidePanel>
  </>;
}

/* ═══════════════════════════════════════════════════
   SERVICES PAGE
═══════════════════════════════════════════════════ */
function ServicesPage({services,setServices,companies}) {
  const th=useT(), [open,setOpen]=useState(false), [editing,setEdit]=useState(null);
  const blank={id:`sv${Date.now()}`,name:"",price:0,vat:true,companyId:companies[0]?.id||""};
  const save=s=>{setServices(p=>{const i=p.findIndex(x=>x.id===s.id);return i>=0?p.map((x,j)=>j===i?s:x):[...p,s]});setOpen(false);};
  const del=id=>{setServices(p=>p.filter(x=>x.id!==id));setOpen(false);};
  return <>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <div><h1 style={{fontSize:26,fontWeight:700,color:th.text,margin:0,letterSpacing:"-0.02em"}}>Services</h1>
        <div style={{fontSize:12,color:th.textSub,marginTop:4}}>Quick-add catalogue</div></div>
      <Btn onClick={()=>{setEdit({...blank,_isNew:true});setOpen(true);}}>+ Add service</Btn>
    </div>
    {companies.map(co=>{
      const svcs=services.filter(s=>s.companyId===co.id);
      return <div key={co.id} style={{marginBottom:24}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <div style={{width:3,height:16,borderRadius:2,background:co.color||th.accent}}/>
          <span style={{fontSize:12,fontWeight:700,color:co.color||th.accent,letterSpacing:"0.06em",textTransform:"uppercase",fontFamily:MONO}}>{co.tradeName}</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:10}}>
          {svcs.map(s=><div key={s.id} onClick={()=>{setEdit({...s});setOpen(true);}}
            style={{...card(th,{padding:"14px 16px",cursor:"pointer",transition:"all 0.15s"})}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=co.color||th.accent;e.currentTarget.style.background=th.cardHov;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=th.cardBdr;e.currentTarget.style.background=th.card;}}>
            <div style={{fontSize:13,fontWeight:500,color:th.text,marginBottom:5}}>{s.name}</div>
            <div style={{fontSize:13,fontFamily:MONO,color:s.price?th.accent:th.amber,fontWeight:600}}>{s.price?fmt(s.price):"Price on invoice"}</div>
            <div style={{fontSize:10,color:th.textFaint,marginTop:3}}>{s.vat?"+ VAT 19%":"No VAT"}</div>
          </div>)}
          {!svcs.length&&<div style={{fontSize:12,color:th.textFaint}}>No services yet.</div>}
        </div>
      </div>;
    })}
    <SlidePanel open={open} onClose={()=>setOpen(false)} title={editing?._isNew?"New Service":"Edit Service"}>
      {editing&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div><Lbl>Service name</Lbl><GInput value={editing.name} onChange={e=>setEdit(p=>({...p,name:e.target.value}))}/></div>
        <div><Lbl>Price (ex VAT) — 0 = ask at invoice time</Lbl><GInput type="number" value={editing.price} onChange={e=>setEdit(p=>({...p,price:+e.target.value}))}/>
          {!editing.price&&<div style={{fontSize:10,color:th.amber,marginTop:3}}>Will be requested when adding to invoice</div>}</div>
        <div style={{display:"flex",alignItems:"center",gap:8}}><input type="checkbox" checked={editing.vat} onChange={e=>setEdit(p=>({...p,vat:e.target.checked}))} style={{width:16,height:16,accentColor:th.accent}}/><span style={{fontSize:13,color:th.text}}>Apply VAT 19%</span></div>
        <div><Lbl>Entity</Lbl><GSelect value={editing.companyId} onChange={e=>setEdit(p=>({...p,companyId:e.target.value}))} options={companies.map(c=>({value:c.id,label:c.tradeName}))}/></div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:4}}>
          {!editing._isNew&&<Btn variant="danger" onClick={()=>{if(confirm("Delete?"))del(editing.id)}}>Delete</Btn>}
          <Btn variant="ghost" onClick={()=>setOpen(false)}>Cancel</Btn>
          <Btn onClick={()=>save(editing)}>Save</Btn>
        </div>
      </div>}
    </SlidePanel>
  </>;
}

/* ═══════════════════════════════════════════════════
   USERS PAGE
═══════════════════════════════════════════════════ */
function UsersPage({users,setUsers}) {
  const th=useT(), [open,setOpen]=useState(false), [editing,setEdit]=useState(null);
  const save=u=>{setUsers(p=>{const i=p.findIndex(x=>x.id===u.id);return i>=0?p.map((x,j)=>j===i?u:x):[...p,u]});setOpen(false);};
  const rc={admin:th.red,accountant:th.accent,editor:th.purple};
  return <>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <div><h1 style={{fontSize:26,fontWeight:700,color:th.text,margin:0,letterSpacing:"-0.02em"}}>Users</h1>
        <div style={{fontSize:12,color:th.textSub,marginTop:4}}>Access and permissions</div></div>
      <Btn onClick={()=>{setEdit({id:`u${Date.now()}`,name:"",email:"",role:"accountant",active:true,_isNew:true});setOpen(true);}}>+ Add user</Btn>
    </div>
    <div style={{...card(th,{overflow:"hidden",marginBottom:16})}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{background:th.isDark?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.7)",borderBottom:`1px solid ${th.cardBdr}`}}>
          {["Name","Email","Role","Status",""].map(h=><th key={h} style={{padding:"11px 16px",fontSize:9,color:th.textFaint,fontWeight:700,fontFamily:MONO,textAlign:"left",textTransform:"uppercase",letterSpacing:"0.08em"}}>{h}</th>)}
        </tr></thead>
        <tbody>{users.map(u=><tr key={u.id} style={{borderBottom:`1px solid ${th.cardBdr}`}}>
          <td style={{padding:"13px 16px",fontWeight:600,color:th.text}}>{u.name}</td>
          <td style={{padding:"13px 16px",fontSize:12,color:th.textSub,fontFamily:MONO}}>{u.email}</td>
          <td style={{padding:"13px 16px"}}><span style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:`${rc[u.role]||th.accent}18`,color:rc[u.role]||th.accent,border:`1px solid ${rc[u.role]||th.accent}30`}}>{u.role}</span></td>
          <td style={{padding:"13px 16px"}}><span style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:u.active?`${th.green}18`:`${th.red}18`,color:u.active?th.green:th.red}}>{u.active?"Active":"Inactive"}</span></td>
          <td style={{padding:"13px 16px"}}><Btn sm variant="ghost" onClick={()=>{setEdit({...u});setOpen(true);}}>Edit</Btn></td>
        </tr>)}</tbody>
      </table>
    </div>
    <div style={{...card(th,{padding:"12px 18px",fontSize:12,color:th.textSub})}}><strong style={{color:th.accent}}>Roles:</strong> <strong style={{color:th.red}}>Admin</strong> full access · <strong style={{color:th.accent}}>Accountant</strong> view only · <strong style={{color:th.purple}}>Editor</strong> create/edit no delete</div>
    <SlidePanel open={open} onClose={()=>setOpen(false)} title={editing?._isNew?"New User":"Edit User"}>
      {editing&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div><Lbl>Full name</Lbl><GInput value={editing.name} onChange={e=>setEdit(p=>({...p,name:e.target.value}))}/></div>
        <div><Lbl>Email</Lbl><GInput type="email" value={editing.email} onChange={e=>setEdit(p=>({...p,email:e.target.value}))}/></div>
        <div><Lbl>Role</Lbl><GSelect value={editing.role} onChange={e=>setEdit(p=>({...p,role:e.target.value}))} options={ROLES}/></div>
        <div style={{display:"flex",alignItems:"center",gap:8}}><input type="checkbox" checked={editing.active} onChange={e=>setEdit(p=>({...p,active:e.target.checked}))} style={{width:16,height:16,accentColor:th.accent}}/><span style={{fontSize:13,color:th.text}}>Active</span></div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn variant="ghost" onClick={()=>setOpen(false)}>Cancel</Btn><Btn onClick={()=>save(editing)}>Save user</Btn></div>
      </div>}
    </SlidePanel>
  </>;
}

/* ═══════════════════════════════════════════════════
   SETTINGS
═══════════════════════════════════════════════════ */
function SettingsPage({settings,setSettings}) {
  const th=useT(), [saved,setSaved]=useState(false);
  return <div style={{maxWidth:560}}>
    <h1 style={{fontSize:26,fontWeight:700,color:th.text,margin:"0 0 20px",letterSpacing:"-0.02em"}}>Settings</h1>
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Admin profile */}
      <div style={{...card(th,{overflow:"hidden"})}}>
        <div style={{padding:"13px 20px",borderBottom:`1px solid ${th.cardBdr}`,fontSize:13,fontWeight:600,color:th.text}}>Admin profile</div>
        <div style={{padding:"18px 20px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div><Lbl>Display name</Lbl><GInput value={settings.adminName||""} onChange={e=>setSettings(p=>({...p,adminName:e.target.value}))} placeholder="Your name"/></div>
          <div><Lbl>Email</Lbl><GInput type="email" value={settings.adminEmail||""} onChange={e=>setSettings(p=>({...p,adminEmail:e.target.value}))} placeholder="you@example.com"/></div>
        </div>
      </div>
      <div style={{...card(th,{overflow:"hidden"})}}>
        <div style={{padding:"13px 20px",borderBottom:`1px solid ${th.cardBdr}`,fontSize:13,fontWeight:600,color:th.text}}>Invoice settings</div>
        <div style={{padding:"18px 20px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div><Lbl>Prefix</Lbl><GInput value={settings.invoicePrefix} onChange={e=>setSettings(p=>({...p,invoicePrefix:e.target.value}))}/></div>
          <div><Lbl>Next sequence</Lbl><GInput type="number" value={settings.nextSeq} onChange={e=>setSettings(p=>({...p,nextSeq:+e.target.value}))}/></div>
          <div><Lbl>VAT rate (%)</Lbl><GInput type="number" value={settings.vatRate} onChange={e=>setSettings(p=>({...p,vatRate:+e.target.value}))}/></div>
        </div>
        <div style={{padding:"0 20px 14px",fontFamily:MONO,fontSize:12,color:th.accent}}>Next: {peekNext(settings)}</div>
      </div>
      <div style={{...card(th,{overflow:"hidden"})}}>
        <div style={{padding:"13px 20px",borderBottom:`1px solid ${th.cardBdr}`,fontSize:13,fontWeight:600,color:th.text}}>Change password</div>
        <div style={{padding:"18px 20px",display:"flex",flexDirection:"column",gap:12}}>
          {["Current password","New password","Confirm new password"].map(lbl=><div key={lbl}><Lbl>{lbl}</Lbl><GInput type="password" value="" onChange={()=>{}}/></div>)}
          <Btn variant="purple" onClick={()=>alert("Connect to Supabase Auth")} style={{alignSelf:"flex-start"}}>Update password</Btn>
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end"}}>
        <Btn onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2000);}}>{saved?"✓ Saved!":"Save settings"}</Btn>
      </div>
    </div>
  </div>;
}

/* ═══════════════════════════════════════════════════
   ROOT APP — Supabase connected
═══════════════════════════════════════════════════ */

function InvoiceApp() {
  const [data,setData]     = useState(SEED);
  const [loading,setLoading] = useState(true);
  const [isDark,setIsDark] = useState(()=>{try{return localStorage.getItem("wmb_th_v5")==="dark";}catch{return false;}});
  const {companies,services,invoices,expenses,users,bankTransactions,settings} = data;
  T = isDark?DARK:LIGHT;
  const th = T;
  const [page,setPage] = useState("income");

  // ── Load all data from Supabase on mount ──
  useEffect(()=>{
    (async()=>{
      try {
        const [invR,coR,expR,svcR,usrR,setR] = await Promise.all([
          supabase.from("invoices").select("*").order("created_at",{ascending:false}),
          supabase.from("companies").select("*"),
          supabase.from("expenses").select("*").order("date",{ascending:false}),
          supabase.from("services").select("*"),
          supabase.from("users").select("*"),
          supabase.from("settings").select("*").single(),
        ]);
        setData(p=>({
          ...p,
          invoices:      (invR.data||[]).map(mapInvoice),
          companies:     (coR.data||[]).map(mapCompany),
          expenses:      (expR.data||[]).map(mapExpense),
          services:      (svcR.data||[]).map(mapService),
          users:         (usrR.data||[]).map(mapUser),
          settings:      setR.data ? mapSettings(setR.data) : p.settings,
        }));
      } catch(e) { console.error("Load error",e); }
      setLoading(false);
    })();
  },[]);

  useEffect(()=>{try{localStorage.setItem("wmb_th_v5",isDark?"dark":"light");}catch{};},[isDark]);

  // ── Wrapped setters that also persist to Supabase ──
  const setInvoices = async fn => {
    setData(p=>{
      const next = typeof fn==="function"?fn(p.invoices):fn;
      // find new/changed invoices and save
      next.forEach(inv=>{
        const old=p.invoices.find(x=>x.id===inv.id);
        if(!old||JSON.stringify(old)!==JSON.stringify(inv)) saveInvoiceToDB(inv).catch(console.error);
      });
      return {...p,invoices:next};
    });
  };
  const setExpenses = async fn => {
    setData(p=>{
      const next = typeof fn==="function"?fn(p.expenses):fn;
      next.forEach(exp=>{
        const old=p.expenses.find(x=>x.id===exp.id);
        if(!old||JSON.stringify(old)!==JSON.stringify(exp)) saveExpenseToDB(exp).catch(console.error);
      });
      return {...p,expenses:next};
    });
  };
  const setCompanies = async fn => {
    setData(p=>{
      const next = typeof fn==="function"?fn(p.companies):fn;
      next.forEach(co=>{
        const old=p.companies.find(x=>x.id===co.id);
        if(!old||JSON.stringify(old)!==JSON.stringify(co)) saveCompanyToDB(co).catch(console.error);
      });
      return {...p,companies:next};
    });
  };
  const setServices = async fn => {
    setData(p=>{
      const next = typeof fn==="function"?fn(p.services):fn;
      next.forEach(s=>{
        const old=p.services.find(x=>x.id===s.id);
        if(!old||JSON.stringify(old)!==JSON.stringify(s)) saveServiceToDB(s).catch(console.error);
      });
      return {...p,services:next};
    });
  };
  const setUsers = async fn => {
    setData(p=>{
      const next = typeof fn==="function"?fn(p.users):fn;
      next.forEach(u=>{
        const old=p.users.find(x=>x.id===u.id);
        if(!old||JSON.stringify(old)!==JSON.stringify(u)) saveUserToDB(u).catch(console.error);
      });
      return {...p,users:next};
    });
  };
  const setSettings = s => {
    const next = typeof s==="function"?s(data.settings):s;
    setData(p=>({...p,settings:next}));
    saveSettingsToDB(next).catch(console.error);
  };
  const set = k => {
    const map = {invoices:setInvoices,expenses:setExpenses,companies:setCompanies,services:setServices,users:setUsers,settings:setSettings,bankTransactions:v=>setData(p=>({...p,bankTransactions:typeof v==="function"?v(p.bankTransactions):v}))};
    return map[k]||(v=>setData(p=>({...p,[k]:typeof v==="function"?v(p[k]):v})));
  };

  if(loading) return (
    <div style={{display:"flex",height:"100vh",alignItems:"center",justifyContent:"center",
      background:"linear-gradient(135deg,#dbeafe,#ede9fe,#fce7f3)",fontFamily:FONT}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:32,marginBottom:12}}>⚡</div>
        <div style={{fontSize:16,fontWeight:600,color:"#0284c7"}}>Loading InvoiceOS…</div>
        <div style={{fontSize:12,color:"#94a3b8",marginTop:6}}>Connecting to database</div>
      </div>
    </div>
  );

  return (
    <ThemeCtx.Provider value={th}>
      <div style={{display:"flex",height:"100vh",overflow:"hidden",position:"relative",fontFamily:FONT,color:th.text}}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
          *{box-sizing:border-box;margin:0;padding:0}
          ::-webkit-scrollbar{width:4px;height:4px}
          ::-webkit-scrollbar-track{background:transparent}
          ::-webkit-scrollbar-thumb{background:${th.scrollbar};border-radius:3px}
          select option{background:${isDark?"#0d1b3e":"#f0f4ff"};color:${th.text}}
          input[type=date]::-webkit-calendar-picker-indicator{filter:${isDark?"invert(0.5)":"none"};cursor:pointer}
        `}</style>
        {/* Background layers — always visible, never dimmed */}
        <div style={{position:"fixed",inset:0,zIndex:0,background:th.pageBg,transition:"background 0.4s"}}/>
        <div style={{position:"fixed",inset:0,zIndex:0,background:th.mesh1}}/>
        <div style={{position:"fixed",inset:0,zIndex:0,background:th.mesh2}}/>
        <div style={{position:"fixed",inset:0,zIndex:0,background:th.mesh3}}/>
        {/* Sidebar */}
        <Sidebar page={page} setPage={setPage} settings={settings} isDark={isDark} onToggle={()=>setIsDark(d=>!d)}/>
        {/* Main scroll area */}
        <div style={{flex:1,overflowY:"auto",padding:"32px 36px",position:"relative",zIndex:1}}>
          {page==="income"    &&<IncomePage     invoices={invoices}   setInvoices={set("invoices")}  companies={companies} services={services} settings={settings} setSettings={set("settings")}/>}
          {page==="expenses"  &&<ExpensesPage   expenses={expenses}   setExpenses={set("expenses")}/>}
          {page==="financials"&&<FinancialsPage invoices={invoices}   expenses={expenses}            transactions={bankTransactions} setTransactions={set("bankTransactions")}/>}
          {page==="entities"  &&<EntitiesPage   companies={companies} setCompanies={set("companies")}/>}
          {page==="services"  &&<ServicesPage   services={services}   setServices={set("services")}  companies={companies}/>}
          {page==="users"     &&<UsersPage      users={users}         setUsers={set("users")}/>}
          {page==="settings"  &&<SettingsPage   settings={settings}   setSettings={set("settings")}/>}
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}

/* ═══════════════════════════════════════════════════
   LOGIN PAGE
═══════════════════════════════════════════════════ */
function LoginPage({onLogin}) {
  const [email,setEmail]     = useState("");
  const [password,setPassword] = useState("");
  const [error,setError]     = useState("");
  const [loading,setLoading] = useState(false);

  const handleLogin = async e => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await onLogin(email, password);
    } catch(err) {
      setError(err.message||"Login failed");
      setLoading(false);
    }
  };

  return (
    <div style={{display:"flex",height:"100vh",alignItems:"center",justifyContent:"center",
      background:"linear-gradient(135deg,#dbeafe 0%,#ede9fe 35%,#fce7f3 65%,#e0f2fe 100%)",
      fontFamily:"'Inter',sans-serif",position:"relative"}}>
      {/* Mesh */}
      <div style={{position:"fixed",inset:0,background:"radial-gradient(ellipse 80% 60% at 15% 10%,rgba(56,189,248,0.25),transparent 55%)"}}/>
      <div style={{position:"fixed",inset:0,background:"radial-gradient(ellipse 60% 50% at 85% 85%,rgba(139,92,246,0.15),transparent 55%)"}}/>

      <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:420,padding:"0 20px"}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:56,height:56,borderRadius:16,background:"linear-gradient(135deg,#0284c7,#0369a1)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,margin:"0 auto 14px",
            boxShadow:"0 8px 24px rgba(2,132,199,0.35)"}}>⚡</div>
          <div style={{fontSize:22,fontWeight:800,color:"#0f172a",letterSpacing:"-0.02em"}}>InvoiceOS</div>
          <div style={{fontSize:13,color:"#64748b",marginTop:4}}>WMB Marketech — sign in to continue</div>
        </div>

        {/* Card */}
        <div style={{background:"rgba(255,255,255,0.75)",backdropFilter:"blur(24px)",
          border:"1px solid rgba(255,255,255,0.9)",borderRadius:20,padding:"32px 28px",
          boxShadow:"0 8px 32px rgba(100,120,180,0.15)"}}>
          <form onSubmit={handleLogin} style={{display:"flex",flexDirection:"column",gap:16}}>
            <div>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",
                color:"#94a3b8",marginBottom:6,fontFamily:"'JetBrains Mono',monospace"}}>Email</div>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
                placeholder="your@email.com" autoComplete="email"
                style={{width:"100%",background:"rgba(255,255,255,0.7)",border:"1px solid rgba(180,200,240,0.6)",
                  color:"#0f172a",borderRadius:12,padding:"11px 14px",fontFamily:"'Inter',sans-serif",
                  fontSize:14,outline:"none"}}
                onFocus={e=>e.target.style.borderColor="#0284c7"}
                onBlur={e=>e.target.style.borderColor="rgba(180,200,240,0.6)"}/>
            </div>
            <div>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",
                color:"#94a3b8",marginBottom:6,fontFamily:"'JetBrains Mono',monospace"}}>Password</div>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required
                placeholder="••••••••" autoComplete="current-password"
                style={{width:"100%",background:"rgba(255,255,255,0.7)",border:"1px solid rgba(180,200,240,0.6)",
                  color:"#0f172a",borderRadius:12,padding:"11px 14px",fontFamily:"'Inter',sans-serif",
                  fontSize:14,outline:"none"}}
                onFocus={e=>e.target.style.borderColor="#0284c7"}
                onBlur={e=>e.target.style.borderColor="rgba(180,200,240,0.6)"}/>
            </div>
            {error&&<div style={{background:"rgba(220,38,38,0.08)",border:"1px solid rgba(220,38,38,0.25)",
              borderRadius:10,padding:"10px 14px",fontSize:13,color:"#dc2626"}}>{error}</div>}
            <button type="submit" disabled={loading}
              style={{width:"100%",padding:"12px",borderRadius:12,border:"none",cursor:loading?"not-allowed":"pointer",
                background:"linear-gradient(135deg,#0284c7,#0369a1)",color:"#fff",
                fontSize:14,fontWeight:700,fontFamily:"'Inter',sans-serif",
                boxShadow:"0 4px 18px rgba(2,132,199,0.35)",transition:"all 0.2s",
                opacity:loading?0.7:1,marginTop:4}}>
              {loading?"Signing in…":"Sign in"}
            </button>
          </form>
        </div>
        <div style={{textAlign:"center",marginTop:20,fontSize:12,color:"#94a3b8"}}>
          WMB Marketech LTD · Private access only
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ROOT WRAPPER — handles auth
═══════════════════════════════════════════════════ */
export default function Root() {
  const [authed, setAuthed] = useState(()=>{
    try { return localStorage.getItem("wmb_authed")==="1"; } catch { return false; }
  });

  const handleLogin = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    localStorage.setItem("wmb_authed","1");
    setAuthed(true);
  };

  if (!authed) return <LoginPage onLogin={handleLogin}/>;
  return <InvoiceApp />;
}
