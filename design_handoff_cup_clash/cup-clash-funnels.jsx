// ═══════════════════════════════════════════════════════
//  Cup Clash — Funnels (REAL DATA from app/(app)/create-group + admin)
//  Mirrors: Friend Circle / Corporate Sponsor models,
//           $2 per-member or $75/$130 corporate tiers,
//           9 scoring rules with real defaults,
//           Tournament / Single Match types,
//           4-letter passkeys + cupclash.live/join/XXXX share link
// ═══════════════════════════════════════════════════════

const {useState:_uS,useEffect:_uE,useRef:_uR}=React;
const {StatusBar:__SB,Flag:__FL,Avatar:__AV,LiveDot:__LD,GlassCard:__GC,Chip:__CH,SLabel:__SL,
  ZoneLine:__ZL,NeonBar:__NB,IconBtn:__IB,ScreenHeader:__SH,Icon:__IC}=window;

// ── Real data lifted from app/(app)/create-group/page.tsx ──────────
const FEATURED_MATCHES=[
  {id:'final',label:'Final',                detail:'MetLife Stadium · Jul 19'},
  {id:'sf-1', label:'Semi-Final 1',         detail:'MetLife Stadium · Jul 14'},
  {id:'sf-2', label:'Semi-Final 2',         detail:'AT&T Stadium · Jul 15'},
  {id:'qf-1', label:'Quarter-Final 1',      detail:'MetLife Stadium · Jul 9'},
  {id:'g001', label:'Opening: MEX vs RSA',  detail:'Mexico · Jun 11'},
];

const SCORING_DEFAULTS=[
  {k:'outcome',  label:'Match Outcome',        desc:'Correctly predicting W/D/L result',         pts:10, on:true },
  {k:'exact',    label:'Exact Scoreline',      desc:'Bonus for guessing identical score (2-1)',  pts:25, on:true },
  {k:'ko',       label:'Knockout Advancement', desc:'Correctly choosing which team advances',    pts:20, on:true },
  {k:'winner',   label:'Tournament Champion',  desc:'Picking the trophy winner',                 pts:100,on:true },
  {k:'scorer',   label:'Golden Boot Winner',   desc:'Predicting top goals scorer',               pts:50, on:true },
  {k:'assister', label:'Top Assist Playmaker', desc:'Predicting tournament assists champion',    pts:50, on:true },
  {k:'defence',  label:'Best Defence',         desc:'Team with lowest goals conceded',           pts:40, on:false},
  {k:'young',    label:'Best Young Player',    desc:'Official FIFA Best Young Player award',     pts:30, on:false},
  {k:'mvp',      label:'Golden Ball (MVP)',    desc:'Tournament best player award winner',       pts:40, on:false},
];

const CORPORATE_TIERS=[
  {id:50, price:75, name:'Team Starter',   members:'Up to 50 members',  popular:false},
  {id:100,price:130,name:'Corporate Pack', members:'Up to 100 members', popular:true },
];

