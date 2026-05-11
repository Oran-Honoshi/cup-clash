// SEO Schema components — included in app/layout.tsx

export function SoftwareAppSchema() {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Cup Clash",
      "url": "https://cupclash.live",
      "description": "World Cup 2026 private prediction league for friends and offices. Set up in 60 seconds, $2 per player.",
      "applicationCategory": "SportsApplication",
      "operatingSystem": "Web, iOS, Android",
      "inLanguage": ["en", "he", "es", "de", "pt", "fr", "nl"],
      "offers": {
        "@type": "Offer",
        "price": "2.00",
        "priceCurrency": "USD",
        "description": "Full tournament access per member — all 104 matches"
      },
      "featureList": [
        "World Cup 2026 match predictions",
        "Private group leagues with passkey",
        "Live leaderboard with real-time scoring",
        "Knockout bracket predictions",
        "Group chat with GIFs",
        "Push notifications for goals",
        "Mobile PWA — no download needed",
        "7-language interface"
      ]
    })}} />
  );
}

export function FAQSchema() {
  const entries = [
    // English
    { q: "How do I set up a private World Cup 2026 prediction league?", a: "Create a free group on Cup Clash in under 60 seconds. Share your 6-letter passkey with friends — they pay $2 each to join the leaderboard and predict all 104 matches of the 2026 World Cup." },
    { q: "When does the 2026 World Cup start?", a: "The 2026 FIFA World Cup kicks off June 11, 2026, with Mexico vs South Africa at Estadio Azteca. The Final is July 19, 2026, at MetLife Stadium, New Jersey. 48 teams, 104 matches across USA, Canada and Mexico." },
    { q: "What is the best app for a World Cup 2026 office pool?", a: "Cup Clash is designed for private group prediction leagues. Admins create a group for free. Members pay $2 for the whole tournament. Features include live leaderboards, knockout brackets, and real-time scoring." },
    { q: "How does scoring work in a World Cup prediction league?", a: "Exact score = 25 points. Correct result = 10 points. Knockout advancement = 20 points. Tournament winner = 100 points. Top scorer and assister = 50 points each. Admins can customize all values." },
    // Spanish
    { q: "¿Cómo creo una quiniela privada para el Mundial 2026?", a: "Crea un grupo gratis en Cup Clash en menos de 60 segundos. Comparte tu clave de 6 letras con amigos. Cada miembro paga $2 para desbloquear todos los 104 partidos del Mundial 2026." },
    { q: "¿Cuándo empieza el Mundial 2026?", a: "El Mundial 2026 arranca el 11 de junio de 2026 con México vs Sudáfrica en el Estadio Azteca. La Final es el 19 de julio en el MetLife Stadium, Nueva Jersey. 48 equipos y 104 partidos." },
    // German
    { q: "Wie erstelle ich ein WM 2026 Tippspiel für Freunde?", a: "Erstelle kostenlos eine Gruppe auf Cup Clash in unter 60 Sekunden. Teile dein 6-stelliges Passwort mit Freunden. Jedes Mitglied zahlt $2 für alle 104 Spiele der WM 2026." },
    { q: "Wann beginnt die WM 2026?", a: "Die FIFA WM 2026 beginnt am 11. Juni 2026 mit Mexiko gegen Südafrika im Estadio Azteca. Das Finale findet am 19. Juli im MetLife Stadium, New Jersey statt." },
    // Portuguese
    { q: "Como criar um bolão da Copa do Mundo 2026?", a: "Crie um grupo grátis no Cup Clash em menos de 60 segundos. Compartilhe sua senha de 6 letras com amigos. Cada membro paga $2 para desbloquear todos os 104 jogos da Copa 2026." },
    // French
    { q: "Comment créer un groupe de pronostics pour le Mondial 2026?", a: "Créez un groupe gratuit sur Cup Clash en moins de 60 secondes. Partagez votre code à 6 lettres avec vos amis. Chaque membre paie 2$ pour débloquer les 104 matchs de la Coupe du Monde 2026." },
    // Hebrew
    { q: "מתי ואיפה מתקיים מונדיאל 2026?", a: "מונדיאל 2026 יתקיים בין ה-11 ביוני ל-19 ביולי 2026 בארצות הברית, קנדה ומקסיקו. 48 נבחרות ו-104 משחקים. הגמר באצטדיון MetLife בניו ג'רזי." },
    { q: "איך עובדת שיטת הניחושים ב-CupClash?", a: "ניחוש תוצאה מדויקת = 25 נקודות. ניחוש המנצחת = 10 נקודות. ניחוש קידום בנוקאאוט = 20 נקודות. ניחוש אלוף הטורניר = 100 נקודות. הצטרפות עולה $2 בלבד לכל הטורניר." },
    // Dutch
    { q: "Hoe maak ik een WK 2026 voorspellingsgroep aan?", a: "Maak gratis een groep aan op Cup Clash in minder dan 60 seconden. Deel je 6-letterige toegangscode met vrienden. Elk lid betaalt $2 voor alle 104 wedstrijden van het WK 2026." },
  ];

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": entries.map(({ q, a }) => ({
        "@type": "Question",
        "name": q,
        "acceptedAnswer": { "@type": "Answer", "text": a }
      }))
    })}} />
  );
}

export function HowToSchema() {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to invite friends to a World Cup 2026 Prediction League in 3 steps",
      "description": "Set up a private World Cup 2026 prediction group for friends, family or colleagues using Cup Clash.",
      "totalTime": "PT5M",
      "estimatedCost": { "@type": "MonetaryAmount", "currency": "USD", "value": "0" },
      "step": [
        { "@type": "HowToStep", "position": 1, "name": "Create your group", "text": "Sign up free on Cup Clash, name your group, set your buy-in and payout split. Your unique 6-letter passkey is generated automatically.", "url": "https://cupclash.live/create-group" },
        { "@type": "HowToStep", "position": 2, "name": "Share your passkey", "text": "Tap Invite Members and share via WhatsApp, Telegram, email or SMS. Friends receive a direct join link.", "url": "https://cupclash.live" },
        { "@type": "HowToStep", "position": 3, "name": "Members join and predict", "text": "Each member pays $2 to unlock all 104 match predictions, live leaderboard, group chat, and knockout bracket. Predictions lock 5 minutes before kickoff.", "url": "https://cupclash.live/join" }
      ]
    })}} />
  );
}

export function MatchEventSchema({ home, away, kickoffUtc, stadium, city }: {
  home: string; away: string; kickoffUtc: string; stadium: string; city: string;
}) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      "name": `${home} vs ${away} — FIFA World Cup 2026`,
      "startDate": kickoffUtc,
      "location": { "@type": "Place", "name": stadium, "address": { "@type": "PostalAddress", "addressLocality": city } },
      "organizer": { "@type": "Organization", "name": "FIFA" },
      "competitor": [{ "@type": "SportsTeam", "name": home }, { "@type": "SportsTeam", "name": away }],
      "url": "https://cupclash.live/schedule"
    })}} />
  );
}