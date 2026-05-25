// ═══════════════════════════════════════════════════════
//  Cup Clash — Screen Components
// ═══════════════════════════════════════════════════════

const {useState:useS,useEffect:useE,useRef:useR}=React;
const {StatusBar,Flag,Avatar,LiveDot,GlassCard,Chip,SLabel,ZoneLine,NeonBar,IconBtn,ScreenHeader,Icon,CC_AVATAR_PALETTE,ccHash}=window;

// ── MOCK DATA ───────────────────────────────────────────

const ME = { id:'me', name:'You', pts:110, code:'il', rank:3, delta:+3 };

const MEMBERS = [
  {id:'a1',name:'Amit',   pts:145,code:'il',rank:1,delta:+2},
  {id:'a2',name:'Sarah',  pts:130,code:'gb',rank:2,delta:-1},
  ME,
  {id:'a4',name:'John',   pts:95, code:'us',rank:4,delta:0},
  {id:'a5',name:'Ben',    pts:90, code:'de',rank:5,delta:-2},
  {id:'a6',name:'Maria',  pts:85, code:'es',rank:6,delta:+1},
  {id:'a7',name:'Luca',   pts:72, code:'it',rank:7,delta:-1},
];

const MATCHES = [
  {id:'m1',home:'Mexico',    hc:'mx',away:'South Africa',ac:'za',time:'18:00',lock:'2H 44M',group:'C',date:'Today',venue:'MetLife Stadium'},
  {id:'m2',home:'Brazil',    hc:'br',away:'Germany',     ac:'de',time:'21:00',lock:'5H 44M',group:'B',date:'Today',venue:'AT&T Stadium'},
  {id:'m3',home:'USA',       hc:'us',away:'England',     ac:'gb-eng',time:'17:00',lock:'',group:'D',date:'Tomorrow',venue:'SoFi Stadium'},
  {id:'m4',home:'Spain',     hc:'es',away:'Morocco',     ac:'ma',time:'20:00',lock:'',group:'E',date:'Tomorrow',venue:'Levi\'s Stadium'},
  {id:'m5',home:'Portugal',  hc:'pt',away:'Uruguay',     ac:'uy',time:'14:00',lock:'LOCKED',group:'G',date:'Yesterday',venue:'Gillette Stadium'},
];

const STANDINGS_A=[
  {team:'Argentina',code:'ar',p:3,gd:'+11',pts:14,adv:true},
  {team:'France',   code:'fr',p:3,gd:'+8', pts:13,adv:true},
  {team:'Netherlands',code:'nl',p:3,gd:'+6',pts:10,adv:true},
  {team:'Japan',    code:'jp',p:3,gd:'+4', pts:9},
  {team:'Senegal',  code:'sn',p:3,gd:'-0', pts:4},
  {team:'Peru',     code:'pe',p:3,gd:'-13',pts:2},
];
const STANDINGS_B=[
  {team:'Germany',  code:'de',p:3,gd:'+7', pts:12,adv:true},
  {team:'Brazil',   code:'br',p:3,gd:'+5', pts:10,adv:true},
  {team:'Mexico',   code:'mx',p:3,gd:'+2', pts:8, adv:true},
  {team:'USA',      code:'us',p:3,gd:'+1', pts:7},
  {team:'England',  code:'gb-eng',p:3,gd:'-3',pts:6},
  {team:'Morocco',  code:'ma',p:3,gd:'-6', pts:4},
];

const ACHIEVEMENTS=[
  {icon:'target',     label:'Exact Score!',  desc:'Nailed BRA 2-1 GER',  color:'#00FF88'},
  {icon:'flame',      label:'Hot Streak',    desc:'3 correct in a row',   color:'#f97316'},
  {icon:'sparkles',   label:'Early Bird',    desc:'First prediction in',  color:'#00D4FF'},
  {icon:'trophy',     label:'Group Leader',  desc:'Topped Tech Titans',   color:'#fbbf24'},
];

const CHAT_MSGS=[
  {id:1,name:'Amit',   text:'Did NOT see that Japan goal coming 😱',  time:'73\'',you:false},
  {id:2,name:'Sarah',  text:'I had Japan winning this one tbh 👀',     time:'74\'',you:false},
  {id:3,name:'You',    text:'I\'m up 15 points if ARG hold on!!!',     time:'74\'',you:true},
  {id:4,name:'Ben',    text:'Come on France equalise already 😤',       time:'75\'',you:false},
  {id:5,name:'Amit',   text:'Anyone else picking Brazil tonight? 🇧🇷', time:'76\'',you:false},
  {id:6,name:'Maria',  text:'I\'ve got BRA 2-0 GER 💪',                time:'77\'',you:false},
  {id:7,name:'You',    text:'Same! Brazil all day 🙌',                 time:'77\'',you:true},
];

