// ═══════════════════════════════════════════════════════
//  Cup Clash — Extra Screens (Chat, Notifications, Bracket, Tournament Picks)
// ═══════════════════════════════════════════════════════

const {useState:useSx,useEffect:useEx,useRef:useRx}=React;
const {StatusBar:_SB,Flag:_FL,Avatar:_AV,LiveDot:_LD,GlassCard:_GC,Chip:_CH,SLabel:_SL,
  ZoneLine:_ZL,NeonBar:_NB,IconBtn:_IB,ScreenHeader:_SH,Icon:_IC}=window;

// ══════════════════════════════════════════════════════════
//  CHAT SCREEN
// ══════════════════════════════════════════════════════════
const CHAT_INIT=[
  {id:1,name:'Amit',  text:'Did NOT see that Japan goal coming 😱', time:'73\'',you:false,reactions:['🔥']},
  {id:2,name:'Sarah', text:'Called it 👀 I had Japan winning',      time:'74\'',you:false},
  {id:3,name:'You',   text:'I\'m up 15 points if ARG hold on!!!',   time:'74\'',you:true},
  {id:4,name:'Ben',   text:'Come on France equalise already',       time:'75\'',you:false,reactions:['😤']},
  {id:5,name:'Maria', text:'Brazil 2-0 Germany tonight 💪',          time:'77\'',you:false},
  {id:6,name:'You',   text:'Same! Brazil all day 🙌',                time:'77\'',you:true},
  {id:7,name:'Amit',  text:'Anyone watching together on Sunday?',    time:'78\'',you:false},
];

