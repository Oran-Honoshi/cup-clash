// ═══════════════════════════════════════════════════════
//  Cup Clash — Shared UI Components
//  Exported via window for use across babel scripts
// ═══════════════════════════════════════════════════════

const CC_AVATAR_PALETTE = [
  ['#00FF88','rgba(0,255,136,0.18)'],
  ['#00D4FF','rgba(0,212,255,0.18)'],
  ['#8B5CF6','rgba(139,92,246,0.18)'],
  ['#fbbf24','rgba(251,191,36,0.18)'],
  ['#f87171','rgba(248,113,113,0.18)'],
  ['#34d399','rgba(52,211,153,0.18)'],
];
function ccHash(s){let h=0;for(const c of (s||'?'))h=(h*31+c.charCodeAt(0))%CC_AVATAR_PALETTE.length;return h;}

// ── Lucide-style SVG Icons ────────────────────────────────
const ICON_PATHS={
  trophy:'<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
  flame:'<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  target:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  clock:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  lock:'<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  crown:'<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/>',
  message:'<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  sparkles:'<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
  dollar:'<line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  smile:'<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>',
  send:'<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
  check:'<polyline points="20 6 9 17 4 12"/>',
  checkCircle:'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  zap:'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  trendingUp:'<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  trendingDown:'<polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/>',
  chevronRight:'<polyline points="9 18 15 12 9 6"/>',
  award:'<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
  pen:'<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>',
  shieldCheck:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>',
  users:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
};

function Icon({name,size=18,color='currentColor',strokeWidth=2,fill='none',style={}}){
  const path=ICON_PATHS[name];
  if(!path)return null;
  return(
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      style={{flexShrink:0,...style}}
      dangerouslySetInnerHTML={{__html:path}}/>
  );
}

// ── Status Bar ──────────────────────────────────────────
function StatusBar(){
  const [t,setT]=React.useState('9:41');
  React.useEffect(()=>{
    const tick=()=>{const n=new Date();setT(`${n.getHours()}:${String(n.getMinutes()).padStart(2,'0')}`);};
    tick();const id=setInterval(tick,30000);return()=>clearInterval(id);
  },[]);
  return(
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
      padding:'14px 22px 4px',fontSize:13,fontWeight:600,color:'white',
      fontFamily:'Outfit,sans-serif',userSelect:'none',letterSpacing:'0.01em',flexShrink:0}}>
      <span>{t}</span>
      <div style={{display:'flex',gap:6,alignItems:'center'}}>
        <svg width="16" height="11" viewBox="0 0 16 11">
          <rect x="0" y="7.5" width="3" height="3.5" fill="white" rx="0.5"/>
          <rect x="4.5" y="5" width="3" height="6" fill="white" rx="0.5"/>
          <rect x="9" y="2" width="3" height="9" fill="white" rx="0.5"/>
          <rect x="13.5" y="0" width="2.5" height="11" fill="rgba(255,255,255,0.3)" rx="0.5"/>
        </svg>
        <svg width="15" height="11" viewBox="0 0 22 16" fill="none">
          <circle cx="11" cy="14.5" r="1.5" fill="white"/>
          <path d="M5.5 9a7.8 7.8 0 0111 0" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M2 5.5a13 13 0 0118 0" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M9 12a3.5 3.5 0 014 0" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        <svg width="26" height="12" viewBox="0 0 26 12">
          <rect x="0.75" y="0.75" width="21" height="10.5" rx="2.5" stroke="white" strokeWidth="1.5" fill="none"/>
          <path d="M22.25 4.5v3" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          <rect x="2" y="2" width="15" height="8" rx="1.5" fill="white"/>
        </svg>
      </div>
    </div>
  );
}

// ── Flag ────────────────────────────────────────────────
function Flag({code,size=36,square=false,border=true}){
  const [err,setErr]=React.useState(false);
  const r=square?8:'50%';
  if(err||!code)return(
    <div style={{width:size,height:size,borderRadius:r,background:'rgba(255,255,255,0.07)',
      display:'flex',alignItems:'center',justifyContent:'center',
      border:'1px solid rgba(255,255,255,0.12)',fontSize:size*0.42,flexShrink:0}}>⚽</div>
  );
  return(
    <img src={`https://flagcdn.com/w80/${code}.png`} onError={()=>setErr(true)} alt={code}
      style={{width:size,height:size,objectFit:'cover',borderRadius:r,flexShrink:0,display:'block',
        border:border?'2px solid rgba(255,255,255,0.18)':'none'}}/>
  );
}

// ── Avatar ──────────────────────────────────────────────
function Avatar({name='?',size=36,ring,you=false}){
  const [fg,bg]=CC_AVATAR_PALETTE[ccHash(name)];
  const init=name.trim().split(/\s+/).map(w=>w[0]||'').join('').toUpperCase().slice(0,2);
  return(
    <div style={{width:size,height:size,borderRadius:'50%',background:bg,
      display:'flex',alignItems:'center',justifyContent:'center',
      fontWeight:800,fontSize:Math.round(size*0.38),color:fg,
      border:`2.5px solid ${ring||(you?'#00FF88':'rgba(255,255,255,0.15)')}`,
      boxShadow:(ring||you)?`0 0 14px ${ring||'#00FF88'}55`:'none',
      flexShrink:0,fontFamily:'Outfit,sans-serif',letterSpacing:'-0.005em'}}>
      {init}
    </div>
  );
}