// ── SCORE STEPPER ───────────────────────────────────────
function ScoreStepper({val,onChange,disabled,accent='#00FF88'}){
  const [bounce,setBounce]=useS(false);
  function bump(d){
    if(disabled)return;
    onChange(Math.max(0,Math.min(20,val+d)));
    setBounce(true);
    setTimeout(()=>setBounce(false),200);
  }
  return(
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
      <button onClick={()=>bump(1)} disabled={disabled} style={{
        width:30,height:22,borderRadius:7,border:`1px solid ${accent}30`,
        background:`${accent}10`,color:accent,fontSize:18,fontWeight:900,
        cursor:disabled?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',
        opacity:disabled?0.3:1,transition:'all 0.12s',lineHeight:1,
      }}>+</button>
      <div style={{
        width:48,height:48,borderRadius:12,
        background:`${accent}08`,border:`1.5px solid ${accent}${disabled?'20':'38'}`,
        display:'flex',alignItems:'center',justifyContent:'center',
        fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:26,color:accent,
        boxShadow:`0 0 ${disabled?4:14}px ${accent}${disabled?'10':'22'}`,
        transition:'all 0.15s',
        transform:bounce?'scale(1.18)':'scale(1)',
        userSelect:'none',
      }}>{val}</div>
      <button onClick={()=>bump(-1)} disabled={disabled} style={{
        width:30,height:22,borderRadius:7,border:`1px solid ${accent}30`,
        background:`${accent}10`,color:accent,fontSize:18,fontWeight:900,
        cursor:disabled?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',
        opacity:disabled?0.3:1,transition:'all 0.12s',lineHeight:1,
      }}>−</button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  SCREEN 1 — DASHBOARD
// ══════════════════════════════════════════════════════════
function DashboardScreen({picks,setPicks,setScreen,tweaks}){
  const [liveMin,setLiveMin]=useS(73);
  const [liveScore,setLiveScore]=useS([2,1]);
  const accentColor = tweaks.accentColor;
  useE(()=>{
    const t=setInterval(()=>{
      setLiveMin(m=>m<90?m+1:m);
      if(Math.random()<0.04)setLiveScore(([h,a])=>Math.random()>0.5?[h+1,a]:[h,a+1]);
    },3000);
    return()=>clearInterval(t);
  },[]);

  const myPick=picks['m1']||{h:0,a:0,saved:false};
  const isExact=myPick.saved&&myPick.h===liveScore[0]&&myPick.a===liveScore[1];
  const isResult=myPick.saved&&(
    (myPick.h>myPick.a&&liveScore[0]>liveScore[1])||
    (myPick.h<myPick.a&&liveScore[0]<liveScore[1])||
    (myPick.h===myPick.a&&liveScore[0]===liveScore[1])
  );

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <StatusBar/>
      <div style={{flex:1,overflowY:'auto',padding:'0 14px 90px',display:'flex',flexDirection:'column',gap:14}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 0 2px'}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.14em',color:'rgba(255,255,255,0.35)',fontFamily:'Outfit,sans-serif'}}>Your Group</div>
            <div style={{display:'flex',alignItems:'center',gap:6,marginTop:1}}>
              <div style={{fontFamily:'var(--display-font)',fontWeight:800,fontSize:22,color:'white',letterSpacing:'0',whiteSpace:'nowrap'}}>Tech Titans</div>
              <button onClick={()=>setScreen('createGroup')} title="Create new group" style={{width:24,height:24,borderRadius:8,background:`${accentColor}18`,border:`1px solid ${accentColor}38`,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0,flexShrink:0,backdropFilter:'blur(8px)'}}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={accentColor} strokeWidth="2.4" strokeLinecap="round"><path d="M6 1.5v9M1.5 6h9"/></svg>
              </button>
            </div>
          </div>
          <div style={{display:'flex',gap:6,alignItems:'center'}}>
            <span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'#00D4FF',background:'rgba(0,212,255,0.18)',border:'1px solid rgba(0,212,255,0.38)',borderRadius:100,padding:'4px 10px',fontFamily:'Outfit,sans-serif',boxShadow:'0 0 12px rgba(0,212,255,0.4)',backdropFilter:'blur(8px)'}}>
              <LiveDot/>Live
            </span>
            <button onClick={()=>setScreen('notifications')} style={{position:'relative',width:36,height:36,borderRadius:12,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',backdropFilter:'blur(12px)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span style={{position:'absolute',top:6,right:6,width:7,height:7,borderRadius:'50%',background:'#f87171',boxShadow:'0 0 6px #f87171'}}/>
            </button>
            <button onClick={()=>setScreen('profile')} style={{background:'none',border:'none',cursor:'pointer',padding:0}}>
              <Avatar name="You" size={34} you={true}/>
            </button>
          </div>
        </div>

        {/* Live Match Card */}
        <GlassCard accent="#00D4FF" style={{overflow:'hidden'}}>
          <NeonBar gradient="linear-gradient(90deg,#00D4FF,#8B5CF6)"/>
          <div style={{padding:'14px 18px 16px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
              <Chip label="Group A · ARG vs FRA" color="#00D4FF"/>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <LiveDot/>
                <span style={{fontSize:13,fontWeight:800,color:'#00D4FF',fontFamily:'JetBrains Mono,monospace'}}>{liveMin}'</span>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:0}}>
              <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
                <Flag code="ar" size={50}/>
                <span style={{fontFamily:'var(--display-font)',fontWeight:800,fontSize:15,color:'white',textTransform:'uppercase',letterSpacing:'0.06em',textAlign:'center'}}>Argentina</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:6,padding:'0 4px'}}>
                <span style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:46,color:'white',minWidth:36,textAlign:'center',lineHeight:1,textShadow:'0 0 20px rgba(255,255,255,0.25)'}}>{liveScore[0]}</span>
                <span style={{fontFamily:'var(--display-font)',fontWeight:300,fontSize:30,color:'rgba(255,255,255,0.2)',lineHeight:1}}>–</span>
                <span style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:46,color:'white',minWidth:36,textAlign:'center',lineHeight:1,textShadow:'0 0 20px rgba(255,255,255,0.25)'}}>{liveScore[1]}</span>
              </div>
              <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
                <Flag code="fr" size={50}/>
                <span style={{fontFamily:'var(--display-font)',fontWeight:800,fontSize:15,color:'white',textTransform:'uppercase',letterSpacing:'0.06em',textAlign:'center'}}>France</span>
              </div>
            </div>
            {/* My pick vs live */}
            <div style={{marginTop:14,padding:'10px 14px',borderRadius:12,
              background:isExact?'rgba(0,255,136,0.08)':isResult?'rgba(0,212,255,0.06)':'rgba(255,255,255,0.04)',
              border:isExact?'1px solid rgba(0,255,136,0.3)':isResult?'1px solid rgba(0,212,255,0.2)':'1px solid rgba(255,255,255,0.07)',
              display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:11,color:'rgba(255,255,255,0.4)',fontFamily:'Outfit,sans-serif',fontWeight:600}}>Your pick</span>
              {myPick.saved
                ?<span style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:16,color:isExact?'#00FF88':isResult?'#00D4FF':'rgba(255,255,255,0.7)'}}>{myPick.h} – {myPick.a}</span>
                :<span style={{fontSize:11,color:'rgba(255,255,255,0.25)',fontFamily:'Outfit,sans-serif'}}>No prediction yet</span>
              }
              {myPick.saved&&<Chip label={isExact?'Exact!':isResult?'Result':'Miss'} color={isExact?'#00FF88':isResult?'#00D4FF':'rgba(255,255,255,0.4)'} glow={isExact}/>}
              {!myPick.saved&&<button onClick={()=>setScreen('predictions')} style={{background:'rgba(0,212,255,0.12)',border:'1px solid rgba(0,212,255,0.3)',color:'#00D4FF',fontSize:11,fontWeight:700,padding:'4px 12px',borderRadius:100,cursor:'pointer',fontFamily:'Outfit,sans-serif',letterSpacing:'0.06em',textTransform:'uppercase'}}>Predict</button>}
            </div>
          </div>
        </GlassCard>

        {/* Stats Row */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
          {[
            {label:'Your Rank',val:'#3',color:accentColor,sub:'of 7'},
            {label:'Points',val:'110',color:'#00D4FF',sub:'this week'},
            {label:'Streak',val:'3',icon:'flame',color:'#fbbf24',sub:'correct picks'},
          ].map(s=>(
            <GlassCard key={s.label} style={{padding:'12px 10px',textAlign:'center'}}>
              <div style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',color:'rgba(255,255,255,0.35)',fontFamily:'Outfit,sans-serif',marginBottom:4}}>{s.label}</div>
              <div style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:22,color:s.color,lineHeight:1,marginBottom:2,display:'flex',alignItems:'center',justifyContent:'center',gap:4}}>
                {s.icon&&<Icon name={s.icon} size={16} color={s.color} strokeWidth={2.4}/>}
                {s.val}
              </div>
              <div style={{fontSize:9,color:'rgba(255,255,255,0.25)',fontFamily:'Outfit,sans-serif'}}>{s.sub}</div>
            </GlassCard>
          ))}
        </div>

        {/* Next to predict */}
        <GlassCard accent={accentColor} style={{overflow:'hidden'}}>
          <NeonBar gradient={`linear-gradient(90deg,${accentColor},${accentColor}88)`}/>
          <div style={{padding:'12px 16px 14px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <div>
                <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.14em',color:accentColor,fontFamily:'Outfit,sans-serif'}}>Next to predict</div>
                <div style={{fontSize:12,color:'rgba(255,255,255,0.45)',fontFamily:'Outfit,sans-serif',marginTop:2}}>Locks in 2H 44M · Group C</div>
              </div>
              <Chip label="Open" color={accentColor}/>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
                <Flag code="mx" size={40}/>
                <span style={{fontFamily:'var(--display-font)',fontWeight:800,fontSize:13,color:'white',textTransform:'uppercase'}}>Mexico</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <ScoreStepper val={picks['m1']?.h??0} onChange={h=>setPicks(p=>({...p,m1:{...p['m1'],h,saved:false}}))} accent={accentColor}/>
                <span style={{fontFamily:'var(--display-font)',fontWeight:900,fontSize:24,color:'rgba(255,255,255,0.2)'}}>:</span>
                <ScoreStepper val={picks['m1']?.a??0} onChange={a=>setPicks(p=>({...p,m1:{...p['m1'],a,saved:false}}))} accent={accentColor}/>
              </div>
              <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
                <Flag code="za" size={40}/>
                <span style={{fontFamily:'var(--display-font)',fontWeight:800,fontSize:13,color:'white',textTransform:'uppercase'}}>S. Africa</span>
              </div>
            </div>
            <button
              onClick={()=>setPicks(p=>({...p,m1:{...p['m1'],saved:true}}))}
              style={{
                marginTop:14,width:'100%',height:42,borderRadius:12,border:'none',
                background:picks['m1']?.saved?'rgba(0,255,136,0.12)':`linear-gradient(135deg,${accentColor},${accentColor}cc)`,
                color:picks['m1']?.saved?accentColor:'#050e08',
                fontFamily:'var(--display-font)',fontWeight:800,fontSize:15,
                letterSpacing:'0.08em',textTransform:'uppercase',cursor:'pointer',
                boxShadow:picks['m1']?.saved?'none':`0 4px 20px ${accentColor}40`,
                transition:'all 0.2s',display:'flex',alignItems:'center',justifyContent:'center',gap:8,
              }}>
              {picks['m1']?.saved?'Saved — Tap to edit':'Lock In Prediction'}
            </button>
          </div>
        </GlassCard>

        {/* Leaderboard Preview */}
        <GlassCard style={{overflow:'hidden'}}>
          <div style={{padding:'14px 16px 0',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:2}}>
            <SLabel color="#fbbf24">Tech Titans</SLabel>
            <button onClick={()=>setScreen('leaderboard')} style={{background:'none',border:'none',cursor:'pointer',fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.35)',fontFamily:'Outfit,sans-serif',letterSpacing:'0.08em',textTransform:'uppercase'}}>Full table →</button>
          </div>
          {MEMBERS.slice(0,4).map((m,i)=>{
            const isMe=m.id==='me';
            return(
              <div key={m.id} style={{
                display:'flex',alignItems:'center',gap:10,padding:'10px 16px',
                borderTop:i>0?'1px solid rgba(255,255,255,0.05)':'none',
                background:isMe?'rgba(0,255,136,0.07)':'transparent',
                borderLeft:isMe?`3px solid ${accentColor}`:'3px solid transparent',
              }}>
                <div style={{width:20,textAlign:'center',fontFamily:'JetBrains Mono,monospace',fontWeight:800,fontSize:12,color:i===0?'#fbbf24':i===1?'#94a3b8':i===2?'#f97316':'rgba(255,255,255,0.35)'}}>
                  {i===0?<Icon name="crown" size={14} color="#fbbf24" fill="#fbbf24" strokeWidth={1.8}/>:i+1}
                </div>
                <Avatar name={m.name} size={30} you={isMe}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:700,color:isMe?accentColor:'rgba(255,255,255,0.9)',fontFamily:'Outfit,sans-serif',display:'flex',alignItems:'center',gap:6}}>
                    {m.name}{isMe&&<span style={{fontSize:9,fontWeight:700,color:accentColor,background:`${accentColor}18`,border:`1px solid ${accentColor}30`,borderRadius:100,padding:'2px 6px',letterSpacing:'0.08em'}}>YOU</span>}
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:3}}>
                  {m.delta!==0&&<span style={{fontSize:10,color:m.delta>0?'#00FF88':'#f87171',fontWeight:700}}>{m.delta>0?'↑':'↓'}{Math.abs(m.delta)}</span>}
                  <span style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:20,color:isMe?accentColor:'white'}}>{m.pts}</span>
                </div>
              </div>
            );
          })}
          <div style={{padding:'10px 16px',borderTop:'1px solid rgba(255,255,255,0.05)'}}>
            <button onClick={()=>setScreen('leaderboard')} style={{
              width:'100%',height:38,borderRadius:10,border:'1px solid rgba(255,255,255,0.1)',
              background:'rgba(255,255,255,0.04)',color:'rgba(255,255,255,0.6)',
              fontFamily:'var(--display-font)',fontWeight:700,fontSize:13,
              letterSpacing:'0.1em',textTransform:'uppercase',cursor:'pointer',
            }}>View Full Leaderboard</button>
          </div>
        </GlassCard>

      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  SCREEN 2 — PREDICTIONS
