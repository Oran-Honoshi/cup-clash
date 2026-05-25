// ═══════════════════════════════════════════════════════
//  Cup Clash — More Screens (My Groups, Trivia, Join Group)
//  Plus persistent Tournament Picks via localStorage
// ═══════════════════════════════════════════════════════

const {useState:_us,useEffect:_ue,useRef:_ur}=React;
const {StatusBar:_sb,Flag:_fl,Avatar:_av,LiveDot:_ld,GlassCard:_gc,Chip:_ch,SLabel:_sl,
  ZoneLine:_zl,NeonBar:_nb,IconBtn:_ib,ScreenHeader:_sh,Icon:_ic}=window;

// ══════════════════════════════════════════════════════════
//  MY GROUPS — multi-group switcher
// ══════════════════════════════════════════════════════════
const MY_GROUPS=[
  {id:'tt', name:'Tech Titans',     type:'friends',  members:7,  rank:3, total:7,  pts:110, leader:'Amit',  active:true,  next:'MEX vs RSA',  nextIn:'2H 44M', unread:2},
  {id:'fm', name:'Family Cup',      type:'friends',  members:12, rank:1, total:12, pts:175, leader:'You',   active:false, next:'BRA vs GER',  nextIn:'5H 44M', unread:0},
  {id:'oc', name:'Office Champions',type:'corporate',members:48, rank:7, total:48, pts:88,  leader:'Dana',  active:false, next:'USA vs ENG',  nextIn:'1D',     unread:5, sponsor:'Acme Inc.'},
  {id:'bb', name:'Bar Buddies',     type:'friends',  members:5,  rank:2, total:5,  pts:95,  leader:'Tomer', active:false, next:'ESP vs MOR',  nextIn:'1D',     unread:0},
];