// ── Live Dot ────────────────────────────────────────────
function LiveDot(){
  return<span style={{display:'inline-block',width:7,height:7,borderRadius:'50%',
    background:'#00D4FF',flexShrink:0,animation:'livePulse 1.4s ease-in-out infinite'}}/>;
}

// ── Glass Card ──────────────────────────────────────────
function GlassCard({children,style={},accent,onClick,className=''}){
  const [h,setH]=React.useState(false);
  return(
    <div className={className} onClick={onClick}
      onMouseEnter={()=>onClick&&setH(true)} onMouseLeave={()=>setH(false)}
      style={{
        background:accent
          ?`linear-gradient(180deg,${accent}10,rgba(15,12,32,0.22) 60%)`
          :h?'rgba(28,22,52,0.4)':'rgba(18,14,38,0.26)',
        backdropFilter:'blur(48px) saturate(180%)',WebkitBackdropFilter:'blur(48px) saturate(180%)',
        borderRadius:22,
        border:accent?`1px solid ${accent}45`:'1px solid rgba(255,255,255,0.16)',
        boxShadow:accent
          ?`0 12px 40px rgba(0,0,0,0.45),0 0 0 1px ${accent}22,inset 0 1px 0 rgba(255,255,255,0.22),inset 0 -1px 0 rgba(255,255,255,0.05)`
          :'0 12px 40px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.2),inset 0 -1px 0 rgba(255,255,255,0.04)',
        cursor:onClick?'pointer':'default',transition:'all 0.2s',...style,
      }}>{children}</div>
  );
}

// ── Chip ────────────────────────────────────────────────
function Chip({label,color='#00FF88',glow=false}){
  return(
    <span style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',
      color,background:`${color}18`,border:`1px solid ${color}38`,
      borderRadius:100,padding:'4px 10px',whiteSpace:'nowrap',fontFamily:'Outfit,sans-serif',
      boxShadow:glow?`0 0 12px ${color}45,inset 0 0 8px ${color}10`:'none',display:'inline-block',
      backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)'}}>
      {label}
    </span>
  );
}

// ── Section Label ───────────────────────────────────────
function SLabel({children,color='#00D4FF',count}){
  return(
    <div style={{fontSize:11,fontWeight:600,textTransform:'uppercase',
      letterSpacing:'0.14em',color,marginBottom:10,fontFamily:'Outfit,sans-serif',
      display:'flex',alignItems:'center',gap:7,
      textShadow:`0 0 12px ${color}50`}}>
      {children}
      {count!=null&&<span style={{color:'rgba(255,255,255,0.4)',fontFamily:'Outfit,sans-serif',
        fontSize:11,fontWeight:600,textShadow:'none'}}>({count})</span>}
    </div>
  );
}

// ── Zone Divider ────────────────────────────────────────
function ZoneLine({label}){
  return(
    <div style={{display:'flex',alignItems:'center',gap:8,margin:'0'}}>
      <div style={{flex:1,height:1,background:'rgba(0,255,136,0.25)'}}/>
      {label&&<span style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',
        color:'rgba(0,255,136,0.85)',whiteSpace:'nowrap',fontFamily:'Outfit,sans-serif',padding:'0 2px',
        textShadow:'0 0 8px rgba(0,255,136,0.5)'}}>
        {label}
      </span>}
      <div style={{flex:1,height:1,background:'rgba(0,255,136,0.25)'}}/>
    </div>
  );
}

// ── Neon Gradient Bar ───────────────────────────────────
function NeonBar({gradient='linear-gradient(90deg,#00D4FF,#00FF88)',h=2.5}){
  return<div style={{height:h,background:gradient,borderRadius:'2px 2px 0 0',flexShrink:0}}/>;
}

// ── Icon Button ─────────────────────────────────────────
function IconBtn({onClick,children,color='rgba(255,255,255,0.5)'}){
  const [h,setH]=React.useState(false);
  return(
    <button onClick={onClick}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{background:'none',border:'none',cursor:'pointer',padding:8,
        color:h?'white':color,transition:'color 0.15s',display:'flex',alignItems:'center',justifyContent:'center'}}>
      {children}
    </button>
  );
}

// ── Screen Header ───────────────────────────────────────
function ScreenHeader({title,onBack,action}){
  return(
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
      padding:'6px 16px 12px',flexShrink:0}}>
      {onBack?(
        <IconBtn onClick={onBack} color='#00D4FF'>
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
            <path d="M7 1L1 7l6 6" stroke="#00D4FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </IconBtn>
      ):<div style={{width:36}}/>}
      <span style={{fontFamily:'var(--display-font)',fontWeight:700,fontSize:22,
        letterSpacing:'0',color:'white',textShadow:'0 2px 18px rgba(0,0,0,0.6)'}}>
        {title}
      </span>
      {action||<div style={{width:36}}/>}
    </div>
  );
}

Object.assign(window,{
  StatusBar,Flag,Avatar,LiveDot,GlassCard,Chip,SLabel,ZoneLine,NeonBar,IconBtn,ScreenHeader,
  Icon,ICON_PATHS,
  CC_AVATAR_PALETTE,ccHash,
});