// ══════════════════════════════════════════════════════════
//  WELCOME SCREEN  (placeholder marketing — the real landing
//  lives in components/landing/ — keeping this simple)
// ══════════════════════════════════════════════════════════
function WelcomeScreen({tweaks,setScreen}){
  const ac=tweaks.accentColor;
  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <__SB/>
      <div style={{flex:1,display:'flex',flexDirection:'column',padding:'20px 24px 24px',justifyContent:'space-between'}}>
        <div style={{display:'flex',justifyContent:'flex-end'}}>
          <button onClick={()=>setScreen('dashboard')} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.7)',fontSize:11,fontWeight:600,padding:'6px 12px',borderRadius:100,fontFamily:'Outfit,sans-serif',cursor:'pointer',backdropFilter:'blur(10px)',textTransform:'uppercase',letterSpacing:'0.08em'}}>Skip demo</button>
        </div>

        <div style={{textAlign:'center'}}>
          <div style={{width:120,height:120,margin:'0 auto 20px',borderRadius:32,
            background:`linear-gradient(135deg,${ac}30,rgba(139,92,246,0.25))`,
            border:`1.5px solid ${ac}55`,backdropFilter:'blur(20px)',
            display:'flex',alignItems:'center',justifyContent:'center',
            boxShadow:`0 12px 50px ${ac}40,inset 0 1px 0 rgba(255,255,255,0.2)`,position:'relative'}}>
            <div style={{fontFamily:'var(--display-font)',fontWeight:800,fontSize:46,color:'white',letterSpacing:'-0.04em',lineHeight:1,textShadow:`0 0 20px ${ac}80`}}>CC</div>
            <div style={{position:'absolute',top:-8,right:-8,width:32,height:32,borderRadius:'50%',background:`linear-gradient(135deg,${ac},#00D4FF)`,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 4px 16px ${ac}60`}}>
              <__IC name="trophy" size={16} color="#050e08" strokeWidth={2.4}/>
            </div>
          </div>

          <div style={{fontFamily:'var(--display-font)',fontWeight:800,fontSize:42,color:'white',letterSpacing:'-0.01em',lineHeight:1.0,marginBottom:14,textShadow:'0 4px 24px rgba(0,0,0,0.6)'}}>
            Cup<br/>Clash
          </div>
          <div style={{fontSize:15,color:'rgba(255,255,255,0.7)',fontFamily:'Outfit,sans-serif',fontWeight:500,lineHeight:1.5,maxWidth:280,margin:'0 auto'}}>
            Predict every World Cup match. Settle scores with friends and coworkers.
          </div>

          <div style={{marginTop:24,display:'flex',gap:12,justifyContent:'center',alignItems:'center'}}>
            <div style={{display:'flex',marginLeft:8}}>
              {['Amit','Sarah','John','Ben'].map((n,i)=>(
                <div key={n} style={{marginLeft:-8}}><__AV name={n} size={28}/></div>
              ))}
            </div>
            <div style={{textAlign:'left'}}>
              <div style={{fontSize:12,fontWeight:700,color:'white',fontFamily:'Outfit,sans-serif',lineHeight:1.2}}>Free to host</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.5)',fontFamily:'Outfit,sans-serif'}}>$2 per friend · or sponsor your team</div>
            </div>
          </div>
        </div>

        <div>
          <button onClick={()=>setScreen('signup')} style={{
            width:'100%',height:54,borderRadius:16,border:'none',marginBottom:10,
            background:`linear-gradient(135deg,${ac},${ac}cc)`,color:'#050e08',
            fontFamily:'var(--display-font)',fontWeight:700,fontSize:16,
            letterSpacing:'0.01em',cursor:'pointer',
            boxShadow:`0 8px 30px ${ac}55`,transition:'all 0.2s',
          }}>Get Started — Free</button>
          <button onClick={()=>setScreen('signup')} style={{
            width:'100%',height:48,borderRadius:14,
            background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.15)',
            backdropFilter:'blur(20px)',color:'white',
            fontFamily:'Outfit,sans-serif',fontWeight:600,fontSize:14,cursor:'pointer',
          }}>I already have an account</button>
          <div style={{textAlign:'center',marginTop:14,fontSize:11,color:'rgba(255,255,255,0.4)',fontFamily:'Outfit,sans-serif'}}>
            Tournament starts Jun 11 · 8 days left
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  SIGN UP SCREEN
// ══════════════════════════════════════════════════════════
function SignUpScreen({tweaks,setScreen}){
  const ac=tweaks.accentColor;
  const [name,setName]=_uS('Oran');
  const [email,setEmail]=_uS('oran@honoshi.co.il');
  const [country,setCountry]=_uS('il');
  const [step,setStep]=_uS('form');

  const COUNTRIES=[
    {c:'il',n:'Israel'},{c:'us',n:'United States'},{c:'gb',n:'United Kingdom'},
    {c:'de',n:'Germany'},{c:'br',n:'Brazil'},{c:'ar',n:'Argentina'},{c:'fr',n:'France'},
    {c:'es',n:'Spain'},{c:'jp',n:'Japan'},{c:'mx',n:'Mexico'},
  ];

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <__SB/>
      <__SH title="Create Account" onBack={()=>setScreen('welcome')}/>
      <div style={{flex:1,overflowY:'auto',padding:'10px 22px 24px'}}>
        <div style={{marginBottom:24}}>
          <div style={{fontFamily:'var(--display-font)',fontWeight:700,fontSize:28,color:'white',lineHeight:1.1,letterSpacing:'0'}}>Welcome to<br/>the squad</div>
          <div style={{fontSize:13,color:'rgba(255,255,255,0.55)',fontFamily:'Outfit,sans-serif',marginTop:8,lineHeight:1.5}}>Set up your account in 30 seconds. Free forever.</div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:18}}>
          {['Google','Apple'].map(p=>(
            <button key={p} style={{
              height:46,borderRadius:12,background:'rgba(255,255,255,0.95)',color:'#111',
              fontFamily:'Outfit,sans-serif',fontWeight:600,fontSize:13,border:'none',cursor:'pointer',
              display:'flex',alignItems:'center',justifyContent:'center',gap:8,
              boxShadow:'0 4px 18px rgba(0,0,0,0.3)',
            }}>
              <span style={{fontSize:14,fontWeight:900}}>{p[0]}</span>
              <span>Continue with {p}</span>
            </button>
          ))}
        </div>

        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
          <div style={{flex:1,height:1,background:'rgba(255,255,255,0.1)'}}/>
          <span style={{fontSize:10,color:'rgba(255,255,255,0.35)',fontFamily:'Outfit,sans-serif',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.12em'}}>or with email</span>
          <div style={{flex:1,height:1,background:'rgba(255,255,255,0.1)'}}/>
        </div>

        {[{l:'Display name',v:name,s:setName,p:'Your name'},{l:'Email',v:email,s:setEmail,p:'you@email.com',t:'email'}].map(f=>(
          <div key={f.l} style={{marginBottom:14}}>
            <label style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',color:'rgba(255,255,255,0.45)',fontFamily:'Outfit,sans-serif',display:'block',marginBottom:6}}>{f.l}</label>
            <input type={f.t||'text'} value={f.v} onChange={e=>f.s(e.target.value)} placeholder={f.p}
              style={{width:'100%',height:44,padding:'0 16px',borderRadius:12,
                background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.14)',
                color:'white',fontSize:14,fontFamily:'Outfit,sans-serif',fontWeight:500,
                outline:'none',backdropFilter:'blur(12px)',transition:'all 0.18s'}}
              onFocus={e=>{e.target.style.border=`1px solid ${ac}55`;e.target.style.background='rgba(255,255,255,0.09)';}}
              onBlur={e=>{e.target.style.border='1px solid rgba(255,255,255,0.14)';e.target.style.background='rgba(255,255,255,0.06)';}}
            />
          </div>
        ))}

        <div style={{marginBottom:14}}>
          <label style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',color:'rgba(255,255,255,0.45)',fontFamily:'Outfit,sans-serif',display:'block',marginBottom:6}}>Country</label>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {COUNTRIES.map(({c,n})=>(
              <button key={c} onClick={()=>setCountry(c)} style={{
                display:'flex',alignItems:'center',gap:6,padding:'6px 10px',borderRadius:100,
                background:country===c?`${ac}18`:'rgba(255,255,255,0.04)',
                border:country===c?`1px solid ${ac}55`:'1px solid rgba(255,255,255,0.1)',
                cursor:'pointer',transition:'all 0.15s',
              }}>
                <__FL code={c} size={18}/>
                <span style={{fontSize:11,fontWeight:600,color:country===c?'white':'rgba(255,255,255,0.65)',fontFamily:'Outfit,sans-serif'}}>{n}</span>
              </button>
            ))}
          </div>
        </div>

        <button onClick={()=>{setStep('done');setTimeout(()=>setScreen('createGroup'),700);}}
          disabled={!name||!email||step==='done'}
          style={{width:'100%',height:50,borderRadius:14,border:'none',marginTop:14,
            background:step==='done'?`${ac}30`:`linear-gradient(135deg,${ac},${ac}cc)`,
            color:step==='done'?ac:'#050e08',
            fontFamily:'var(--display-font)',fontWeight:700,fontSize:15,letterSpacing:'0.02em',cursor:'pointer',
            boxShadow:step==='done'?'none':`0 6px 24px ${ac}50`,transition:'all 0.2s',
            display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
          {step==='done'?<><__IC name="check" size={16} color={ac} strokeWidth={3}/>Welcome aboard</>:'Create Account'}
        </button>

        <div style={{textAlign:'center',marginTop:14,fontSize:11,color:'rgba(255,255,255,0.35)',fontFamily:'Outfit,sans-serif',lineHeight:1.5}}>
          By signing up you agree to our <span style={{color:'rgba(255,255,255,0.55)',textDecoration:'underline'}}>Terms</span> & <span style={{color:'rgba(255,255,255,0.55)',textDecoration:'underline'}}>Privacy</span>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  CREATE GROUP — Matches real 4-step flow exactly
//  Step 0: Payment model · Step 1: Group setup
//  Step 2: Prize structure · Step 3: Scoring rules
// ══════════════════════════════════════════════════════════
function CreateGroupScreen({tweaks,setScreen}){
  const ac=tweaks.accentColor;
  const [step,setStep]=_uS(0);
  const [model,setModel]=_uS(null); // 'pay_per_member' | 'corporate_sponsored'

  // Step 1
  const [groupName,setGroupName]=_uS('');
  const [groupType,setGroupType]=_uS('tournament');
  const [selectedMatch,setSelectedMatch]=_uS('final');

  // Step 2
  const [prizeTrack,setPrizeTrack]=_uS('cash'); // corp only: 'cash' | 'company'
  const [rewardPlaces,setRewardPlaces]=_uS(1);
  const [companyRewards,setCompanyRewards]=_uS({reward1:'',reward2:'',reward3:''});
  const [buyIn,setBuyIn]=_uS(20);
  const [memberCount,setMemberCount]=_uS(10);
  const [payouts,setPayouts]=_uS({first:60,second:30,third:10});

  // Step 3
  const [rules,setRules]=_uS(SCORING_DEFAULTS.map(r=>({...r})));
  const [passkey,setPasskey]=_uS(null);

  const isCorp=model==='corporate_sponsored';
  const totalPct=payouts.first+payouts.second+payouts.third;
  const totalPot=buyIn*memberCount;
  const isCompanyPrize=isCorp&&prizeTrack==='company';

  function back(){
    if(step===0){setScreen('dashboard');return;}
    setStep(s=>s-1);
  }

  function handleCreate(){
    // Generate 4-letter passkey
    const key=Math.random().toString(36).slice(2,6).toUpperCase();
    setPasskey(key);
  }

  // ── Success state ────────────────────────────────────────
  if(passkey){
    return(
      <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
        <__SB/>
        <__SH title="Group Created"/>
        <div style={{flex:1,overflowY:'auto',padding:'12px 18px 90px'}}>
          <__GC style={{padding:'24px 20px',textAlign:'center',position:'relative',overflow:'hidden',marginBottom:16}}>
            <div style={{position:'absolute',inset:0,background:`radial-gradient(circle at 50% 0%,${ac}25,transparent 70%)`,pointerEvents:'none'}}/>
            <div style={{margin:'0 auto 14px',width:64,height:64,borderRadius:'50%',
              background:`linear-gradient(135deg,${ac},#00D4FF)`,
              display:'flex',alignItems:'center',justifyContent:'center',
              boxShadow:`0 10px 32px ${ac}50`}}>
              <__IC name="check" size={28} color="#050e08" strokeWidth={3.5}/>
            </div>
            <div style={{fontFamily:'var(--display-font)',fontWeight:800,fontSize:30,color:'white',lineHeight:1.1,letterSpacing:'0'}}>{groupName}</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,0.6)',fontFamily:'Outfit,sans-serif',marginTop:8,lineHeight:1.5,maxWidth:280,margin:'8px auto 0'}}>
              {isCorp
                ?<>Your corporate group is ready. Unlock employee invites in the group page.</>
                :<>Share the passkey. Each friend pays <strong style={{color:'white'}}>$2</strong> to join.</>
              }
            </div>
          </__GC>

          {!isCorp&&(
            <__GC accent="#00D4FF" style={{padding:'18px 20px',textAlign:'center',marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:700,color:'#00D4FF',fontFamily:'Outfit,sans-serif',textTransform:'uppercase',letterSpacing:'0.14em',marginBottom:6}}>Entry Passkey</div>
              <div style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:46,color:'white',letterSpacing:'0.18em',textShadow:'0 0 24px rgba(0,212,255,0.4)'}}>{passkey}</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',fontFamily:'JetBrains Mono,monospace',marginTop:6,fontWeight:600}}>cupclash.live/join/{passkey}</div>
            </__GC>
          )}

          {isCorp?(
            <button onClick={()=>setScreen('dashboard')} style={{
              width:'100%',height:50,borderRadius:14,border:'none',marginBottom:8,
              background:`linear-gradient(135deg,${ac},#00D4FF)`,color:'#050e08',
              fontFamily:'var(--display-font)',fontWeight:700,fontSize:15,letterSpacing:'0.02em',cursor:'pointer',
              boxShadow:`0 6px 24px ${ac}50`,
              display:'flex',alignItems:'center',justifyContent:'center',gap:8,
            }}><__IC name="shieldCheck" size={16} color="#050e08" strokeWidth={2.4}/>Go to Group — Unlock Invites</button>
          ):(
            <>
              <button style={{width:'100%',height:46,borderRadius:13,marginBottom:8,
                background:'rgba(0,212,255,0.1)',border:'1px solid rgba(0,212,255,0.3)',color:'#00D4FF',
                fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:13,letterSpacing:'0.06em',textTransform:'uppercase',cursor:'pointer',
                display:'flex',alignItems:'center',justifyContent:'center',gap:8,
              }}>Copy invite link</button>
              <button onClick={()=>setScreen('dashboard')} style={{
                width:'100%',height:50,borderRadius:14,border:'none',
                background:`linear-gradient(135deg,${ac},#00D4FF)`,color:'#050e08',
                fontFamily:'var(--display-font)',fontWeight:700,fontSize:15,letterSpacing:'0.02em',cursor:'pointer',
                boxShadow:`0 6px 24px ${ac}50`,
              }}>Go to Dashboard</button>
            </>
          )}
        </div>
      </div>
    );
  }

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <__SB/>
      <__SH title="New Group" onBack={back}/>

      {/* Header */}
      <div style={{padding:'2px 18px 8px',flexShrink:0}}>
        <div style={{fontSize:10,fontWeight:700,color:'#00D4FF',fontFamily:'Outfit,sans-serif',textTransform:'uppercase',letterSpacing:'0.14em'}}>New Group</div>
        <div style={{fontFamily:'var(--display-font)',fontWeight:800,fontSize:26,color:'white',letterSpacing:'-0.005em',lineHeight:1.1,marginTop:2}}>Create your league</div>
        <div style={{fontSize:12,color:'rgba(255,255,255,0.5)',fontFamily:'Outfit,sans-serif',marginTop:4}}>Free to create · Choose how members join</div>
      </div>

      {/* Step indicator (after step 0) */}
      {step>0&&(
        <div style={{padding:'4px 18px 10px',flexShrink:0}}>
          <div style={{display:'flex',gap:5}}>
            {[1,2,3].map(n=>(
              <div key={n} style={{flex:1,height:3,borderRadius:2,
                background:n<=step?ac:'rgba(255,255,255,0.1)',
                boxShadow:n<=step?`0 0 8px ${ac}60`:'none',
                transition:'all 0.3s'}}/>
            ))}
          </div>
          <div style={{display:'flex',gap:8,marginTop:8,fontSize:10,fontWeight:700,fontFamily:'Outfit,sans-serif',textTransform:'uppercase',letterSpacing:'0.1em'}}>
            <span style={{color:step===1?ac:'rgba(255,255,255,0.35)',flex:1,textAlign:'center'}}>Group Setup</span>
            <span style={{color:step===2?ac:'rgba(255,255,255,0.35)',flex:1,textAlign:'center'}}>{isCorp?'Prizes':'Buy-In'}</span>
            <span style={{color:step===3?ac:'rgba(255,255,255,0.35)',flex:1,textAlign:'center'}}>Scoring</span>
          </div>
        </div>
      )}

      <div style={{flex:1,overflowY:'auto',padding:'4px 18px 16px'}}>

        {/* ─── STEP 0 — Payment model ───────────────────── */}
        {step===0&&(
          <div>
            <div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.45)',fontFamily:'Outfit,sans-serif',textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:14}}>Who pays for this group?</div>

            <button onClick={()=>{setModel('pay_per_member');setStep(1);}}
              style={{width:'100%',padding:'16px',marginBottom:10,borderRadius:18,textAlign:'left',
                background:'rgba(18,14,38,0.36)',backdropFilter:'blur(40px) saturate(180%)',
                border:`1.5px solid ${ac}38`,
                boxShadow:`0 10px 32px rgba(0,0,0,0.4),0 0 0 1px ${ac}10,inset 0 1px 0 rgba(255,255,255,0.16)`,
                cursor:'pointer',transition:'all 0.2s'}}>
              <div style={{display:'flex',gap:13,alignItems:'flex-start'}}>
                <div style={{width:46,height:46,borderRadius:13,background:`${ac}1a`,border:`1px solid ${ac}35`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <__IC name="users" size={22} color={ac}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
                    <span style={{fontFamily:'var(--display-font)',fontWeight:800,fontSize:18,color:'white'}}>Friend Circle</span>
                    <__CH label="Free for you" color={ac} glow/>
                  </div>
                  <div style={{fontSize:12.5,color:'rgba(255,255,255,0.62)',fontFamily:'Outfit,sans-serif',lineHeight:1.45}}>
                    You create the group for free. Each friend pays a flat <strong style={{color:'white'}}>$2 entry fee</strong> when they join.
                  </div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:5,marginTop:10}}>
                    {['Fantasy leagues','Friend groups','Bar buddies','Family'].map(t=>(
                      <span key={t} style={{fontSize:10,fontWeight:600,color:'rgba(255,255,255,0.55)',background:'rgba(255,255,255,0.05)',padding:'3px 8px',borderRadius:100,border:'1px solid rgba(255,255,255,0.08)',fontFamily:'Outfit,sans-serif'}}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </button>

            <button onClick={()=>{setModel('corporate_sponsored');setStep(1);}}
              style={{width:'100%',padding:'16px',marginBottom:10,borderRadius:18,textAlign:'left',
                background:'rgba(18,14,38,0.36)',backdropFilter:'blur(40px) saturate(180%)',
                border:'1.5px solid rgba(0,212,255,0.38)',
                boxShadow:'0 10px 32px rgba(0,0,0,0.4),0 0 0 1px rgba(0,212,255,0.1),inset 0 1px 0 rgba(255,255,255,0.16)',
                cursor:'pointer',transition:'all 0.2s'}}>
              <div style={{display:'flex',gap:13,alignItems:'flex-start'}}>
                <div style={{width:46,height:46,borderRadius:13,background:'rgba(0,212,255,0.15)',border:'1px solid rgba(0,212,255,0.35)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <__IC name="shieldCheck" size={22} color="#00D4FF"/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
                    <span style={{fontFamily:'var(--display-font)',fontWeight:800,fontSize:18,color:'white'}}>Corporate Sponsor</span>
                    <__CH label="Team pays $0" color="#00D4FF"/>
                  </div>
                  <div style={{fontSize:12.5,color:'rgba(255,255,255,0.62)',fontFamily:'Outfit,sans-serif',lineHeight:1.45}}>
                    Cover the whole team with one flat fee. Every employee joins for <strong style={{color:'white'}}>$0 — zero friction</strong>.
                  </div>
                  <div style={{display:'flex',gap:6,marginTop:10}}>
                    <span style={{fontSize:11,fontWeight:700,color:'#00D4FF',background:'rgba(0,212,255,0.1)',padding:'4px 8px',borderRadius:8,fontFamily:'JetBrains Mono,monospace'}}>$75 · 50 mem</span>
                    <span style={{fontSize:11,fontWeight:700,color:'#fbbf24',background:'rgba(251,191,36,0.1)',padding:'4px 8px',borderRadius:8,fontFamily:'JetBrains Mono,monospace'}}>$130 · 100 mem</span>
                  </div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:5,marginTop:8}}>
                    {['HR managers','Office pools','Tech companies','Remote teams'].map(t=>(
                      <span key={t} style={{fontSize:10,fontWeight:600,color:'rgba(255,255,255,0.55)',background:'rgba(255,255,255,0.05)',padding:'3px 8px',borderRadius:100,border:'1px solid rgba(255,255,255,0.08)',fontFamily:'Outfit,sans-serif'}}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* ─── STEP 1 — Group setup ───────────────────────── */}
        {step===1&&(
          <__GC style={{padding:'16px',marginBottom:12}}>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',color:'rgba(255,255,255,0.5)',fontFamily:'Outfit,sans-serif',display:'block',marginBottom:8}}>{isCorp?'Company Group Name *':'Group Name *'}</label>
              <input value={groupName} onChange={e=>setGroupName(e.target.value)}
                placeholder={isCorp?'e.g. Engineering Dept — World Cup 2026':'e.g. Sunday Squad World Cup'}
                style={{width:'100%',height:46,padding:'0 14px',borderRadius:12,
                  background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.12)',
                  color:'white',fontSize:14,fontFamily:'Outfit,sans-serif',fontWeight:500,outline:'none'}}
                onFocus={e=>{e.target.style.border=`1px solid ${ac}55`;}}
                onBlur={e=>{e.target.style.border='1px solid rgba(255,255,255,0.12)';}}/>
            </div>

            <div>
              <label style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',color:'rgba(255,255,255,0.5)',fontFamily:'Outfit,sans-serif',display:'block',marginBottom:8}}>Group Type</label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                {[
                  {k:'tournament',icon:'trophy',l:'Full Tournament',d:'All 104 matches'},
                  {k:'single_match',icon:'zap',l:'Single Match',d:'One specific match'},
                ].map(o=>{
                  const on=groupType===o.k;
                  return(
                    <button key={o.k} onClick={()=>setGroupType(o.k)} style={{
                      padding:'12px',borderRadius:12,textAlign:'left',
                      background:on?`${ac}12`:'rgba(255,255,255,0.04)',
                      border:on?`1.5px solid ${ac}55`:'1px solid rgba(255,255,255,0.1)',
                      cursor:'pointer',transition:'all 0.18s',
                    }}>
                      <__IC name={o.icon} size={16} color={on?ac:'rgba(255,255,255,0.5)'} style={{marginBottom:6}}/>
                      <div style={{fontSize:12,fontWeight:700,color:'white',fontFamily:'Outfit,sans-serif'}}>{o.l}</div>
                      <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',fontFamily:'Outfit,sans-serif',marginTop:2}}>{o.d}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {groupType==='single_match'&&(
              <div style={{marginTop:14}}>
                <label style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',color:'rgba(255,255,255,0.5)',fontFamily:'Outfit,sans-serif',display:'block',marginBottom:8}}>Select Match</label>
                <div style={{display:'flex',flexDirection:'column',gap:5}}>
                  {FEATURED_MATCHES.map(m=>{
                    const on=selectedMatch===m.id;
                    return(
                      <button key={m.id} onClick={()=>setSelectedMatch(m.id)} style={{
                        padding:'10px 12px',borderRadius:10,textAlign:'left',
                        background:on?`${ac}10`:'rgba(255,255,255,0.03)',
                        border:on?`1px solid ${ac}45`:'1px solid rgba(255,255,255,0.08)',
                        cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',gap:8,
                      }}>
                        <span style={{fontSize:12.5,fontWeight:600,color:on?'white':'rgba(255,255,255,0.8)',fontFamily:'Outfit,sans-serif'}}>{m.label}</span>
                        <span style={{fontSize:10,color:on?ac:'rgba(255,255,255,0.35)',fontFamily:'JetBrains Mono,monospace',fontWeight:600,whiteSpace:'nowrap'}}>{m.detail}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </__GC>
        )}

        {/* ─── STEP 2 — Prizes / Buy-in ─────────────────── */}
        {step===2&&(
          <__GC style={{padding:'16px',marginBottom:12}}>
            {isCorp&&(
              <div style={{marginBottom:16}}>
                <label style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',color:'rgba(255,255,255,0.5)',fontFamily:'Outfit,sans-serif',display:'block',marginBottom:8}}>Prize Structure</label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {[
                    {k:'cash',   icon:'dollar', l:'Cash Split',      d:'Buy-in pot with % payouts',color:ac},
                    {k:'company',icon:'trophy', l:'Company Rewards', d:'Custom rewards, no money', color:'#fbbf24'},
                  ].map(o=>{
                    const on=prizeTrack===o.k;
                    return(
                      <button key={o.k} onClick={()=>setPrizeTrack(o.k)} style={{
                        padding:'12px',borderRadius:12,textAlign:'left',
                        background:on?`${o.color}14`:'rgba(255,255,255,0.04)',
                        border:on?`1.5px solid ${o.color}55`:'1px solid rgba(255,255,255,0.1)',
                        cursor:'pointer',transition:'all 0.18s',
                      }}>
                        <__IC name={o.icon} size={16} color={on?o.color:'rgba(255,255,255,0.5)'} style={{marginBottom:6}}/>
                        <div style={{fontSize:12,fontWeight:700,color:'white',fontFamily:'Outfit,sans-serif'}}>{o.l}</div>
                        <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',fontFamily:'Outfit,sans-serif',marginTop:2}}>{o.d}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {isCompanyPrize?(
              <div>
                <div style={{padding:'10px 12px',borderRadius:10,background:`${ac}0a`,border:`1px solid ${ac}25`,fontSize:11.5,color:'rgba(255,255,255,0.65)',fontFamily:'Outfit,sans-serif',marginBottom:14}}>
                  Specify custom workspace rewards for each leaderboard place below.
                </div>
                <label style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',color:'rgba(255,255,255,0.5)',fontFamily:'Outfit,sans-serif',display:'block',marginBottom:8}}>How many places to reward?</label>
                <div style={{display:'flex',gap:6,marginBottom:14}}>
                  {[1,2,3].map(n=>(
                    <button key={n} onClick={()=>setRewardPlaces(n)} style={{
                      flex:1,height:42,borderRadius:11,
                      background:rewardPlaces>=n?`${ac}15`:'rgba(255,255,255,0.04)',
                      border:rewardPlaces>=n?`1.5px solid ${ac}55`:'1px solid rgba(255,255,255,0.1)',
                      color:rewardPlaces>=n?ac:'rgba(255,255,255,0.55)',
                      fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:12.5,cursor:'pointer',
                    }}>{n===1?'1st Only':n===2?'Top 2':'Top 3'}</button>
                  ))}
                </div>
                {[
                  {place:1,label:'1st Place Reward',  key:'reward1',ph:'e.g. Extra day off + $100 Amazon Voucher'},
                  {place:2,label:'2nd Place Reward',  key:'reward2',ph:'e.g. Free company swag or free lunch'},
                  {place:3,label:'3rd Place Reward',  key:'reward3',ph:'e.g. Special desk trophy & bragging rights'},
                ].filter(r=>r.place<=rewardPlaces).map(r=>(
                  <div key={r.key} style={{marginBottom:10}}>
                    <label style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'rgba(255,255,255,0.4)',fontFamily:'Outfit,sans-serif',display:'block',marginBottom:5}}>{r.label}</label>
                    <input value={companyRewards[r.key]} onChange={e=>setCompanyRewards({...companyRewards,[r.key]:e.target.value})} placeholder={r.ph}
                      style={{width:'100%',height:40,padding:'0 12px',borderRadius:10,
                        background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',
                        color:'white',fontSize:13,fontFamily:'Outfit,sans-serif',outline:'none'}}/>
                  </div>
                ))}
              </div>
            ):(
              <div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
                  <div>
                    <label style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',color:'rgba(255,255,255,0.5)',fontFamily:'Outfit,sans-serif',display:'block',marginBottom:6}}>Buy-In ($)</label>
                    <input type="number" min={0} value={buyIn} onChange={e=>setBuyIn(+e.target.value)}
                      style={{width:'100%',height:42,padding:'0 12px',borderRadius:11,
                        background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',
                        color:'white',fontSize:14,fontFamily:'JetBrains Mono,monospace',fontWeight:700,outline:'none'}}/>
                  </div>
                  <div>
                    <label style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',color:'rgba(255,255,255,0.5)',fontFamily:'Outfit,sans-serif',display:'block',marginBottom:6}}>Target Members</label>
                    <input type="number" min={2} value={memberCount} onChange={e=>setMemberCount(+e.target.value)}
                      style={{width:'100%',height:42,padding:'0 12px',borderRadius:11,
                        background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',
                        color:'white',fontSize:14,fontFamily:'JetBrains Mono,monospace',fontWeight:700,outline:'none'}}/>
                  </div>
                </div>

                <div style={{padding:'12px 14px',borderRadius:11,
                  background:`linear-gradient(135deg,${ac}10,rgba(0,212,255,0.06))`,
                  border:`1px solid ${ac}30`,display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                  <span style={{fontSize:11,color:'rgba(255,255,255,0.65)',fontFamily:'Outfit,sans-serif',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em'}}>Projected Pot</span>
                  <span style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:22,color:ac}}>${totalPot}</span>
                </div>

                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <label style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',color:'rgba(255,255,255,0.5)',fontFamily:'Outfit,sans-serif'}}>Prize Pool Split</label>
                  <span style={{fontSize:11,fontWeight:700,color:totalPct===100?ac:'#f87171',fontFamily:'JetBrains Mono,monospace'}}>{totalPct}% allocated</span>
                </div>
                {[
                  {l:'1st Place', k:'first',  c:'#fbbf24'},
                  {l:'2nd Place', k:'second', c:'#94a3b8'},
                  {l:'3rd Place', k:'third',  c:'#f97316'},
                ].map(r=>{
                  const share=Math.round(totalPot*payouts[r.k]/100);
                  return(
                    <div key={r.k} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                      <div style={{width:24,height:24,borderRadius:'50%',background:`${r.c}20`,border:`1px solid ${r.c}40`,color:r.c,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:11,fontFamily:'JetBrains Mono,monospace'}}>{r.k==='first'?1:r.k==='second'?2:3}</div>
                      <span style={{flex:1,fontSize:13,color:'rgba(255,255,255,0.7)',fontFamily:'Outfit,sans-serif',fontWeight:600}}>{r.l}</span>
                      <input type="number" min={0} max={100} value={payouts[r.k]} onChange={e=>setPayouts({...payouts,[r.k]:+e.target.value})}
                        style={{width:60,height:34,borderRadius:9,
                          background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',
                          color:r.c,fontSize:13,fontFamily:'JetBrains Mono,monospace',fontWeight:900,textAlign:'right',padding:'0 10px',outline:'none'}}/>
                      <span style={{fontSize:11,color:'rgba(255,255,255,0.3)',fontFamily:'Outfit,sans-serif',fontWeight:600,width:14}}>%</span>
                      <span style={{fontSize:11,fontFamily:'JetBrains Mono,monospace',color:ac,fontWeight:700,width:50,textAlign:'right'}}>${share}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </__GC>
        )}

        {/* ─── STEP 3 — Scoring rules ────────────────────── */}
        {step===3&&(
          <__GC style={{padding:'8px 14px',marginBottom:12}}>
            <div style={{display:'flex',alignItems:'center',gap:6,padding:'10px 0 6px',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
              <__IC name="pen" size={13} color="#00D4FF" strokeWidth={2.2}/>
              <span style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',color:'rgba(255,255,255,0.55)',fontFamily:'Outfit,sans-serif'}}>Configure point weights</span>
            </div>
            {rules.map((r,i)=>(
              <div key={r.k} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',
                borderBottom:i<rules.length-1?'1px solid rgba(255,255,255,0.05)':'none',
                opacity:r.on?1:0.45}}>
                <button onClick={()=>setRules(rs=>rs.map(x=>x.k===r.k?{...x,on:!x.on}:x))}
                  style={{width:36,height:20,borderRadius:100,padding:0,border:'none',cursor:'pointer',
                    background:r.on?ac:'rgba(255,255,255,0.15)',
                    boxShadow:r.on?`0 0 8px ${ac}50`:'none',position:'relative',transition:'all 0.18s',flexShrink:0}}>
                  <div style={{position:'absolute',top:2,left:r.on?18:2,width:16,height:16,borderRadius:'50%',background:'white',boxShadow:'0 2px 6px rgba(0,0,0,0.4)',transition:'left 0.18s'}}/>
                </button>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:700,color:'white',fontFamily:'Outfit,sans-serif'}}>{r.label}</div>
                  <div style={{fontSize:10.5,color:'rgba(255,255,255,0.45)',fontFamily:'Outfit,sans-serif',marginTop:1}}>{r.desc}</div>
                </div>
                {r.on&&(
                  <div style={{display:'flex',alignItems:'center',gap:4,flexShrink:0}}>
                    <input type="number" min={0} value={r.pts}
                      onChange={e=>setRules(rs=>rs.map(x=>x.k===r.k?{...x,pts:+e.target.value}:x))}
                      style={{width:50,height:32,borderRadius:8,
                        background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',
                        color:ac,fontSize:13,fontFamily:'JetBrains Mono,monospace',fontWeight:900,textAlign:'center',outline:'none',padding:'0 4px'}}/>
                    <span style={{fontSize:10,color:'rgba(255,255,255,0.35)',fontFamily:'Outfit,sans-serif',fontWeight:600}}>pts</span>
                  </div>
                )}
              </div>
            ))}
          </__GC>
        )}

      </div>

      {/* CTA */}
      {step>0&&(
        <div style={{padding:'8px 18px 16px',flexShrink:0}}>
          <button onClick={()=>{
              if(step===1&&!groupName.trim())return;
              if(step===2&&!isCompanyPrize&&totalPct!==100)return;
              if(step===3)handleCreate();
              else setStep(s=>s+1);
            }}
            disabled={step===1&&!groupName.trim()}
            style={{
              width:'100%',height:50,borderRadius:14,border:'none',
              background:`linear-gradient(135deg,${ac},#00D4FF)`,color:'#050e08',
              fontFamily:'var(--display-font)',fontWeight:700,fontSize:15,letterSpacing:'0.02em',
              cursor:'pointer',boxShadow:`0 6px 24px ${ac}50`,transition:'all 0.2s',
              display:'flex',alignItems:'center',justifyContent:'center',gap:8,
              opacity:(step===1&&!groupName.trim())||(step===2&&!isCompanyPrize&&totalPct!==100)?0.5:1,
            }}>
            {step===3?<><__IC name="trophy" size={16} color="#050e08" strokeWidth={2.4}/>Complete & Launch Group</>:`Next: ${step===1?(isCorp?'Company Prizes':'Buy-In & Prizes'):'Scoring Rules'} →`}
          </button>
          {step===2&&!isCompanyPrize&&totalPct!==100&&(
            <div style={{textAlign:'center',marginTop:8,fontSize:11,color:'#f87171',fontFamily:'Outfit,sans-serif',fontWeight:600}}>Prize allocation must equal 100% (currently {totalPct}%)</div>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  PRICING SCREEN — Reflects the real two-track pricing
//  (Friend Circle $2/member, Corporate $75 or $130)
// ══════════════════════════════════════════════════════════
function PricingScreen({tweaks,setScreen}){
  const ac=tweaks.accentColor;
  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <__SB/>
      <__SH title="How Pricing Works" onBack={()=>setScreen('profile')}/>
      <div style={{flex:1,overflowY:'auto',padding:'4px 14px 90px'}}>

        <div style={{textAlign:'center',marginBottom:18,padding:'0 6px'}}>
          <div style={{fontFamily:'var(--display-font)',fontWeight:800,fontSize:26,color:'white',lineHeight:1.1,letterSpacing:'-0.005em'}}>Two ways to play.<br/>Pick what fits.</div>
          <div style={{fontSize:13,color:'rgba(255,255,255,0.55)',fontFamily:'Outfit,sans-serif',marginTop:8,lineHeight:1.5,maxWidth:300,margin:'8px auto 0'}}>One-time payments. No subscriptions. Covers the entire 2026 World Cup.</div>
        </div>

        {/* Friend Circle */}
        <__GC accent={ac} style={{padding:'18px 20px',marginBottom:12,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',inset:0,background:`radial-gradient(circle at 80% 0%,${ac}1f,transparent 65%)`,pointerEvents:'none'}}/>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
            <div style={{width:42,height:42,borderRadius:12,background:`${ac}20`,border:`1px solid ${ac}40`,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <__IC name="users" size={20} color={ac}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontFamily:'var(--display-font)',fontWeight:800,fontSize:19,color:'white'}}>Friend Circle</div>
              <__CH label="Free to create" color={ac} glow/>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'baseline',gap:6,marginBottom:12}}>
            <span style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:38,color:ac,lineHeight:1}}>$2</span>
            <span style={{fontSize:13,color:'rgba(255,255,255,0.55)',fontFamily:'Outfit,sans-serif',fontWeight:600}}>per friend, one-time</span>
          </div>
          <div style={{fontSize:13,color:'rgba(255,255,255,0.7)',fontFamily:'Outfit,sans-serif',lineHeight:1.5,marginBottom:14}}>
            You create the group for free. Each friend pays $2 when they join. Optionally add a buy-in pot for cash prizes.
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:7,marginBottom:14}}>
            {['No cap on group size','Optional cash pool with custom payouts','Group chat & live leaderboard','All 9 scoring rules customizable'].map(p=>(
              <div key={p} style={{display:'flex',alignItems:'center',gap:8}}>
                <__IC name="check" size={13} color={ac} strokeWidth={3}/>
                <span style={{fontSize:13,color:'rgba(255,255,255,0.78)',fontFamily:'Outfit,sans-serif'}}>{p}</span>
              </div>
            ))}
          </div>
          <button onClick={()=>setScreen('createGroup')} style={{
            width:'100%',height:44,borderRadius:12,border:'none',
            background:`linear-gradient(135deg,${ac},${ac}cc)`,color:'#050e08',
            fontFamily:'var(--display-font)',fontWeight:700,fontSize:14,letterSpacing:'0.02em',
            cursor:'pointer',boxShadow:`0 4px 18px ${ac}45`,
          }}>Start a Friend Circle</button>
        </__GC>

        {/* Corporate Sponsor */}
        <__GC style={{padding:'18px 20px',marginBottom:12,position:'relative',overflow:'hidden',border:'1px solid rgba(0,212,255,0.3)'}}>
          <div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 80% 0%,rgba(0,212,255,0.15),transparent 65%)',pointerEvents:'none'}}/>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
            <div style={{width:42,height:42,borderRadius:12,background:'rgba(0,212,255,0.18)',border:'1px solid rgba(0,212,255,0.4)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <__IC name="shieldCheck" size={20} color="#00D4FF"/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontFamily:'var(--display-font)',fontWeight:800,fontSize:19,color:'white'}}>Corporate Sponsor</div>
              <__CH label="Team pays $0" color="#00D4FF"/>
            </div>
          </div>
          <div style={{fontSize:13,color:'rgba(255,255,255,0.7)',fontFamily:'Outfit,sans-serif',lineHeight:1.5,marginBottom:14}}>
            One-time fee for the whole team. Every employee joins free. Choose cash payouts or custom company rewards.
          </div>

          {CORPORATE_TIERS.map(t=>(
            <div key={t.id} style={{
              padding:'12px 14px',marginBottom:8,borderRadius:12,
              background:t.popular?'rgba(0,212,255,0.06)':'rgba(255,255,255,0.03)',
              border:t.popular?'1.5px solid rgba(0,212,255,0.4)':'1px solid rgba(255,255,255,0.1)',
              display:'flex',alignItems:'center',gap:12,position:'relative',
            }}>
              {t.popular&&<div style={{position:'absolute',top:-9,right:12}}><__CH label="Popular" color="#00D4FF" glow/></div>}
              <div style={{flex:1}}>
                <div style={{fontFamily:'var(--display-font)',fontWeight:700,fontSize:15,color:'white'}}>{t.name}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',fontFamily:'Outfit,sans-serif',marginTop:2}}>{t.members} · employees join free</div>
              </div>
              <div style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:24,color:t.popular?'#00D4FF':'white'}}>${t.price}</div>
            </div>
          ))}
          <div style={{fontSize:11,color:'rgba(255,255,255,0.45)',fontFamily:'Outfit,sans-serif',textAlign:'center',marginTop:6,marginBottom:14,display:'flex',alignItems:'center',justifyContent:'center',gap:5}}>
            <__IC name="message" size={11} color="rgba(255,255,255,0.45)"/>
            Need more than 100 members? Contact us for Enterprise
          </div>

          <button onClick={()=>setScreen('createGroup')} style={{
            width:'100%',height:44,borderRadius:12,
            background:'rgba(0,212,255,0.12)',border:'1px solid rgba(0,212,255,0.35)',color:'#00D4FF',
            fontFamily:'var(--display-font)',fontWeight:700,fontSize:14,letterSpacing:'0.02em',cursor:'pointer',
          }}>Sponsor a Team</button>
        </__GC>

        <div style={{padding:'12px 14px',borderRadius:12,
          background:'rgba(18,14,38,0.32)',border:'1px solid rgba(255,255,255,0.08)',
          textAlign:'center',marginTop:8}}>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.65)',fontFamily:'Outfit,sans-serif',lineHeight:1.5}}>
            Payments processed by <strong style={{color:'white'}}>PayPal</strong>. All major cards accepted.
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  ADMIN PANEL — Matches real admin-panel.tsx features
//  Member payments, payout split editor, invite link, nudge
// ══════════════════════════════════════════════════════════
function AdminPanelScreen({tweaks,setScreen}){
  const ac=tweaks.accentColor;
  const members=window.MEMBERS||[];
  const [payouts,setPayouts]=_uS({first:60,second:30,third:10});
  const [saved,setSaved]=_uS(false);
  const [paidMap,setPaidMap]=_uS(()=>Object.fromEntries(members.map((m,i)=>[m.id,i%4!==0])));

  const totalPct=payouts.first+payouts.second+payouts.third;
  const buyIn=20;
  const paidCount=Object.values(paidMap).filter(Boolean).length;
  const paidAmount=paidCount*buyIn;
  const totalPot=members.length*buyIn;
  const passkey='K7XQ';
  const inviteUrl=`cupclash.live/join/${passkey}`;

  function togglePaid(id){setPaidMap(p=>({...p,[id]:!p[id]}));}
  function savePayouts(){if(totalPct===100){setSaved(true);setTimeout(()=>setSaved(false),2200);}}

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <__SB/>
      <__SH title="Admin Panel" onBack={()=>setScreen('profile')}
        action={<__CH label="Owner" color={ac} glow/>}/>
      <div style={{flex:1,overflowY:'auto',padding:'2px 14px 90px'}}>

        <div style={{marginBottom:14}}>
          <div style={{fontFamily:'var(--display-font)',fontWeight:800,fontSize:22,color:'white',letterSpacing:'-0.005em',lineHeight:1.1}}>Tech Titans</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.5)',fontFamily:'Outfit,sans-serif',marginTop:4}}>Friend Circle · $20 buy-in · Tournament</div>
        </div>

        {/* Member Payments */}
        <__GC style={{padding:'16px',marginBottom:14}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <__IC name="users" size={16} color="#00D4FF"/>
              <span style={{fontFamily:'var(--display-font)',fontWeight:700,fontSize:16,color:'white'}}>Member Payments</span>
            </div>
            <span style={{fontSize:10,fontWeight:700,color:'#00D4FF',fontFamily:'Outfit,sans-serif',textTransform:'uppercase',letterSpacing:'0.1em'}}>{paidCount}/{members.length} Paid</span>
          </div>
          {/* Progress bar */}
          <div style={{height:5,borderRadius:3,background:'rgba(255,255,255,0.08)',overflow:'hidden',marginBottom:14}}>
            <div style={{height:'100%',background:'linear-gradient(90deg,#00D4FF,#00FF88)',width:`${(paidCount/members.length)*100}%`,boxShadow:'0 0 8px rgba(0,255,136,0.5)',transition:'width 0.3s'}}/>
          </div>
          {members.map((m,i)=>{
            const paid=paidMap[m.id];
            return(
              <div key={m.id} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 0',
                borderTop:i>0?'1px solid rgba(255,255,255,0.05)':'none'}}>
                <__AV name={m.name} size={28} you={m.id==='me'}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:700,color:'white',fontFamily:'Outfit,sans-serif'}}>{m.name}</div>
                  <div style={{fontSize:10,color:'rgba(255,255,255,0.3)',fontFamily:'Outfit,sans-serif'}}>{m.pts} pts</div>
                </div>
                <button title="Send reminder" style={{width:28,height:28,borderRadius:8,background:'rgba(251,191,36,0.1)',border:'1px solid rgba(251,191,36,0.25)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0}}>
                  <__IC name="bell" size={12} color="#fbbf24"/>
                </button>
                <span style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.5)',fontFamily:'JetBrains Mono,monospace'}}>$20</span>
                <button onClick={()=>togglePaid(m.id)} style={{
                  display:'flex',alignItems:'center',gap:4,padding:'4px 9px',borderRadius:100,cursor:'pointer',
                  background:paid?`${ac}14`:'rgba(248,113,113,0.1)',
                  border:paid?`1px solid ${ac}30`:'1px solid rgba(248,113,113,0.25)',
                  color:paid?ac:'#f87171',
                  fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:9,textTransform:'uppercase',letterSpacing:'0.08em',
                }}>
                  <__IC name={paid?'check':'lock'} size={10} color={paid?ac:'#f87171'} strokeWidth={3}/>
                  {paid?'Paid':'Pending'}
                </button>
              </div>
            );
          })}
          <div style={{paddingTop:12,marginTop:8,borderTop:'1px solid rgba(255,255,255,0.07)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:11,color:'rgba(255,255,255,0.4)',fontFamily:'Outfit,sans-serif',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em'}}>Pot Collected</span>
            <span><span style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:22,color:ac}}>${paidAmount}</span><span style={{fontSize:12,color:'rgba(255,255,255,0.3)',marginLeft:4,fontFamily:'JetBrains Mono,monospace'}}>/ ${totalPot}</span></span>
          </div>
        </__GC>

        {/* Payout Split */}
        <__GC style={{padding:'16px',marginBottom:14}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <__IC name="trophy" size={16} color="#fbbf24"/>
              <span style={{fontFamily:'var(--display-font)',fontWeight:700,fontSize:16,color:'white'}}>Payout Split</span>
            </div>
            <span style={{fontSize:11,fontWeight:700,color:totalPct===100?ac:'#f87171',fontFamily:'JetBrains Mono,monospace'}}>{totalPct}% / 100%</span>
          </div>
          {[
            {l:'1st',k:'first', c:'#fbbf24'},
            {l:'2nd',k:'second',c:'#94a3b8'},
            {l:'3rd',k:'third', c:'#f97316'},
          ].map(r=>{
            const amt=Math.round(paidAmount*payouts[r.k]/100);
            return(
              <div key={r.k} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                <div style={{width:24,height:24,borderRadius:'50%',background:`${r.c}20`,border:`1px solid ${r.c}40`,color:r.c,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:10,fontFamily:'JetBrains Mono,monospace'}}>{r.l}</div>
                <input type="number" min={0} max={100} value={payouts[r.k]} onChange={e=>{setPayouts({...payouts,[r.k]:+e.target.value});setSaved(false);}}
                  style={{flex:1,height:36,borderRadius:10,
                    background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',
                    color:r.c,fontSize:13,fontFamily:'JetBrains Mono,monospace',fontWeight:900,textAlign:'right',padding:'0 26px 0 12px',outline:'none'}}/>
                <span style={{fontSize:11,color:'rgba(255,255,255,0.4)',fontFamily:'JetBrains Mono,monospace',fontWeight:700,marginLeft:-22}}>%</span>
                <span style={{fontSize:13,fontFamily:'JetBrains Mono,monospace',color:'#00D4FF',fontWeight:700,width:50,textAlign:'right'}}>${amt}</span>
              </div>
            );
          })}
          <button onClick={savePayouts} disabled={totalPct!==100} style={{
            width:'100%',height:38,borderRadius:11,marginTop:8,border:'none',
            background:totalPct===100?`linear-gradient(135deg,${ac},${ac}cc)`:'rgba(255,255,255,0.04)',
            color:totalPct===100?'#050e08':'rgba(255,255,255,0.3)',
            fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:12,letterSpacing:'0.06em',
            cursor:totalPct===100?'pointer':'not-allowed',transition:'all 0.18s',
            display:'flex',alignItems:'center',justifyContent:'center',gap:6,
          }}>
            <__IC name={saved?'check':'trophy'} size={12} color={totalPct===100?'#050e08':'rgba(255,255,255,0.3)'} strokeWidth={2.5}/>
            {saved?'Saved!':'Save Payout Split'}
          </button>
        </__GC>

        {/* Invite Link */}
        <__GC style={{padding:'16px',marginBottom:14}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
            <__IC name="users" size={16} color="#00D4FF"/>
            <span style={{fontFamily:'var(--display-font)',fontWeight:700,fontSize:16,color:'white'}}>Invite Link</span>
            <__CH label={`Passkey ${passkey}`} color={ac} style={{marginLeft:'auto'}}/>
          </div>
          <div style={{padding:'10px 12px',borderRadius:10,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',fontFamily:'JetBrains Mono,monospace',fontSize:12,color:'rgba(255,255,255,0.55)',marginBottom:10,wordBreak:'break-all'}}>{inviteUrl}</div>
          <div style={{display:'flex',gap:8}}>
            <button style={{flex:1,height:38,borderRadius:10,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.12)',color:'white',fontFamily:'Outfit,sans-serif',fontWeight:600,fontSize:12,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
              <__IC name="check" size={12} color="white" strokeWidth={2.5}/>Copy Link
            </button>
            <button style={{padding:'0 14px',height:38,borderRadius:10,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.7)',fontFamily:'Outfit,sans-serif',fontWeight:600,fontSize:12,cursor:'pointer',display:'flex',alignItems:'center',gap:5}}>
              <__IC name="zap" size={12} color="rgba(255,255,255,0.7)"/>New Code
            </button>
          </div>
        </__GC>

        {/* Danger zone */}
        <__GC style={{padding:'14px 16px',marginBottom:14,border:'1px solid rgba(248,113,113,0.18)'}}>
          <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.14em',color:'rgba(248,113,113,0.8)',fontFamily:'Outfit,sans-serif',marginBottom:10}}>Danger zone</div>
          {[
            {l:'Archive group',d:'Members keep access · No new predictions',btn:'Archive',hot:false},
            {l:'Delete group',d:'Cannot be undone · Refunds pot',btn:'Delete',hot:true},
          ].map((r,i)=>(
            <div key={r.l} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderTop:i>0?'1px solid rgba(255,255,255,0.05)':'none'}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:r.hot?'#f87171':'white',fontFamily:'Outfit,sans-serif'}}>{r.l}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.45)',fontFamily:'Outfit,sans-serif',marginTop:2}}>{r.d}</div>
              </div>
              <button style={{height:34,padding:'0 14px',borderRadius:10,
                background:r.hot?'rgba(248,113,113,0.16)':'rgba(248,113,113,0.08)',
                border:`1px solid rgba(248,113,113,${r.hot?0.4:0.25})`,color:'#f87171',
                fontFamily:'Outfit,sans-serif',fontWeight:r.hot?700:600,fontSize:12,cursor:'pointer'}}>{r.btn}</button>
            </div>
          ))}
        </__GC>
      </div>
    </div>
  );
}

Object.assign(window,{WelcomeScreen,SignUpScreen,CreateGroupScreen,PricingScreen,AdminPanelScreen});