function ChatScreen({tweaks,setScreen}){
  const [msgs,setMsgs]=useSx(CHAT_INIT);
  const [input,setInput]=useSx('');
  const ac=tweaks.accentColor;
  const endRef=useRx(null);

  useEx(()=>{endRef.current?.scrollIntoView({behavior:'smooth',block:'end'});},[msgs.length]);

  function send(){
    const t=input.trim();if(!t)return;
    setMsgs(m=>[...m,{id:Date.now(),name:'You',text:t,time:`${80+m.length-7}'`,you:true}]);
    setInput('');
    // Auto-reply for demo
    setTimeout(()=>{
      const replies=[['Amit','Lmao for real 😂'],['Sarah','Agree 💯'],['Ben','Nahhh wait what?']];
      const r=replies[Math.floor(Math.random()*replies.length)];
      setMsgs(m=>[...m,{id:Date.now()+1,name:r[0],text:r[1],time:`${82+m.length-7}'`,you:false}]);
    },1100);
  }

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <_SB/>
      <div style={{padding:'4px 16px 10px',display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
        <_IB onClick={()=>setScreen('leaderboard')} color="#00D4FF">
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M7 1L1 7l6 6" stroke="#00D4FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </_IB>
        <div style={{flex:1}}>
          <div style={{fontFamily:'var(--display-font)',fontWeight:700,fontSize:18,color:'white',lineHeight:1}}>Tech Titans</div>
          <div style={{fontSize:11,color:ac,fontFamily:'Outfit,sans-serif',marginTop:3,display:'flex',alignItems:'center',gap:5}}>
            <_LD/>
            <span style={{fontWeight:600}}>Live chat · 5 watching</span>
          </div>
        </div>
        <_IB color="rgba(255,255,255,0.5)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </_IB>
      </div>

      {/* Live match strip */}
      <div style={{margin:'0 14px 12px',padding:'8px 12px',borderRadius:14,
        background:'rgba(0,212,255,0.08)',border:'1px solid rgba(0,212,255,0.25)',
        backdropFilter:'blur(12px)',display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
        <_LD/>
        <_FL code="ar" size={20}/>
        <span style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:13,color:'white'}}>2 – 1</span>
        <_FL code="fr" size={20}/>
        <span style={{fontSize:11,color:'rgba(255,255,255,0.6)',fontFamily:'Outfit,sans-serif',fontWeight:600}}>78'</span>
        <span style={{marginLeft:'auto',fontSize:10,color:'#00D4FF',fontFamily:'Outfit,sans-serif',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase'}}>Watch</span>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:'auto',padding:'0 14px 12px',display:'flex',flexDirection:'column',gap:10}}>
        {msgs.map((m,i)=>{
          const prev=msgs[i-1];
          const sameAuthor=prev&&prev.name===m.name;
          return(
            <div key={m.id} style={{display:'flex',gap:8,flexDirection:m.you?'row-reverse':'row',
              alignItems:'flex-end',animation:'fadeUp 0.3s ease-out'}}>
              {!m.you&&!sameAuthor&&<_AV name={m.name} size={28}/>}
              {!m.you&&sameAuthor&&<div style={{width:28,flexShrink:0}}/>}
              <div style={{maxWidth:'72%',display:'flex',flexDirection:'column',alignItems:m.you?'flex-end':'flex-start',gap:2}}>
                {!sameAuthor&&!m.you&&<span style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.45)',fontFamily:'Outfit,sans-serif',textTransform:'uppercase',letterSpacing:'0.1em',marginLeft:4}}>{m.name}</span>}
                <div style={{
                  padding:'9px 13px',borderRadius:m.you?'18px 18px 4px 18px':'18px 18px 18px 4px',
                  background:m.you?`linear-gradient(135deg,${ac}38,${ac}1a)`:'rgba(255,255,255,0.07)',
                  border:m.you?`1px solid ${ac}55`:'1px solid rgba(255,255,255,0.12)',
                  backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',
                  boxShadow:m.you?`0 4px 12px ${ac}25`:'0 2px 8px rgba(0,0,0,0.2)',
                  position:'relative',
                }}>
                  <div style={{fontSize:13.5,color:m.you?'white':'rgba(255,255,255,0.92)',fontFamily:'Outfit,sans-serif',lineHeight:1.35,fontWeight:500}}>{m.text}</div>
                  {m.reactions&&(
                    <div style={{position:'absolute',bottom:-8,right:8,background:'rgba(20,15,40,0.95)',borderRadius:12,padding:'2px 6px',fontSize:11,border:'1px solid rgba(255,255,255,0.15)'}}>{m.reactions.join('')}</div>
                  )}
                </div>
                <span style={{fontSize:9,color:'rgba(255,255,255,0.3)',fontFamily:'JetBrains Mono,monospace',fontWeight:700,padding:'0 4px'}}>{m.time}</span>
              </div>
            </div>
          );
        })}
        <div ref={endRef}/>
      </div>

      {/* Input */}
      <div style={{padding:'8px 14px 12px',flexShrink:0,display:'flex',gap:8,alignItems:'center'}}>
        <div style={{flex:1,display:'flex',alignItems:'center',gap:6,padding:'8px 14px',
          borderRadius:24,background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',
          backdropFilter:'blur(20px)'}}>
          <input value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&send()}
            placeholder="Trash talk away…"
            style={{flex:1,background:'none',border:'none',outline:'none',color:'white',
              fontSize:14,fontFamily:'Outfit,sans-serif'}}/>
          <span style={{fontSize:18,opacity:0.5,cursor:'pointer',display:'flex',alignItems:'center'}}><_IC name="smile" size={18} color="rgba(255,255,255,0.5)"/></span>
        </div>
        <button onClick={send} disabled={!input.trim()} style={{
          width:42,height:42,borderRadius:'50%',border:'none',
          background:input.trim()?`linear-gradient(135deg,${ac},${ac}aa)`:'rgba(255,255,255,0.06)',
          color:input.trim()?'#050e08':'rgba(255,255,255,0.3)',cursor:input.trim()?'pointer':'not-allowed',
          display:'flex',alignItems:'center',justifyContent:'center',
          boxShadow:input.trim()?`0 4px 14px ${ac}50`:'none',transition:'all 0.18s',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  NOTIFICATIONS SCREEN
// ══════════════════════════════════════════════════════════
const NOTIFS=[
  {id:1,type:'result',     icon:'target',     title:'You scored! +25 pts',     body:'Exact score on ARG vs FRA · 2–1',         time:'2m ago',color:'#00FF88',unread:true},
  {id:2,type:'pot',        icon:'dollar',     title:'Pot increased!',           body:'Tech Titans pot is now $240 · 5 days left',time:'1h ago',color:'#fbbf24',unread:true},
  {id:3,type:'social',     icon:'trendingUp', title:'Amit overtook you',        body:'Now leading the group by 35 pts',        time:'2h ago',color:'#f87171',unread:true},
  {id:4,type:'invite',     icon:'shieldCheck',title:'Sarah locked in her picks',body:'BRA vs GER predictions are in',          time:'3h ago',color:'#00D4FF'},
  {id:5,type:'reminder',   icon:'clock',      title:'2 unpredicted matches',    body:'MEX vs RSA locks in 2H 44M',             time:'4h ago',color:'#fbbf24'},
  {id:6,type:'achievement',icon:'trophy',     title:'Streak unlocked!',         body:'3 correct picks in a row · +10 bonus',  time:'1d ago',color:'#8B5CF6'},
  {id:7,type:'social',     icon:'message',    title:'New message in Tech Titans',body:'Ben: "Come on France equalise already"',time:'1d ago',color:'rgba(255,255,255,0.6)'},
];

function NotificationsScreen({tweaks,setScreen}){
  const [notifs,setNotifs]=useSx(NOTIFS);
  const unreadCount=notifs.filter(n=>n.unread).length;
  const ac=tweaks.accentColor;

  function markAllRead(){setNotifs(n=>n.map(x=>({...x,unread:false})));}

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <_SB/>
      <_SH title="Notifications" onBack={()=>setScreen('dashboard')}
        action={
          unreadCount>0?
          <button onClick={markAllRead} style={{background:'none',border:'none',cursor:'pointer',
            fontSize:11,fontWeight:700,color:ac,fontFamily:'Outfit,sans-serif',
            textTransform:'uppercase',letterSpacing:'0.08em'}}>Mark all read</button>
          :<div style={{width:36}}/>
        }/>
      <div style={{flex:1,overflowY:'auto',padding:'2px 14px 90px',display:'flex',flexDirection:'column',gap:8}}>
        {unreadCount>0&&(
          <div style={{padding:'8px 14px',borderRadius:12,background:`${ac}10`,border:`1px solid ${ac}30`,
            display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:ac,boxShadow:`0 0 8px ${ac}`}}/>
            <span style={{fontSize:12,color:ac,fontFamily:'Outfit,sans-serif',fontWeight:600}}>{unreadCount} new</span>
          </div>
        )}
        {notifs.map(n=>(
          <_GC key={n.id} style={{padding:'12px 14px',position:'relative',
            opacity:n.unread?1:0.7,
            background:n.unread?undefined:'rgba(18,14,38,0.28)'}}>
            <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
              <div style={{width:42,height:42,borderRadius:13,background:`${n.color}18`,
                border:`1px solid ${n.color}35`,display:'flex',alignItems:'center',
                justifyContent:'center',flexShrink:0}}>
                <_IC name={n.icon} size={19} color={n.color}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:6}}>
                  <span style={{fontSize:13.5,fontWeight:700,color:'white',fontFamily:'Outfit,sans-serif'}}>{n.title}</span>
                  <span style={{fontSize:10,color:'rgba(255,255,255,0.35)',fontFamily:'Outfit,sans-serif',fontWeight:600,whiteSpace:'nowrap'}}>{n.time}</span>
                </div>
                <div style={{fontSize:12,color:'rgba(255,255,255,0.55)',fontFamily:'Outfit,sans-serif',marginTop:3,lineHeight:1.4}}>{n.body}</div>
              </div>
              {n.unread&&<div style={{width:8,height:8,borderRadius:'50%',background:n.color,
                boxShadow:`0 0 8px ${n.color}`,flexShrink:0,marginTop:6}}/>}
            </div>
          </_GC>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  KNOCKOUT BRACKET SCREEN
// ══════════════════════════════════════════════════════════
const BRACKET={
  r16:[
    {h:'Argentina',hc:'ar',hs:3,a:'Australia', ac:'au',as:0,date:'Sat 13 Jun'},
    {h:'France',   hc:'fr',hs:2,a:'Senegal',   ac:'sn',as:1,date:'Sat 13 Jun'},
    {h:'Brazil',   hc:'br',hs:4,a:'South Korea',ac:'kr',as:1,date:'Sun 14 Jun'},
    {h:'Germany',  hc:'de',hs:1,a:'Switzerland',ac:'ch',as:1,date:'Sun 14 Jun',pen:[4,3]},
    {h:'Mexico',   hc:'mx',hs:null,a:'USA',    ac:'us',as:null,date:'Mon 15 Jun',live:true},
    {h:'Netherlands',hc:'nl',hs:null,a:'Japan',ac:'jp',as:null,date:'Mon 15 Jun'},
    {h:'Spain',    hc:'es',hs:null,a:'Morocco',ac:'ma',as:null,date:'Tue 16 Jun'},
    {h:'Portugal', hc:'pt',hs:null,a:'Uruguay',ac:'uy',as:null,date:'Tue 16 Jun'},
  ],
};

function BracketScreen({tweaks,setScreen}){
  const ac=tweaks.accentColor;
  const [selected,setSelected]=useSx(null);

  function MatchSlot({m,idx}){
    const played=m.hs!=null;
    const winner=played?(m.hs>m.as?'h':m.hs<m.as?'a':null):null;
    return(
      <_GC accent={m.live?'#00D4FF':selected===idx?ac:undefined}
        style={{padding:'10px 12px',marginBottom:8,cursor:'pointer'}}
        onClick={()=>setSelected(idx===selected?null:idx)}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
          <span style={{fontSize:9,fontWeight:700,color:m.live?'#00D4FF':'rgba(255,255,255,0.35)',
            textTransform:'uppercase',letterSpacing:'0.12em',fontFamily:'Outfit,sans-serif',
            display:'flex',alignItems:'center',gap:5}}>
            {m.live&&<_LD/>}{m.live?'Live now':m.date}
          </span>
          {played&&m.pen&&<span style={{fontSize:9,color:'rgba(255,255,255,0.4)',fontFamily:'Outfit,sans-serif',fontWeight:600}}>Pens {m.pen[0]}-{m.pen[1]}</span>}
        </div>
        {[[m.h,m.hc,m.hs,'h'],[m.a,m.ac,m.as,'a']].map(([n,c,sc,k])=>(
          <div key={k} style={{display:'flex',alignItems:'center',gap:8,padding:'4px 0',
            opacity:winner&&winner!==k?0.4:1}}>
            <_FL code={c} size={22}/>
            <span style={{flex:1,fontFamily:'var(--display-font)',fontWeight:winner===k?700:500,fontSize:14,color:'white'}}>{n}</span>
            <span style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:16,
              color:sc==null?'rgba(255,255,255,0.2)':winner===k?ac:'rgba(255,255,255,0.7)',minWidth:18,textAlign:'right'}}>
              {sc==null?'–':sc}
            </span>
          </div>
        ))}
      </_GC>
    );
  }

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <_SB/>
      <_SH title="Knockouts" onBack={()=>setScreen('standings')}/>
      <div style={{flex:1,overflowY:'auto',padding:'4px 14px 90px'}}>
        {/* Trophy band */}
        <_GC style={{padding:'14px 16px',marginBottom:14,textAlign:'center',overflow:'hidden',position:'relative'}}>
          <div style={{position:'absolute',inset:0,background:`radial-gradient(circle at 50% 0%,${ac}22,transparent 70%)`,pointerEvents:'none'}}/>
          <div style={{marginBottom:8,display:'flex',justifyContent:'center'}}>
            <_IC name="trophy" size={40} color="#fbbf24" strokeWidth={1.8}/>
          </div>
          <div style={{fontFamily:'var(--display-font)',fontWeight:700,fontSize:24,color:'white',lineHeight:1.1,letterSpacing:'0'}}>Road to the Final</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.45)',fontFamily:'Outfit,sans-serif',marginTop:6,fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase'}}>Round of 16 · MetLife Stadium</div>
        </_GC>

        <_SL color={ac}>Round of 16</_SL>
        {BRACKET.r16.map((m,i)=><MatchSlot key={i} m={m} idx={i}/>)}

        <_SL color="rgba(255,255,255,0.4)">Quarter Finals · Coming up</_SL>
        <_GC style={{padding:'16px',textAlign:'center',opacity:0.5}}>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.4)',fontFamily:'Outfit,sans-serif'}}>Locks once R16 completes</div>
        </_GC>

        {/* Your bracket score */}
        <div style={{marginTop:14,padding:'14px 16px',borderRadius:18,
          background:`linear-gradient(135deg,${ac}14,rgba(11,16,30,0.4))`,
          border:`1px solid ${ac}35`,backdropFilter:'blur(24px)',
          display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:50,height:50,borderRadius:14,background:`${ac}18`,border:`1px solid ${ac}38`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <_IC name="target" size={26} color={ac}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:12,color:ac,fontFamily:'Outfit,sans-serif',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em'}}>Your bracket</div>
            <div style={{fontFamily:'var(--display-font)',fontWeight:700,fontSize:18,color:'white',marginTop:2}}>3/4 R16 picks correct</div>
          </div>
          <div style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:30,color:ac}}>+75</div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  TOURNAMENT PICKS SCREEN
// ══════════════════════════════════════════════════════════
const WINNERS=['Argentina','Brazil','France','Germany','Spain','Portugal','England','Netherlands'];
const WINNER_CODES={'Argentina':'ar','Brazil':'br','France':'fr','Germany':'de','Spain':'es','Portugal':'pt','England':'gb-eng','Netherlands':'nl'};
const SCORERS=[
  {name:'Lionel Messi',country:'ar',odds:'+550',pop:'42%'},
  {name:'Kylian Mbappé',country:'fr',odds:'+400',pop:'31%'},
  {name:'Erling Haaland',country:'no',odds:'+700',pop:'18%'},
  {name:'Vinícius Jr.',country:'br',odds:'+650',pop:'22%'},
  {name:'Harry Kane',country:'gb-eng',odds:'+900',pop:'9%'},
];

function TournamentPicksScreen({tweaks,setScreen}){
  const ac=tweaks.accentColor;
  // Load persisted picks from localStorage
  const stored=(()=>{try{return JSON.parse(localStorage.getItem('cc_tournament_picks')||'{}');}catch{return{};}})();
  const [winner,setWinner]=useSx(stored.winner||'Brazil');
  const [scorer,setScorer]=useSx(stored.scorer||'Kylian Mbappé');
  const [darkHorse,setDarkHorse]=useSx(stored.darkHorse||'Morocco');
  const [locked,setLocked]=useSx(!!stored.locked);
  const [saving,setSaving]=useSx(false);

  const darkHorses=['Morocco','Senegal','Japan','South Korea','USA'];

  function lockPicks(){
    setSaving(true);
    setTimeout(()=>{
      const data={winner,scorer,darkHorse,locked:true,lockedAt:Date.now()};
      try{localStorage.setItem('cc_tournament_picks',JSON.stringify(data));}catch{}
      setLocked(true);
      setSaving(false);
    },650);
  }
  function unlock(){
    setLocked(false);
    try{const d=JSON.parse(localStorage.getItem('cc_tournament_picks')||'{}');localStorage.setItem('cc_tournament_picks',JSON.stringify({...d,locked:false}));}catch{}
  }

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <_SB/>
      <_SH title="Tournament Picks" onBack={()=>setScreen('predictions')}/>
      <div style={{flex:1,overflowY:'auto',padding:'2px 14px 90px'}}>
        <_GC accent={ac} style={{padding:'14px 16px',marginBottom:14,overflow:'hidden',position:'relative'}}>
          <div style={{position:'absolute',inset:0,background:`radial-gradient(circle at 80% 0%,${ac}22,transparent 70%)`,pointerEvents:'none'}}/>
          <div style={{fontSize:11,fontWeight:700,color:ac,fontFamily:'Outfit,sans-serif',textTransform:'uppercase',letterSpacing:'0.12em'}}>One-time picks</div>
          <div style={{fontFamily:'var(--display-font)',fontWeight:700,fontSize:22,color:'white',marginTop:4,lineHeight:1.15,letterSpacing:'0'}}>Big swings, big points</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.55)',fontFamily:'Outfit,sans-serif',marginTop:6,lineHeight:1.4}}>Lock these before kick-off. Cannot be changed once the tournament starts.</div>
        </_GC>

        {/* WINNER */}
        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
          <_IC name="trophy" size={14} color="#fbbf24" strokeWidth={2.2}/>
          <_SL color="#fbbf24">Tournament Winner · +100 pts</_SL>
        </div>
        <_GC style={{padding:'12px 14px',marginBottom:14}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {WINNERS.map(team=>{
              const on=winner===team;
              return(
                <button key={team} onClick={()=>setWinner(team)} style={{
                  display:'flex',alignItems:'center',gap:8,padding:'9px 11px',borderRadius:11,
                  background:on?`${ac}18`:'rgba(255,255,255,0.04)',
                  border:on?`1.5px solid ${ac}55`:'1px solid rgba(255,255,255,0.08)',
                  cursor:'pointer',transition:'all 0.18s',
                  boxShadow:on?`0 0 12px ${ac}30`:'none',
                }}>
                  <_FL code={WINNER_CODES[team]} size={22}/>
                  <span style={{fontFamily:'Outfit,sans-serif',fontWeight:on?700:500,fontSize:12.5,color:on?'white':'rgba(255,255,255,0.7)',textAlign:'left',flex:1}}>{team}</span>
                  {on&&<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ac} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </button>
              );
            })}
          </div>
        </_GC>

        {/* TOP SCORER */}
        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
          <_IC name="target" size={14} color="#00D4FF" strokeWidth={2.2}/>
          <_SL color="#00D4FF">Top Scorer · +75 pts</_SL>
        </div>
        <_GC style={{overflow:'hidden',marginBottom:14}}>
          {SCORERS.map((s,i)=>{
            const on=scorer===s.name;
            return(
              <div key={s.name} onClick={()=>setScorer(s.name)} style={{
                display:'flex',alignItems:'center',gap:11,padding:'10px 14px',
                borderTop:i>0?'1px solid rgba(255,255,255,0.05)':'none',
                background:on?`${ac}10`:'transparent',
                borderLeft:on?`3px solid ${ac}`:'3px solid transparent',
                cursor:'pointer',transition:'all 0.18s',
              }}>
                <_FL code={s.country} size={28}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:13.5,fontWeight:700,color:on?ac:'white',fontFamily:'Outfit,sans-serif'}}>{s.name}</div>
                  <div style={{fontSize:10.5,color:'rgba(255,255,255,0.4)',fontFamily:'Outfit,sans-serif',marginTop:1,fontWeight:500}}>{s.pop} of group picked this</div>
                </div>
                <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:12,color:'rgba(255,255,255,0.5)',fontWeight:700}}>{s.odds}</span>
                {on&&<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ac} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
            );
          })}
        </_GC>

        {/* DARK HORSE */}
        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
          <_IC name="sparkles" size={14} color="#8B5CF6" strokeWidth={2.2}/>
          <_SL color="#8B5CF6">Dark Horse · +150 pts if they make QF</_SL>
        </div>
        <_GC style={{padding:'12px 14px',marginBottom:14}}>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {darkHorses.map(team=>{
              const on=darkHorse===team;
              return(
                <button key={team} onClick={()=>setDarkHorse(team)} style={{
                  display:'flex',alignItems:'center',gap:6,padding:'8px 12px',borderRadius:100,
                  background:on?'rgba(139,92,246,0.18)':'rgba(255,255,255,0.04)',
                  border:on?'1.5px solid rgba(139,92,246,0.55)':'1px solid rgba(255,255,255,0.08)',
                  cursor:'pointer',transition:'all 0.18s',
                  boxShadow:on?'0 0 12px rgba(139,92,246,0.3)':'none',
                }}>
                  <_FL code={team==='Morocco'?'ma':team==='Senegal'?'sn':team==='Japan'?'jp':team==='South Korea'?'kr':'us'} size={18}/>
                  <span style={{fontFamily:'Outfit,sans-serif',fontWeight:on?700:500,fontSize:12,color:on?'white':'rgba(255,255,255,0.75)'}}>{team}</span>
                </button>
              );
            })}
          </div>
        </_GC>

        {/* SAVE / LOCKED state */}
        {locked?(
          <_GC accent={ac} style={{padding:'16px 18px',marginBottom:10,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',inset:0,background:`radial-gradient(circle at 50% 0%,${ac}25,transparent 70%)`,pointerEvents:'none'}}/>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:42,height:42,borderRadius:12,background:`${ac}20`,border:`1px solid ${ac}45`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <_IC name="lock" size={20} color={ac}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontFamily:'var(--display-font)',fontWeight:800,fontSize:16,color:'white'}}>Picks Locked In</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',fontFamily:'Outfit,sans-serif',marginTop:2}}>Earn up to <strong style={{color:ac}}>+325 pts</strong> if all hit</div>
              </div>
              <button onClick={unlock} style={{padding:'7px 12px',borderRadius:10,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.65)',fontFamily:'Outfit,sans-serif',fontWeight:600,fontSize:11,cursor:'pointer',textTransform:'uppercase',letterSpacing:'0.06em'}}>Edit</button>
            </div>
          </_GC>
        ):(
          <button onClick={lockPicks} disabled={saving} style={{
            width:'100%',height:48,borderRadius:14,border:'none',
            background:saving?`${ac}30`:`linear-gradient(135deg,${ac},${ac}aa)`,
            color:saving?ac:'#050e08',
            fontFamily:'var(--display-font)',fontWeight:700,fontSize:15,
            letterSpacing:'0.02em',cursor:saving?'wait':'pointer',
            boxShadow:saving?'none':`0 6px 24px ${ac}40`,transition:'all 0.2s',
            display:'flex',alignItems:'center',justifyContent:'center',gap:8,
          }}>
            <_IC name={saving?'sparkles':'lock'} size={16} color={saving?ac:'#050e08'} strokeWidth={2.5}/>
            {saving?'Locking in…':'Lock Tournament Picks'}
          </button>
        )}
        <div style={{textAlign:'center',marginTop:10,fontSize:11,color:'rgba(255,255,255,0.35)',fontFamily:'Outfit,sans-serif'}}>Tournament starts Jun 11 · 8 days left</div>
      </div>
    </div>
  );
}

Object.assign(window,{ChatScreen,NotificationsScreen,BracketScreen,TournamentPicksScreen});