// ══════════════════════════════════════════════════════════
function MatchPredCard({match,pick,onSave,onClear,tweaks}){
  const locked=match.lock==='LOCKED';
  const [saving,setSaving]=useS(false);
  const ac=tweaks.accentColor;

  function doSave(){
    if(pick.h==null||pick.a==null)return;
    setSaving(true);
    setTimeout(()=>{setSaving(false);onSave();},700);
  }

  return(
    <GlassCard accent={!locked&&pick.saved?ac:undefined} style={{overflow:'hidden',marginBottom:10}}>
      {!locked&&!pick.saved&&<NeonBar gradient={`linear-gradient(90deg,${ac}66,${ac}22)`}/>}
      <div style={{padding:'14px 16px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <Flag code={match.hc} size={30}/>
            <span style={{fontFamily:'var(--display-font)',fontWeight:800,fontSize:17,color:'white',textTransform:'uppercase',letterSpacing:'0.04em'}}>
              {match.home.split(' ')[0]} <span style={{color:'rgba(255,255,255,0.3)',fontWeight:400}}>vs</span> {match.away.split(' ')[0]}
            </span>
            <Flag code={match.ac} size={30}/>
          </div>
          {locked
            ?<Chip label="Locked" color="rgba(255,255,255,0.4)"/>
            :pick.saved?<Chip label="Saved" color={ac} glow={true}/>
            :match.lock?<Chip label={match.lock} color="#fbbf24"/>
            :<span/>
          }
        </div>

        {locked?(
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:14,padding:'8px 0'}}>
            <div style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:32,color:'rgba(255,255,255,0.5)'}}>{pick.h??'–'}</div>
            <div style={{fontFamily:'var(--display-font)',fontSize:24,color:'rgba(255,255,255,0.2)',fontWeight:300}}>–</div>
            <div style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:32,color:'rgba(255,255,255,0.5)'}}>{pick.a??'–'}</div>
          </div>
        ):(
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:14}}>
            <ScoreStepper val={pick.h??0} onChange={h=>onClear({h})} disabled={locked} accent={ac}/>
            <span style={{fontFamily:'var(--display-font)',fontWeight:900,fontSize:26,color:'rgba(255,255,255,0.18)'}}>:</span>
            <ScoreStepper val={pick.a??0} onChange={a=>onClear({a})} disabled={locked} accent={ac}/>
          </div>
        )}

        {!locked&&(
          <div style={{marginTop:12,display:'flex',alignItems:'center',gap:8}}>
            {pick.saved?(
              <>
                <div style={{flex:1,fontSize:12,color:ac,fontWeight:600,fontFamily:'Outfit,sans-serif',display:'flex',alignItems:'center',gap:6}}>
                  <Icon name="check" size={13} color={ac} strokeWidth={3}/>Prediction locked in
                </div>
                <button onClick={()=>onClear({saved:false})} style={{background:'none',border:'1px solid rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.4)',fontSize:11,fontWeight:700,padding:'5px 14px',borderRadius:100,cursor:'pointer',fontFamily:'Outfit,sans-serif',textTransform:'uppercase',letterSpacing:'0.08em'}}>Edit</button>
              </>
            ):(
              <button onClick={doSave} disabled={saving} style={{
                flex:1,height:40,borderRadius:11,border:'none',
                background:saving?`${ac}30`:`linear-gradient(135deg,${ac},${ac}99)`,
                color:saving?ac:'#050e08',fontFamily:'var(--display-font)',
                fontWeight:800,fontSize:14,letterSpacing:'0.1em',textTransform:'uppercase',
                cursor:'pointer',transition:'all 0.2s',
                boxShadow:saving?'none':`0 4px 16px ${ac}35`,
              }}>{saving?'Saving…':'Save Prediction'}</button>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

function PredictionsScreen({picks,setPicks,tweaks}){
  const upcoming=MATCHES.filter(m=>m.lock!=='LOCKED');
  const locked=MATCHES.filter(m=>m.lock==='LOCKED');

  function patchPick(id,patch){
    setPicks(p=>({...p,[id]:{h:0,a:0,saved:false,...p[id],...patch}}));
  }

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <StatusBar/>
      <ScreenHeader title="My Predictions" action={
        <button onClick={()=>setScreen('tournament')} style={{display:'flex',alignItems:'center',gap:6,padding:'7px 12px',borderRadius:100,background:'rgba(139,92,246,0.14)',border:'1px solid rgba(139,92,246,0.3)',color:'#a78bfa',fontSize:10,fontWeight:700,fontFamily:'Outfit,sans-serif',textTransform:'uppercase',letterSpacing:'0.08em',cursor:'pointer',backdropFilter:'blur(10px)'}}>
          <Icon name="target" size={13} color="#a78bfa" strokeWidth={2.2}/>Tournament
        </button>
      }/>
      <div style={{flex:1,overflowY:'auto',padding:'4px 14px 90px'}}>
        <SLabel count={upcoming.length}>Upcoming</SLabel>
        {upcoming.map(m=>(
          <MatchPredCard key={m.id} match={m}
            pick={picks[m.id]||{h:0,a:0,saved:false}}
            onSave={()=>patchPick(m.id,{saved:true})}
            onClear={patch=>patchPick(m.id,{...patch,saved:false})}
            tweaks={tweaks}/>
        ))}
        <div style={{marginTop:6,marginBottom:10}}>
          <SLabel color="rgba(255,255,255,0.3)" count={locked.length}>Locked</SLabel>
        </div>
        {locked.map(m=>(
          <MatchPredCard key={m.id} match={m}
            pick={picks[m.id]||{h:2,a:1,saved:true}}
            onSave={()=>{}} onClear={()=>{}}
            tweaks={tweaks}/>
        ))}
        <div style={{marginTop:12,padding:'12px 14px',borderRadius:14,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',display:'flex',gap:14,alignItems:'center'}}>
          <div style={{textAlign:'center',flex:1}}>
            <div style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:22,color:'#00FF88'}}>+25</div>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.3)',fontFamily:'Outfit,sans-serif',marginTop:2,textTransform:'uppercase',letterSpacing:'0.1em'}}>Exact Score</div>
          </div>
          <div style={{width:1,height:36,background:'rgba(255,255,255,0.08)'}}/>
          <div style={{textAlign:'center',flex:1}}>
            <div style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:22,color:'#00D4FF'}}>+10</div>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.3)',fontFamily:'Outfit,sans-serif',marginTop:2,textTransform:'uppercase',letterSpacing:'0.1em'}}>Correct Result</div>
          </div>
          <div style={{width:1,height:36,background:'rgba(255,255,255,0.08)'}}/>
          <div style={{textAlign:'center',flex:1}}>
            <div style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:22,color:'#f87171'}}>+0</div>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.3)',fontFamily:'Outfit,sans-serif',marginTop:2,textTransform:'uppercase',letterSpacing:'0.1em'}}>Wrong</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  SCREEN 3 — SCHEDULE
