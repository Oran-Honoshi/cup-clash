// SEO Schema components — add to app/layout.tsx or individual pages

export function SoftwareAppSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Cup Clash",
          "url": "https://cupclash.live",
          "description": "The ultimate World Cup 2026 prediction league for private groups. Set up in 60 seconds, $2 per player for the whole tournament.",
          "applicationCategory": "SportsApplication",
          "operatingSystem": "Web, iOS, Android",
          "offers": {
            "@type": "Offer",
            "price": "2.00",
            "priceCurrency": "USD",
            "description": "Full tournament access per member"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "1200"
          },
          "featureList": [
            "World Cup 2026 match predictions",
            "Private group leagues",
            "Live leaderboard",
            "Real-time scoring",
            "Mobile PWA"
          ]
        })
      }}
    />
  );
}

export function FAQSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Can I use Cup Clash for a corporate office pool or team-building activity?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. Cup Clash offers corporate tiers where an HR manager or admin pays a single flat fee ($75 for up to 50 members, $130 for up to 100 members). Every employee joins for free with zero checkout friction. Replace cash pools with company prizes like gift cards, extra vacation days, or team lunches."
              }
            },
            {
              "@type": "Question",
              "name": "How do remote teams participate in a World Cup 2026 office pool?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Cup Clash is fully web-based. Share your corporate invite link in Slack, Microsoft Teams, or WhatsApp. Team members worldwide sign up instantly with no app download required."
              }
            },
            {
              "@type": "Question",
              "name": "How do I set up a private World Cup 2026 prediction league for my friends?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Create a free group on Cup Clash in under 60 seconds. Share your 6-letter passkey with friends — they pay $2 each to join the leaderboard and start predicting all 104 matches of the 2026 World Cup."
              }
            },
            {
              "@type": "Question",
              "name": "How many teams and matches are in the 2026 World Cup?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The 2026 FIFA World Cup features 48 teams across 12 groups, playing 104 matches total from June 11 to July 19, 2026, hosted across USA, Canada, and Mexico."
              }
            },
            {
              "@type": "Question",
              "name": "What is the best app for a World Cup 2026 office pool?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Cup Clash is designed specifically for private group prediction leagues. Admins create a group for free, members pay $2 for the whole tournament. Features include live leaderboards, knockout brackets, and real-time scoring."
              }
            },
            {
              "@type": "Question",
              "name": "How does scoring work in a World Cup prediction league?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "In Cup Clash, predicting the correct match outcome earns 10 points. Predicting the exact score earns 25 points. Tournament bonus picks (winner, top scorer) earn up to 100 points each. Admins can customize all point values."
              }
            },
            {
              "@type": "Question",
              "name": "When does the 2026 World Cup start?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The 2026 FIFA World Cup kicks off on June 11, 2026, with Mexico vs South Africa at Estadio Azteca in Mexico City. The Final is on July 19, 2026, at MetLife Stadium in New Jersey."
              }
            },
            // Hebrew FAQ
            {
              "@type": "Question",
              "name": "מתי ואיפה מתקיים מונדיאל 2026?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "מונדיאל 2026 יתקיים בקיץ 2026 ויתארח בשלוש מדינות: ארצות הברית, קנדה ומקסיקו. הטורניר יכלול 48 נבחרות ו-104 משחקים, ויתחיל ב-11 ביוני 2026."
              }
            },
            {
              "@type": "Question",
              "name": "איך עובדת שיטת הניחושים ב-CupClash?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "ב-CupClash מנחשים את תוצאות המשחקים וצוברים נקודות לפי דיוק. ניחוש תוצאה מדויקת מעניק 25 נקודות, ניחוש נכון של המנצחת בלבד מעניק 10 נקודות. הצטרפות לקבוצה עולה $2 לכל הטורניר."
              }
            },
            {
              "@type": "Question",
              "name": "האם אפשר להקים ליגה פרטית לחברים למונדיאל 2026?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "בהחלט. CupClash מאפשרת פתיחת קבוצות סגורות לחברים, משפחה או קולגות. המנהל פותח קבוצה בחינם, חברים מצטרפים עם קוד גישה בתשלום של $2 בלבד לכל הטורניר."
              }
            }
          ]
        })
      }}
    />
  );
}

export function HowToSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": "How to invite friends to a World Cup 2026 Prediction League in 3 steps",
          "description": "Set up a private World Cup 2026 prediction group for friends, family or colleagues using Cup Clash.",
          "totalTime": "PT5M",
          "estimatedCost": {
            "@type": "MonetaryAmount",
            "currency": "USD",
            "value": "0"
          },
          "step": [
            {
              "@type": "HowToStep",
              "position": 1,
              "name": "Create your group",
              "text": "Sign up for free on Cup Clash, name your group, set your buy-in amount and payout split. Your unique 6-letter passkey is generated automatically.",
              "url": "https://cupclash.live/create-group"
            },
            {
              "@type": "HowToStep",
              "position": 2,
              "name": "Share your passkey",
              "text": "Tap 'Invite Members' and share via WhatsApp, Telegram, email or SMS. Friends receive a direct link to join your group.",
              "url": "https://cupclash.live"
            },
            {
              "@type": "HowToStep",
              "position": 3,
              "name": "Members join and predict",
              "text": "Each member pays $2 to unlock all 104 match predictions, the live leaderboard, group chat, and knockout bracket. Predictions lock 5 minutes before each kickoff.",
              "url": "https://cupclash.live/join"
            }
          ]
        })
      }}
    />
  );
}

// Event schema for a specific match — use on schedule/match pages
export function MatchEventSchema({ home, away, kickoffUtc, stadium, city }: {
  home: string; away: string; kickoffUtc: string; stadium: string; city: string;
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SportsEvent",
          "name": `${home} vs ${away} — FIFA World Cup 2026`,
          "startDate": kickoffUtc,
          "location": {
            "@type": "Place",
            "name": stadium,
            "address": { "@type": "PostalAddress", "addressLocality": city }
          },
          "organizer": { "@type": "Organization", "name": "FIFA" },
          "competitor": [
            { "@type": "SportsTeam", "name": home },
            { "@type": "SportsTeam", "name": away }
          ],
          "url": `https://cupclash.live/schedule`
        })
      }}
    />
  );
}