function MyGroupsScreen({tweaks,setScreen,setActiveGroup}){
  const ac=tweaks.accentColor;
  const totalPts=MY_GROUPS.reduce((s,g)=>s+g.pts,0);
  const totalUnread=MY_GROUPS.reduce((s,g)=>s+g.unread,0);

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <_sb/>
      <_sh title="My Groups"
        action={
          <button onClick={()=>setScreen('createGroup')} style={{display:'flex',alignItems:'center',gap:5,padding:'7px 12px',borderRadius:100,background:`${ac}18`,border:`1px solid ${ac}38`,color:ac,fontSize:10,fontWeight:700,fontFamily:'Outfit,sans-serif',textTransform:'uppercase',letterSpacing:'0.08em',cursor:'pointer',backdropFilter:'blur(10px)'}}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke={ac} strokeWidth="2.4" strokeLinecap="round"><path d="M6 1.5v9M1.5 6h9"/></svg>
            New
          </button>
        }/>
      <div style={{flex:1,overflowY:'auto',padding:'2px 14px 90px'}}>

        {/* Summary card */}
        <_gc accent={ac} style={{padding:'16px 18px',marginBottom:14,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',inset:0,background:`radial-gradient(circle at 80% 0%,${ac}25,transparent 70%)`,pointerEvents:'none'}}/>
          <div style={{fontSize:10,fontWeight:700,color:ac,fontFamily:'Outfit,sans-serif',textTransform:'uppercase',letterSpacing:'0.12em'}}>Across all groups</div>
          <div style={{display:'flex',alignItems:'baseline',gap:8,marginTop:6}}>
            <span style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:38,color:'white',lineHeight:1,textShadow:`0 0 18px ${ac}40`}}>{totalPts}</span>
            <span style={{fontSize:13,color:'rgba(255,255,255,0.5)',fontFamily:'Outfit,sans-serif',fontWeight:600}}>total points</span>
          </div>
          <div style={{display:'flex',gap:14,marginTop:10}}>
            <span style={{fontSize:11,color:'rgba(255,255,255,0.55)',fontFamily:'Outfit,sans-serif'}}><strong style={{color:'white'}}>{MY_GROUPS.length}</strong> groups</span>
            <span style={{fontSize:11,color:'rgba(255,255,255,0.55)',fontFamily:'Outfit,sans-serif'}}><strong style={{color:'white'}}>72</strong> members</span>
            {totalUnread>0&&<span style={{fontSize:11,color:'#fbbf24',fontFamily:'Outfit,sans-serif'}}><strong>{totalUnread}</strong> unread</span>}
          </div>
        </_gc>

        <_sl count={MY_GROUPS.length}>Your Groups</_sl>
        {MY_GROUPS.map(g=>{
          const isLeader=g.rank===1;
          const isCorp=g.type==='corporate';
          return(
            <_gc key={g.id} style={{padding:'14px 16px',marginBottom:10,position:'relative',cursor:'pointer'}}
              onClick={()=>{setActiveGroup&&setActiveGroup(g.id);setScreen('dashboard');}}>
              {g.active&&<div style={{position:'absolute',top:0,bottom:0,left:0,width:3,background:ac,borderRadius:'18px 0 0 18px',boxShadow:`0 0 8px ${ac}`}}/>}
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
                <div style={{width:46,height:46,borderRadius:13,
                  background:isCorp?'rgba(0,212,255,0.15)':`${ac}15`,
                  border:isCorp?'1px solid rgba(0,212,255,0.35)':`1px solid ${ac}35`,
                  display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <_ic name={isCorp?'shieldCheck':'users'} size={22} color={isCorp?'#00D4FF':ac}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <span style={{fontFamily:'var(--display-font)',fontWeight:800,fontSize:17,color:'white'}}>{g.name}</span>
                    {g.active&&<_ch label="Active" color={ac} glow/>}
                    {isLeader&&<_ic name="crown" size={13} color="#fbbf24" fill="#fbbf24" strokeWidth={1.6}/>}
                  </div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.45)',fontFamily:'Outfit,sans-serif',marginTop:2}}>
                    {isCorp?`Sponsored by ${g.sponsor} · `:''}{g.members} members
                  </div>
                </div>
                {g.unread>0&&(
                  <div style={{width:22,height:22,borderRadius:'50%',background:'#f87171',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:11,fontFamily:'JetBrains Mono,monospace',boxShadow:'0 0 8px rgba(248,113,113,0.5)',flexShrink:0}}>{g.unread}</div>
                )}
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginTop:6}}>
                <div style={{padding:'8px 10px',borderRadius:10,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.06)'}}>
                  <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'rgba(255,255,255,0.4)',fontFamily:'Outfit,sans-serif'}}>Your Rank</div>
                  <div style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:18,color:isLeader?'#fbbf24':ac,marginTop:2,display:'flex',alignItems:'center',gap:3}}>
                    #{g.rank}<span style={{fontSize:11,color:'rgba(255,255,255,0.3)',fontFamily:'Outfit,sans-serif',fontWeight:600}}>/{g.total}</span>
                  </div>
                </div>
                <div style={{padding:'8px 10px',borderRadius:10,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.06)'}}>
                  <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'rgba(255,255,255,0.4)',fontFamily:'Outfit,sans-serif'}}>Points</div>
                  <div style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:18,color:'white',marginTop:2}}>{g.pts}</div>
                </div>
                <div style={{padding:'8px 10px',borderRadius:10,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.06)'}}>
                  <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'rgba(255,255,255,0.4)',fontFamily:'Outfit,sans-serif'}}>Leader</div>
                  <div style={{fontSize:13,fontWeight:700,color:'white',fontFamily:'Outfit,sans-serif',marginTop:3,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{g.leader}</div>
                </div>
              </div>

              <div style={{marginTop:10,paddingTop:10,borderTop:'1px solid rgba(255,255,255,0.06)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:11,color:'rgba(255,255,255,0.55)',fontFamily:'Outfit,sans-serif',display:'flex',alignItems:'center',gap:5}}>
                  <_ic name="clock" size={11} color="rgba(255,255,255,0.55)"/>
                  Next: <strong style={{color:'white'}}>{g.next}</strong> in {g.nextIn}
                </span>
                <_ic name="chevronRight" size={14} color="rgba(255,255,255,0.3)"/>
              </div>
            </_gc>
          );
        })}

        {/* Join via passkey */}
        <button onClick={()=>setScreen('joinGroup')} style={{
          width:'100%',padding:'14px 16px',marginTop:6,borderRadius:14,
          background:'rgba(255,255,255,0.04)',border:'1px dashed rgba(255,255,255,0.18)',
          color:'rgba(255,255,255,0.65)',fontFamily:'Outfit,sans-serif',fontWeight:600,fontSize:13,
          cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,
        }}>
          <_ic name="users" size={14} color="rgba(255,255,255,0.65)"/>
          Join a group via passkey
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  JOIN GROUP — Enter passkey
// ══════════════════════════════════════════════════════════
function JoinGroupScreen({tweaks,setScreen}){
  const ac=tweaks.accentColor;
  const [code,setCode]=_us(['','','','']);
  const [foundGroup,setFoundGroup]=_us(null);
  const [paying,setPaying]=_us(false);
  const refs=[_ur(),_ur(),_ur(),_ur()];

  const isValid=code.every(c=>c.length===1);

  _ue(()=>{
    if(isValid&&!foundGroup){
      // Simulate lookup
      const codeStr=code.join('');
      setTimeout(()=>setFoundGroup({
        name:codeStr==='DEMO'?'Demo Group':`Squad ${codeStr}`,
        members:codeStr==='K7XQ'?7:Math.floor(Math.random()*15)+5,
        admin:'Amit',
        buyIn:codeStr==='FREE'?0:2,
        sponsored:codeStr==='ACME',
      }),400);
    }
    if(!isValid)setFoundGroup(null);
  },[code]);

  function setDigit(i,v){
    const c=v.toUpperCase().slice(-1);
    if(!/^[A-Z0-9]?$/.test(c))return;
    const next=[...code];next[i]=c;setCode(next);
    if(c&&i<3)refs[i+1].current?.focus();
  }
  function handleKey(i,e){
    if(e.key==='Backspace'&&!code[i]&&i>0)refs[i-1].current?.focus();
  }
  function handlePay(){
    setPaying(true);
    setTimeout(()=>setScreen('dashboard'),1400);
  }

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <_sb/>
      <_sh title="Join a Group" onBack={()=>setScreen('groups')}/>
      <div style={{flex:1,overflowY:'auto',padding:'12px 22px 30px'}}>

        <div style={{textAlign:'center',marginBottom:30}}>
          <div style={{margin:'0 auto 18px',width:60,height:60,borderRadius:18,
            background:`linear-gradient(135deg,${ac}25,rgba(0,212,255,0.2))`,
            border:`1px solid ${ac}45`,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <_ic name="users" size={28} color={ac}/>
          </div>
          <div style={{fontFamily:'var(--display-font)',fontWeight:800,fontSize:26,color:'white',letterSpacing:'-0.005em',lineHeight:1.1}}>Got a passkey?</div>
          <div style={{fontSize:13,color:'rgba(255,255,255,0.55)',fontFamily:'Outfit,sans-serif',marginTop:8,lineHeight:1.5,maxWidth:280,margin:'8px auto 0'}}>
            Enter the 4-character code your group admin sent you.
          </div>
        </div>

        {/* Passkey input */}
        <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:24}}>
          {code.map((c,i)=>(
            <input key={i} ref={refs[i]} value={c}
              onChange={e=>setDigit(i,e.target.value)} onKeyDown={e=>handleKey(i,e)}
              maxLength={1}
              style={{
                width:54,height:64,borderRadius:14,textAlign:'center',
                background:c?`${ac}15`:'rgba(255,255,255,0.04)',
                border:c?`1.5px solid ${ac}55`:'1px solid rgba(255,255,255,0.14)',
                color:c?ac:'white',fontSize:30,fontFamily:'JetBrains Mono,monospace',fontWeight:900,
                outline:'none',backdropFilter:'blur(12px)',transition:'all 0.18s',
                boxShadow:c?`0 0 14px ${ac}30`:'none',padding:0,
              }}/>
          ))}
        </div>

        {/* Helper / demo codes */}
        <div style={{textAlign:'center',marginBottom:30,fontSize:11,color:'rgba(255,255,255,0.4)',fontFamily:'Outfit,sans-serif'}}>
          Try <button onClick={()=>setCode(['D','E','M','O'])} style={{background:'none',border:'none',color:ac,fontWeight:700,cursor:'pointer',fontFamily:'JetBrains Mono,monospace',fontSize:11}}>DEMO</button>, <button onClick={()=>setCode(['F','R','E','E'])} style={{background:'none',border:'none',color:ac,fontWeight:700,cursor:'pointer',fontFamily:'JetBrains Mono,monospace',fontSize:11}}>FREE</button> or <button onClick={()=>setCode(['A','C','M','E'])} style={{background:'none',border:'none',color:ac,fontWeight:700,cursor:'pointer',fontFamily:'JetBrains Mono,monospace',fontSize:11}}>ACME</button>
        </div>

        {/* Group found */}
        {isValid&&foundGroup&&(
          <_gc accent={ac} style={{padding:'18px 18px',marginBottom:14,animation:'fadeUp 0.3s ease-out'}}>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
              <div style={{width:46,height:46,borderRadius:13,background:`${ac}20`,border:`1px solid ${ac}40`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <_ic name={foundGroup.sponsored?'shieldCheck':'users'} size={22} color={ac}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontFamily:'var(--display-font)',fontWeight:800,fontSize:20,color:'white'}}>{foundGroup.name}</div>
                <div style={{fontSize:12,color:'rgba(255,255,255,0.5)',fontFamily:'Outfit,sans-serif',marginTop:2}}>{foundGroup.members} members · Admin: {foundGroup.admin}</div>
              </div>
            </div>

            {foundGroup.sponsored?(
              <div style={{padding:'10px 12px',borderRadius:10,background:'rgba(0,212,255,0.1)',border:'1px solid rgba(0,212,255,0.3)',display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
                <_ic name="shieldCheck" size={14} color="#00D4FF"/>
                <span style={{fontSize:12,color:'#00D4FF',fontFamily:'Outfit,sans-serif',fontWeight:600}}>Corporate sponsored · You join for <strong>FREE</strong></span>
              </div>
            ):(
              <div style={{padding:'10px 12px',borderRadius:10,background:'rgba(251,191,36,0.08)',border:'1px solid rgba(251,191,36,0.25)',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                <span style={{fontSize:12,color:'rgba(255,255,255,0.7)',fontFamily:'Outfit,sans-serif'}}>Entry fee</span>
                <span style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:18,color:'#fbbf24'}}>${foundGroup.buyIn}</span>
              </div>
            )}

            <button onClick={handlePay} disabled={paying} style={{
              width:'100%',height:46,borderRadius:13,border:'none',
              background:paying?`${ac}30`:`linear-gradient(135deg,${ac},#00D4FF)`,
              color:paying?ac:'#050e08',
              fontFamily:'var(--display-font)',fontWeight:700,fontSize:14,letterSpacing:'0.02em',
              cursor:paying?'wait':'pointer',
              boxShadow:paying?'none':`0 6px 20px ${ac}50`,transition:'all 0.2s',
              display:'flex',alignItems:'center',justifyContent:'center',gap:8,
            }}>
              {paying
                ?<>Joining…</>
                :foundGroup.sponsored
                  ?<>Join Free <_ic name="zap" size={14} color="#050e08" strokeWidth={2.5}/></>
                  :<>Pay ${foundGroup.buyIn} & Join <_ic name="check" size={14} color="#050e08" strokeWidth={3}/></>
              }
            </button>
            {!foundGroup.sponsored&&<div style={{textAlign:'center',marginTop:8,fontSize:10,color:'rgba(255,255,255,0.35)',fontFamily:'Outfit,sans-serif'}}>Paid securely via PayPal · Refundable until first match</div>}
          </_gc>
        )}

        {isValid&&!foundGroup&&(
          <div style={{textAlign:'center',padding:'20px 0',color:'rgba(255,255,255,0.4)',fontSize:12,fontFamily:'Outfit,sans-serif'}}>Looking up group…</div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  TRIVIA mini-game
// ══════════════════════════════════════════════════════════
const TRIVIA=[
  {q:'Which country has won the most World Cups?',ans:['Brazil','Germany','Italy','Argentina'],correct:0,fact:'Brazil has won 5 World Cups (1958, 1962, 1970, 1994, 2002).'},
  {q:'Where will the 2026 World Cup Final be held?',ans:['Estadio Azteca','MetLife Stadium','SoFi Stadium','AT&T Stadium'],correct:1,fact:'MetLife Stadium in New Jersey hosts the Final on July 19, 2026.'},
  {q:'How many teams are in the 2026 tournament?',ans:['32','40','48','64'],correct:2,fact:'For the first time ever, 48 teams compete across 3 host nations.'},
  {q:'Who is the all-time top scorer in World Cup history?',ans:['Pelé','Ronaldo','Miroslav Klose','Lionel Messi'],correct:2,fact:'Miroslav Klose scored 16 World Cup goals across 4 tournaments.'},
  {q:'Which country hosted the first World Cup in 1930?',ans:['Brazil','Uruguay','Italy','France'],correct:1,fact:'Uruguay hosted the inaugural tournament and won it.'},
];

function TriviaScreen({tweaks,setScreen}){
  const ac=tweaks.accentColor;
  const [phase,setPhase]=_us('intro'); // intro | playing | result
  const [idx,setIdx]=_us(0);
  const [answered,setAnswered]=_us(null);
  const [score,setScore]=_us(0);
  const [timeLeft,setTimeLeft]=_us(7);

  // Timer
  _ue(()=>{
    if(phase!=='playing'||answered!==null)return;
    if(timeLeft<=0){setAnswered(-1);return;}
    const t=setTimeout(()=>setTimeLeft(s=>s-0.1),100);
    return()=>clearTimeout(t);
  },[phase,timeLeft,answered]);

  function start(){
    setPhase('playing');setIdx(0);setAnswered(null);setScore(0);setTimeLeft(7);
  }
  function pickAnswer(i){
    if(answered!==null)return;
    setAnswered(i);
    if(i===TRIVIA[idx].correct)setScore(s=>s+Math.ceil(timeLeft*2));
  }
  function nextQ(){
    if(idx+1>=TRIVIA.length){setPhase('result');return;}
    setIdx(i=>i+1);setAnswered(null);setTimeLeft(7);
  }

  const q=TRIVIA[idx];
  const isCorrect=answered===q?.correct;

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <_sb/>
      <_sh title="Trivia Challenge" onBack={()=>setScreen('dashboard')}/>
      <div style={{flex:1,overflowY:'auto',padding:'12px 18px 90px'}}>

        {phase==='intro'&&(
          <div style={{textAlign:'center',padding:'10px 0'}}>
            <div style={{margin:'10px auto 18px',width:80,height:80,borderRadius:22,
              background:`linear-gradient(135deg,${ac}25,rgba(139,92,246,0.25))`,
              border:`1px solid ${ac}50`,display:'flex',alignItems:'center',justifyContent:'center',
              boxShadow:`0 10px 32px ${ac}40`}}>
              <_ic name="brain" size={36} color={ac} strokeWidth={1.6}/>
            </div>
            <div style={{fontFamily:'var(--display-font)',fontWeight:800,fontSize:30,color:'white',letterSpacing:'-0.005em',lineHeight:1.05}}>The 7-Second<br/>Pressure Round</div>
            <div style={{fontSize:14,color:'rgba(255,255,255,0.62)',fontFamily:'Outfit,sans-serif',marginTop:12,maxWidth:300,margin:'12px auto 0',lineHeight:1.5}}>
              Five questions on World Cup history. Faster answers = more points. Use bonus points to break ties on the leaderboard.
            </div>

            <_gc style={{padding:'14px 18px',marginTop:24,textAlign:'left'}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'rgba(255,255,255,0.4)',fontFamily:'Outfit,sans-serif',marginBottom:8}}>How it works</div>
              {[
                {n:'01',t:'7 seconds per question'},
                {n:'02',t:'Earn 2pts per second left'},
                {n:'03',t:'Wrong = 0 pts'},
                {n:'04',t:'Max 70 points per round'},
              ].map(r=>(
                <div key={r.n} style={{display:'flex',alignItems:'center',gap:10,padding:'6px 0'}}>
                  <span style={{fontFamily:'JetBrains Mono,monospace',fontWeight:800,fontSize:12,color:ac,width:22}}>{r.n}</span>
                  <span style={{fontSize:13,color:'rgba(255,255,255,0.75)',fontFamily:'Outfit,sans-serif',fontWeight:500}}>{r.t}</span>
                </div>
              ))}
            </_gc>

            <button onClick={start} style={{
              width:'100%',height:54,borderRadius:15,border:'none',marginTop:20,
              background:`linear-gradient(135deg,${ac},#00D4FF)`,color:'#050e08',
              fontFamily:'var(--display-font)',fontWeight:700,fontSize:16,letterSpacing:'0.02em',cursor:'pointer',
              boxShadow:`0 8px 30px ${ac}50`,transition:'all 0.2s',
              display:'flex',alignItems:'center',justifyContent:'center',gap:8,
            }}>
              <_ic name="zap" size={16} color="#050e08" strokeWidth={2.4}/>
              Start Round
            </button>

            <div style={{marginTop:14,fontSize:11,color:'rgba(255,255,255,0.4)',fontFamily:'Outfit,sans-serif'}}>Best score this week: <strong style={{color:'#fbbf24',fontFamily:'JetBrains Mono,monospace'}}>62 pts</strong> by Amit</div>
          </div>
        )}

        {phase==='playing'&&q&&(
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
              <span style={{fontSize:10,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'rgba(255,255,255,0.5)',fontFamily:'Outfit,sans-serif'}}>Question {idx+1}/{TRIVIA.length}</span>
              <span style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:18,color:ac}}>{score} pts</span>
            </div>

            {/* Timer bar */}
            <div style={{height:6,borderRadius:3,background:'rgba(255,255,255,0.06)',overflow:'hidden',marginBottom:20}}>
              <div style={{height:'100%',width:`${(timeLeft/7)*100}%`,
                background:timeLeft>3?`linear-gradient(90deg,${ac},#00D4FF)`:timeLeft>1?'#fbbf24':'#f87171',
                transition:'all 0.1s linear',
                boxShadow:timeLeft>3?`0 0 12px ${ac}80`:'none',
              }}/>
            </div>

            <_gc style={{padding:'18px 20px',marginBottom:14}}>
              <div style={{fontFamily:'var(--display-font)',fontWeight:700,fontSize:22,color:'white',lineHeight:1.25,letterSpacing:'-0.005em'}}>{q.q}</div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12}}>
                <span style={{fontSize:11,color:'rgba(255,255,255,0.4)',fontFamily:'Outfit,sans-serif'}}>Faster = more points</span>
                <span style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:24,color:timeLeft>3?ac:timeLeft>1?'#fbbf24':'#f87171',textShadow:`0 0 12px ${timeLeft>3?ac:timeLeft>1?'#fbbf24':'#f87171'}50`}}>{timeLeft.toFixed(1)}s</span>
              </div>
            </_gc>

            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {q.ans.map((a,i)=>{
                const isAnswer=answered===i;
                const isCorrectAns=i===q.correct;
                const showState=answered!==null;
                return(
                  <button key={i} onClick={()=>pickAnswer(i)} disabled={answered!==null} style={{
                    padding:'14px 16px',borderRadius:13,textAlign:'left',cursor:answered!==null?'default':'pointer',
                    background:showState&&isCorrectAns
                      ?`linear-gradient(135deg,${ac}25,${ac}10)`
                      :showState&&isAnswer
                        ?'rgba(248,113,113,0.18)'
                        :'rgba(18,14,38,0.4)',
                    border:showState&&isCorrectAns
                      ?`1.5px solid ${ac}66`
                      :showState&&isAnswer
                        ?'1.5px solid rgba(248,113,113,0.5)'
                        :'1px solid rgba(255,255,255,0.12)',
                    backdropFilter:'blur(12px)',transition:'all 0.18s',
                    display:'flex',justifyContent:'space-between',alignItems:'center',
                    boxShadow:showState&&isCorrectAns?`0 0 16px ${ac}30`:'none',
                  }}>
                    <span style={{fontSize:14,fontWeight:600,color:'white',fontFamily:'Outfit,sans-serif'}}>{a}</span>
                    {showState&&isCorrectAns&&<_ic name="check" size={16} color={ac} strokeWidth={3.5}/>}
                    {showState&&isAnswer&&!isCorrectAns&&<span style={{fontSize:18,color:'#f87171',fontWeight:900,lineHeight:1}}>×</span>}
                  </button>
                );
              })}
            </div>

            {answered!==null&&(
              <div style={{marginTop:16,animation:'fadeUp 0.3s ease-out'}}>
                <_gc style={{padding:'12px 14px',marginBottom:12}}>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:isCorrect?ac:'#f87171',fontFamily:'Outfit,sans-serif',marginBottom:4}}>
                    {isCorrect?`Correct! +${Math.ceil(timeLeft*2)} pts`:answered===-1?'Time\'s up':'Not quite'}
                  </div>
                  <div style={{fontSize:12.5,color:'rgba(255,255,255,0.7)',fontFamily:'Outfit,sans-serif',lineHeight:1.5}}>{q.fact}</div>
                </_gc>
                <button onClick={nextQ} style={{
                  width:'100%',height:46,borderRadius:13,border:'none',
                  background:`linear-gradient(135deg,${ac},#00D4FF)`,color:'#050e08',
                  fontFamily:'var(--display-font)',fontWeight:700,fontSize:14,cursor:'pointer',
                  boxShadow:`0 6px 20px ${ac}40`,
                  display:'flex',alignItems:'center',justifyContent:'center',gap:6,
                }}>
                  {idx+1<TRIVIA.length?<>Next Question <_ic name="chevronRight" size={14} color="#050e08" strokeWidth={3}/></>:'See Results'}
                </button>
              </div>
            )}
          </div>
        )}

        {phase==='result'&&(
          <div style={{textAlign:'center',padding:'10px 0',animation:'fadeUp 0.4s ease-out'}}>
            <div style={{margin:'10px auto 16px',width:88,height:88,borderRadius:'50%',
              background:`linear-gradient(135deg,${ac},#00D4FF)`,
              display:'flex',alignItems:'center',justifyContent:'center',
              boxShadow:`0 12px 36px ${ac}50`}}>
              <_ic name="trophy" size={42} color="#050e08" strokeWidth={1.8}/>
            </div>
            <div style={{fontFamily:'var(--display-font)',fontWeight:800,fontSize:28,color:'white',letterSpacing:'-0.005em',lineHeight:1.05}}>Round Complete!</div>
            <div style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:64,color:ac,marginTop:14,lineHeight:1,textShadow:`0 0 24px ${ac}50`}}>{score}</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,0.55)',fontFamily:'Outfit,sans-serif',fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase',marginTop:4}}>Bonus points earned</div>

            <_gc style={{padding:'14px 18px',marginTop:24,textAlign:'left'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <span style={{fontSize:10,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:'rgba(255,255,255,0.4)',fontFamily:'Outfit,sans-serif'}}>This week's leaders</span>
                <span style={{fontSize:10,color:'rgba(255,255,255,0.3)',fontFamily:'JetBrains Mono,monospace',fontWeight:700}}>TRIVIA</span>
              </div>
              {[
                {n:'Amit',p:62,me:false,medal:'#fbbf24'},
                {n:'Sarah',p:54,me:false,medal:'#94a3b8'},
                {n:'You',p:score,me:true,medal:'#f97316'},
              ].sort((a,b)=>b.p-a.p).map((m,i)=>(
                <div key={m.n} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 0',
                  borderTop:i>0?'1px solid rgba(255,255,255,0.05)':'none'}}>
                  <span style={{fontFamily:'JetBrains Mono,monospace',fontWeight:800,fontSize:11,color:[...['#fbbf24','#94a3b8','#f97316']][i]||'rgba(255,255,255,0.4)',width:18,textAlign:'center'}}>{i+1}</span>
                  <_av name={m.n} size={28} you={m.me}/>
                  <span style={{flex:1,fontSize:13,fontWeight:700,color:m.me?ac:'white',fontFamily:'Outfit,sans-serif'}}>{m.n}</span>
                  <span style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:16,color:m.me?ac:'white'}}>{m.p}</span>
                </div>
              ))}
            </_gc>

            <div style={{display:'flex',gap:8,marginTop:20}}>
              <button onClick={start} style={{
                flex:1,height:46,borderRadius:13,
                background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.15)',color:'white',
                fontFamily:'var(--display-font)',fontWeight:700,fontSize:13,letterSpacing:'0.02em',cursor:'pointer',
              }}>Play Again</button>
              <button onClick={()=>setScreen('dashboard')} style={{
                flex:1,height:46,borderRadius:13,border:'none',
                background:`linear-gradient(135deg,${ac},#00D4FF)`,color:'#050e08',
                fontFamily:'var(--display-font)',fontWeight:700,fontSize:13,letterSpacing:'0.02em',cursor:'pointer',
                boxShadow:`0 6px 20px ${ac}40`,
              }}>Back to Dashboard</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

Object.assign(window,{MyGroupsScreen,JoinGroupScreen,TriviaScreen});