// ══════════════════════════════════════════════════════════
function ScheduleScreen({picks,setScreen,tweaks}){
  const [tab,setTab]=useS('today');
  const byDate={
    today:MATCHES.filter(m=>m.date==='Today'),
    tomorrow:MATCHES.filter(m=>m.date==='Tomorrow'),
    past:MATCHES.filter(m=>m.date==='Yesterday'),
  };
  const shown=byDate[tab]||[];
  const ac=tweaks.accentColor;

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <StatusBar/>
      <ScreenHeader title="Schedule"/>
      <div style={{padding:'0 14px 10px',flexShrink:0,display:'flex',gap:6}}>
        {[['today','Today'],['tomorrow','Tomorrow'],['past','Past']].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{
            flex:1,height:34,borderRadius:10,border:tab===k?`1px solid ${ac}40`:'1px solid rgba(255,255,255,0.09)',
            background:tab===k?`${ac}14`:'rgba(255,255,255,0.04)',
            color:tab===k?ac:'rgba(255,255,255,0.45)',fontFamily:'var(--display-font)',
            fontWeight:700,fontSize:13,letterSpacing:'0.08em',textTransform:'uppercase',cursor:'pointer',
            transition:'all 0.18s',
          }}>{l}</button>
        ))}
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'4px 14px 90px'}}>
        {shown.length===0&&<div style={{textAlign:'center',padding:'40px 0',color:'rgba(255,255,255,0.2)',fontFamily:'Outfit,sans-serif',fontSize:14}}>No matches</div>}
        {shown.map((m,i)=>{
          const p=picks[m.id];
          const locked=m.lock==='LOCKED';
          return(
            <GlassCard key={m.id} style={{marginBottom:10,padding:'14px 16px'}} onClick={!locked?()=>setScreen('predictions'):undefined}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,flex:1}}>
                  <Flag code={m.hc} size={36}/>
                  <span style={{fontFamily:'var(--display-font)',fontWeight:800,fontSize:14,color:'white',textTransform:'uppercase'}}>{m.home.split(' ')[0]}</span>
                </div>
                <div style={{textAlign:'center',minWidth:80}}>
                  <div style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:22,color:'white',letterSpacing:'0.04em'}}>{m.time}</div>
                  <div style={{fontSize:10,color:'rgba(255,255,255,0.3)',fontFamily:'Outfit,sans-serif',marginTop:3,textTransform:'uppercase',letterSpacing:'0.1em'}}>Group {m.group}</div>
                  {p?.saved&&<div style={{marginTop:5,fontSize:11,fontWeight:700,color:ac,fontFamily:'JetBrains Mono,monospace'}}>My pick: {p.h}–{p.a}</div>}
                  {!p?.saved&&!locked&&<div style={{marginTop:6}}><Chip label="Predict" color={ac}/></div>}
                  {locked&&<div style={{marginTop:4}}><Chip label="Locked" color="rgba(255,255,255,0.35)"/></div>}}
                </div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,flex:1}}>
                  <Flag code={m.ac} size={36}/>
                  <span style={{fontFamily:'var(--display-font)',fontWeight:800,fontSize:14,color:'white',textTransform:'uppercase'}}>{m.away.split(' ')[0]}</span>
                </div>
              </div>
              <div style={{marginTop:10,paddingTop:10,borderTop:'1px solid rgba(255,255,255,0.06)',fontSize:11,color:'rgba(255,255,255,0.3)',fontFamily:'Outfit,sans-serif'}}>{m.venue}</div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  SCREEN 4 — STANDINGS
// ══════════════════════════════════════════════════════════
function GroupTable({name,teams,tweaks}){
  const ac=tweaks.accentColor;
  const qualified=teams.filter(t=>t.adv);
  const rest=teams.filter(t=>!t.adv);
  const Row=({t,i})=>(
    <div style={{display:'flex',alignItems:'center',gap:10,padding:'9px 14px',
      background:i%2===0?'rgba(255,255,255,0.015)':'transparent',
      borderTop:i>0?'1px solid rgba(255,255,255,0.05)':'none'}}>
      <div style={{width:18,fontFamily:'JetBrains Mono,monospace',fontWeight:800,fontSize:12,
        color:t.adv?ac:'rgba(255,255,255,0.35)',textAlign:'center'}}>{i+1}</div>
      <Flag code={t.code} size={24}/>
      <div style={{flex:1,fontFamily:'var(--display-font)',fontWeight:700,fontSize:16,
        color:t.adv?'white':'rgba(255,255,255,0.65)',textTransform:'uppercase',letterSpacing:'0.04em'}}>{t.team}</div>
      <div style={{display:'flex',gap:12,alignItems:'center'}}>
        <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:13,color:'rgba(255,255,255,0.45)',width:14,textAlign:'center'}}>{t.p}</span>
        <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:13,color:'rgba(255,255,255,0.45)',width:26,textAlign:'center'}}>{t.gd}</span>
        <span style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:15,color:t.adv?ac:'rgba(255,255,255,0.75)',width:22,textAlign:'right'}}>{t.pts}</span>
      </div>
    </div>
  );
  return(
    <GlassCard style={{overflow:'hidden',marginBottom:14}}>
      <NeonBar gradient={`linear-gradient(90deg,${ac}66,transparent)`}/>
      <div style={{padding:'10px 14px 6px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
        <span style={{fontFamily:'var(--display-font)',fontWeight:800,fontSize:18,color:'white',textTransform:'uppercase',letterSpacing:'0.08em'}}>Group {name}</span>
        <div style={{display:'flex',gap:16}}>
          {['P','GD','Pts'].map(h=><span key={h} style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',color:'rgba(255,255,255,0.25)',fontFamily:'Outfit,sans-serif'}}>{h}</span>)}
        </div>
      </div>
      {qualified.map((t,i)=><Row key={t.team} t={t} i={i}/>)}
      <ZoneLine label="Knockout Progression Zone"/>
      {rest.map((t,i)=><Row key={t.team} t={t} i={qualified.length+i}/>)}
    </GlassCard>
  );
}

function StandingsScreen({tweaks}){
  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <StatusBar/>
      <ScreenHeader title="Standings" action={
        <button onClick={()=>setScreen('bracket')} style={{display:'flex',alignItems:'center',gap:6,padding:'7px 12px',borderRadius:100,background:'rgba(251,191,36,0.14)',border:'1px solid rgba(251,191,36,0.3)',color:'#fbbf24',fontSize:10,fontWeight:700,fontFamily:'Outfit,sans-serif',textTransform:'uppercase',letterSpacing:'0.08em',cursor:'pointer',backdropFilter:'blur(10px)'}}>
          <Icon name="trophy" size={13} color="#fbbf24" strokeWidth={2.2}/>Bracket
        </button>
      }/>
      <div style={{flex:1,overflowY:'auto',padding:'4px 14px 90px'}}>
        <GroupTable name="A" teams={STANDINGS_A} tweaks={tweaks}/>
        <GroupTable name="B" teams={STANDINGS_B} tweaks={tweaks}/>
        <GlassCard style={{padding:'16px',textAlign:'center',opacity:0.5}}>
          <div style={{fontSize:13,color:'rgba(255,255,255,0.3)',fontFamily:'Outfit,sans-serif'}}>Groups C–H · Results coming soon</div>
        </GlassCard>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  SCREEN 5 — LEADERBOARD
// ══════════════════════════════════════════════════════════
function LeaderboardScreen({tweaks,setScreen}){
  const [selected,setSelected]=useS(null);
  const ac=tweaks.accentColor;
  const RANK_COLORS=['#fbbf24','#94a3b8','#f97316'];
  const RANK_LABELS=['1st','2nd','3rd'];

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <StatusBar/>
      <div style={{padding:'6px 16px 0',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div/>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.14em',color:'rgba(255,255,255,0.35)',fontFamily:'Outfit,sans-serif'}}>Group</div>
          <div style={{fontFamily:'var(--display-font)',fontWeight:900,fontSize:24,color:'white',letterSpacing:'0',lineHeight:1.1,whiteSpace:'nowrap'}}>Tech Titans</div>
        </div>
        <IconBtn onClick={()=>setScreen('chat')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </IconBtn>
      </div>
      {/* Top 3 podium */}
      <div style={{padding:'16px 14px 12px',display:'flex',alignItems:'flex-end',justifyContent:'center',gap:10,flexShrink:0}}>
        {[MEMBERS[1],MEMBERS[0],MEMBERS[2]].map((m,pos)=>{
          const heights=[110,130,95];
          const actualRank=pos===0?2:pos===1?1:3;
          const isMe=m.id==='me';
          return(
            <div key={m.id} onClick={()=>setSelected(m===selected?null:m)} style={{
              flex:1,display:'flex',flexDirection:'column',alignItems:'center',
              height:heights[pos],justifyContent:'flex-end',cursor:'pointer',
            }}>
              {actualRank===1&&<div style={{marginBottom:4}}><Icon name="crown" size={20} color="#fbbf24" fill="#fbbf24" strokeWidth={1.8}/></div>}
              <Avatar name={m.name} size={pos===1?52:42} ring={pos===1?RANK_COLORS[0]:undefined} you={isMe}/>
              <div style={{
                marginTop:6,width:'100%',borderRadius:'10px 10px 0 0',
                height:pos===0?60:pos===1?80:50,
                background:pos===1?`rgba(251,191,36,0.12)`:`rgba(255,255,255,0.05)`,
                border:`1px solid ${pos===1?'rgba(251,191,36,0.25)':'rgba(255,255,255,0.08)'}`,
                borderBottom:'none',display:'flex',flexDirection:'column',
                alignItems:'center',justifyContent:'center',gap:2,
              }}>
                <div style={{fontFamily:'var(--display-font)',fontWeight:800,fontSize:13,color:'white',textTransform:'uppercase'}}>{m.name}</div>
                <div style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:18,color:pos===1?RANK_COLORS[0]:isMe?ac:'white'}}>{m.pts}</div>
                <div style={{fontSize:9,color:RANK_COLORS[actualRank-1]||'rgba(255,255,255,0.4)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',fontFamily:'Outfit,sans-serif'}}>{RANK_LABELS[actualRank-1]}</div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Rest of list */}
      <div style={{flex:1,overflowY:'auto',padding:'0 14px 90px'}}>
        <GlassCard style={{overflow:'hidden'}}>
          {MEMBERS.slice(3).map((m,i)=>{
            const isMe=m.id==='me';
            const rank=i+4;
            return(
              <div key={m.id} onClick={()=>setSelected(m===selected?null:m)} style={{
                display:'flex',alignItems:'center',gap:12,padding:'12px 16px',
                borderTop:i>0?'1px solid rgba(255,255,255,0.05)':'none',
                background:isMe?`${ac}09`:'transparent',
                borderLeft:isMe?`3px solid ${ac}`:'3px solid transparent',
                cursor:'pointer',transition:'background 0.15s',
              }}
              onMouseEnter={e=>!isMe&&(e.currentTarget.style.background='rgba(255,255,255,0.04)')}
              onMouseLeave={e=>!isMe&&(e.currentTarget.style.background='transparent')}
              >
                <div style={{width:24,fontFamily:'JetBrains Mono,monospace',fontWeight:800,fontSize:14,color:'rgba(255,255,255,0.35)',textAlign:'center'}}>{rank}</div>
                <Avatar name={m.name} size={36} you={isMe}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:isMe?ac:'rgba(255,255,255,0.9)',fontFamily:'Outfit,sans-serif',display:'flex',alignItems:'center',gap:6}}>
                    {m.name}
                    {isMe&&<span style={{fontSize:9,color:ac,background:`${ac}18`,border:`1px solid ${ac}30`,borderRadius:100,padding:'2px 6px',letterSpacing:'0.08em',fontWeight:700}}>YOU</span>}
                  </div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',fontFamily:'Outfit,sans-serif',display:'flex',alignItems:'center',gap:4}}>
                    <Flag code={m.code} size={12} border={false}/>
                    {m.delta!==0&&<span style={{color:m.delta>0?'#00FF88':'#f87171',fontWeight:700}}>{m.delta>0?'↑':'↓'}{Math.abs(m.delta)}</span>}
                  </div>
                </div>
                <div style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:22,color:isMe?ac:'white'}}>{m.pts}</div>
              </div>
            );
          })}
        </GlassCard>
        {selected&&(
          <GlassCard accent={ac} style={{marginTop:12,padding:'16px',animation:'fadeUp 0.25s ease-out'}}>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
              <Avatar name={selected.name} size={44} you={selected.id==='me'}/>
              <div>
                <div style={{fontFamily:'var(--display-font)',fontWeight:800,fontSize:20,color:'white',textTransform:'uppercase'}}>{selected.name}</div>
                <div style={{fontSize:12,color:'rgba(255,255,255,0.4)',fontFamily:'Outfit,sans-serif',display:'flex',alignItems:'center',gap:5}}><Flag code={selected.code} size={14} border={false}/> Rank #{selected.rank}</div>
              </div>
              <div style={{marginLeft:'auto',fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:30,color:ac}}>{selected.pts}</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
              {[{l:'Exact Scores',v:'8'},{l:'Correct Results',v:'14'},{l:'Predictions',v:'26'}].map(s=>(
                <div key={s.l} style={{textAlign:'center',padding:'8px 4px',borderRadius:10,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)'}}>
                  <div style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:18,color:ac}}>{s.v}</div>
                  <div style={{fontSize:9,color:'rgba(255,255,255,0.3)',fontFamily:'Outfit,sans-serif',textTransform:'uppercase',letterSpacing:'0.08em',marginTop:3}}>{s.l}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  SCREEN 6 — PROFILE
// ══════════════════════════════════════════════════════════
function ProfileScreen({tweaks,setScreen}){
  const ac=tweaks.accentColor;
  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <StatusBar/>
      <ScreenHeader title="Profile" onBack={()=>setScreen('dashboard')}/>
      <div style={{flex:1,overflowY:'auto',padding:'0 14px 90px'}}>
        {/* Hero */}
        <GlassCard style={{padding:'24px 20px',textAlign:'center',marginBottom:14,overflow:'hidden',position:'relative'}}>
          <div style={{position:'absolute',inset:0,background:`radial-gradient(circle at 50% 0%,${ac}18,transparent 70%)`,pointerEvents:'none'}}/>
          <Avatar name="You" size={72} ring={ac} you={true}/>
          <div style={{fontFamily:'var(--display-font)',fontWeight:900,fontSize:28,color:'white',marginTop:12,letterSpacing:'0'}}>Oran</div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,marginTop:4}}>
            <Flag code="il" size={16} border={false}/>
            <span style={{fontSize:13,color:'rgba(255,255,255,0.5)',fontFamily:'Outfit,sans-serif'}}>Israel</span>
          </div>
          <div style={{marginTop:10,display:'flex',gap:6,justifyContent:'center'}}>
            <Chip label="Tech Titans" color={ac}/>
            <span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'#f97316',background:'rgba(249,115,22,0.16)',border:'1px solid rgba(249,115,22,0.32)',borderRadius:100,padding:'4px 10px',fontFamily:'Outfit,sans-serif',backdropFilter:'blur(8px)'}}>
              <Icon name="flame" size={11} color="#f97316" strokeWidth={2.4} fill="#f9731633"/>3 Streak
            </span>
          </div>
        </GlassCard>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:14}}>
          {[{l:'Group Rank',v:'#3',c:ac},{l:'Total Points',v:'110',c:'#00D4FF'},{l:'Predictions',v:'18',c:'rgba(255,255,255,0.7)'}].map(s=>(
            <GlassCard key={s.l} style={{padding:'14px 10px',textAlign:'center'}}>
              <div style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:24,color:s.c,lineHeight:1}}>{s.v}</div>
              <div style={{fontSize:9,color:'rgba(255,255,255,0.3)',fontFamily:'Outfit,sans-serif',textTransform:'uppercase',letterSpacing:'0.1em',marginTop:5}}>{s.l}</div>
            </GlassCard>
          ))}
        </div>

        {/* Achievements */}
        <SLabel>Achievements</SLabel>
        <GlassCard style={{overflow:'hidden',marginBottom:14}}>
          {ACHIEVEMENTS.map((a,i)=>(
            <div key={a.label} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',
              borderTop:i>0?'1px solid rgba(255,255,255,0.05)':'none'}}>
              <div style={{width:38,height:38,borderRadius:12,background:`${a.color}14`,
                border:`1px solid ${a.color}28`,display:'flex',alignItems:'center',
                justifyContent:'center',flexShrink:0}}>
                <Icon name={a.icon} size={18} color={a.color}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:'white',fontFamily:'Outfit,sans-serif'}}>{a.label}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.35)',fontFamily:'Outfit,sans-serif',marginTop:2}}>{a.desc}</div>
              </div>
              <Chip label="Earned" color={a.color}/>
            </div>
          ))}
        </GlassCard>

        {/* Settings */}
        <SLabel color="rgba(255,255,255,0.35)">Settings</SLabel>
        <GlassCard style={{overflow:'hidden',marginBottom:14}}>
          {[
            {label:'My Groups',target:'groups',icon:'users',c:ac,desc:'Switch between 4 groups'},
            {label:'Trivia Challenge',target:'trivia',icon:'sparkles',c:'#8B5CF6',desc:'Earn tie-breaker bonus points'},
            {label:'Admin Panel',target:'admin',icon:'shieldCheck',c:ac,desc:'Manage Tech Titans'},
            {label:'Upgrade to Pro',target:'pricing',icon:'trophy',c:'#fbbf24',desc:'Unlock custom rules + branding'},
            {label:'Notifications',target:'notifications',icon:'bell',c:'#00D4FF',desc:'3 unread'},
            {label:'Help & Support',target:null,icon:null,c:null,desc:''},
          ].map((item,i)=>(
            <div key={item.label} onClick={()=>item.target&&setScreen(item.target)}
              style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',
              borderTop:i>0?'1px solid rgba(255,255,255,0.05)':'none',cursor:item.target?'pointer':'default'}}
              onMouseEnter={e=>item.target&&(e.currentTarget.style.background='rgba(255,255,255,0.04)')}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              {item.icon&&item.c?(
                <div style={{width:34,height:34,borderRadius:10,background:`${item.c}14`,border:`1px solid ${item.c}28`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Icon name={item.icon} size={15} color={item.c}/>
                </div>
              ):<div style={{width:34}}/>}
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,color:'white',fontFamily:'Outfit,sans-serif',fontWeight:600}}>{item.label}</div>
                {item.desc&&<div style={{fontSize:11,color:'rgba(255,255,255,0.4)',fontFamily:'Outfit,sans-serif',marginTop:2}}>{item.desc}</div>}
              </div>
              <svg width="6" height="12" viewBox="0 0 6 12" fill="none"><path d="M1 1l4 5-4 5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          ))}
        </GlassCard>

        <button onClick={()=>setScreen('welcome')} style={{width:'100%',height:44,borderRadius:14,border:'1px solid rgba(248,113,113,0.25)',
          background:'rgba(248,113,113,0.07)',color:'#f87171',fontFamily:'var(--display-font)',
          fontWeight:700,fontSize:15,letterSpacing:'0.02em',cursor:'pointer'}}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

Object.assign(window,{
  DashboardScreen,PredictionsScreen,ScheduleScreen,
  StandingsScreen,LeaderboardScreen,ProfileScreen,
  MEMBERS,ScoreStepper,
});
