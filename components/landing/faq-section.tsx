"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

type Lang = "en" | "he" | "es" | "de" | "pt" | "fr" | "nl";

const LANG_META: Record<Lang, { label: string; flag: string; dir: "ltr" | "rtl" }> = {
  en: { label: "English",    flag: "🇬🇧", dir: "ltr" },
  he: { label: "עברית",      flag: "🇮🇱", dir: "rtl" },
  es: { label: "Español",    flag: "🇪🇸", dir: "ltr" },
  de: { label: "Deutsch",    flag: "🇩🇪", dir: "ltr" },
  pt: { label: "Português",  flag: "🇧🇷", dir: "ltr" },
  fr: { label: "Français",   flag: "🇫🇷", dir: "ltr" },
  nl: { label: "Nederlands", flag: "🇳🇱", dir: "ltr" },
};

const FAQS: Record<Lang, Array<{ q: string; a: string }>> = {
  en: [
    { q: "When does the 2026 World Cup start?", a: "The 2026 FIFA World Cup kicks off June 11, 2026 with Mexico vs South Africa at Estadio Azteca. The Final is July 19, 2026 at MetLife Stadium, New Jersey. 48 teams, 104 matches across USA, Canada and Mexico." },
    { q: "How do I create a World Cup 2026 prediction group?", a: "Sign up free on Cup Clash, name your group, set your prize split — takes 60 seconds. Share the 6-letter passkey with friends. Each member pays $2 to unlock all 104 match predictions for the whole tournament." },
    { q: "How does the scoring system work?", a: "Exact score = 25 points. Correct result = 10 points. Knockout advancement pick = 20 points. Tournament winner bonus = 100 points. Top scorer and assister = 50 points each. Admins can customize all values." },
    { q: "Can I be in multiple groups?", a: "Yes. Join as many groups as you like, each for $2. Use the Copy Predictions feature to instantly fill your scores from one group to another — no need to re-enter everything." },
    { q: "Is Cup Clash an app I need to download?", a: "No download needed. Cup Clash is a PWA — open cupclash.live on your phone and tap 'Add to Home Screen'. It works exactly like a native app with push notifications for goals and results." },
    { q: "What is the new 2026 World Cup format?", a: "For the first time, 48 teams compete in 12 groups of 4. The new Round of 32 is added before the Round of 16, creating 104 total matches — 38 more than the 2022 World Cup in Qatar." },
    { q: "How does the prize pot work?", a: "The admin sets a buy-in amount (e.g. $20) and payout split (e.g. 60/30/10%). Cup Clash calculates the prize pot automatically and tracks who has paid. The app never handles the money — that stays between you." },
  ],
  he: [
    { q: "מתי ואיפה מתקיים מונדיאל 2026?", a: "מונדיאל 2026 יתקיים בין ה-11 ביוני ל-19 ביולי 2026 בשלוש מדינות: ארצות הברית, קנדה ומקסיקו. 48 נבחרות ו-104 משחקים. הגמר באצטדיון MetLife בניו ג'רזי." },
    { q: "כמה עולה להצטרף ב-CupClash?", a: "הצטרפות לקבוצה עולה $2 בלבד לכל הטורניר — כמחיר כוס קפה. המנהל פותח קבוצה בחינם, כל חבר משלם $2 וזוכה בגישה מלאה ל-104 משחקים." },
    { q: "איך עובדת שיטת הניחושים?", a: "ניחוש תוצאה מדויקת = 25 נקודות. ניחוש המנצחת הנכונה = 10 נקודות. ניחוש קידום בנוקאאוט = 20 נקודות. ניחוש אלוף הטורניר = 100 נקודות. מנהל הקבוצה יכול לשנות את הערכים." },
    { q: "האם אפשר להיות בכמה קבוצות?", a: "בהחלט. אפשר להצטרף לכמה קבוצות שרוצים, כל אחת ב-$2. השתמשו בפיצ'ר 'העתק ניחושים' כדי לייבא את הניחושים שלכם מקבוצה אחת לאחרת בלחיצה אחת." },
    { q: "האם CupClash זמינה כאפליקציה?", a: "לא צריך להוריד אפליקציה. CupClash היא PWA — פותחים את cupclash.live בסמארטפון ולוחצים 'הוסף למסך הבית'. מקבלים התראות על שערים ותוצאות." },
    { q: "מהו הפורמט החדש של מונדיאל 2026?", a: "לראשונה בהיסטוריה, 48 נבחרות ב-12 בתים של 4 נבחרות. שלב 'עידן של 32' חדש נוסף לפני שמינית הגמר, מה שמביא את מספר המשחקים ל-104 בסך הכל." },
    { q: "איך עובד פרס הקבוצה?", a: "המנהל קובע סכום כניסה (למשל $20) וחלוקת פרסים (למשל 60/30/10%). CupClash מחשב את סכום הפרס אוטומטית ועוקב אחרי מי שילם. הכסף עובר ישירות בין החברים — לא דרך האפליקציה." },
  ],
  es: [
    { q: "¿Cuándo empieza el Mundial 2026?", a: "El Mundial 2026 arranca el 11 de junio de 2026 con México vs Sudáfrica en el Estadio Azteca. La Final es el 19 de julio en el MetLife Stadium, Nueva Jersey. 48 equipos y 104 partidos en EE.UU., Canadá y México." },
    { q: "¿Cómo creo un grupo de predicciones para el Mundial?", a: "Regístrate gratis en Cup Clash, ponle nombre a tu grupo y define el reparto de premios — 60 segundos. Comparte la clave de 6 letras con tus amigos. Cada miembro paga $2 para desbloquear las predicciones de los 104 partidos." },
    { q: "¿Cómo funciona el sistema de puntuación?", a: "Resultado exacto = 25 puntos. Resultado correcto = 10 puntos. Pase de ronda correcto = 20 puntos. Campeón del torneo = 100 puntos. Máximo goleador y asistidor = 50 puntos cada uno." },
    { q: "¿Puedo estar en varios grupos?", a: "Sí, puedes unirte a todos los grupos que quieras, cada uno por $2. Usa la función 'Copiar predicciones' para importar tus resultados de un grupo a otro con un solo clic." },
    { q: "¿Cuál es el nuevo formato del Mundial 2026?", a: "Por primera vez, 48 selecciones en 12 grupos de 4. Se añade una nueva Ronda de 32 antes de los octavos de final, lo que da un total de 104 partidos — 38 más que en Qatar 2022." },
    { q: "¿Necesito descargar una app?", a: "No hace falta descarga. Cup Clash es una PWA — abre cupclash.live en tu móvil y pulsa 'Añadir a pantalla de inicio'. Funciona como una app nativa con notificaciones push para goles y resultados." },
  ],
  de: [
    { q: "Wann beginnt die WM 2026?", a: "Die FIFA WM 2026 beginnt am 11. Juni 2026 mit Mexiko gegen Südafrika im Estadio Azteca. Das Finale findet am 19. Juli im MetLife Stadium in New Jersey statt. 48 Teams, 104 Spiele in den USA, Kanada und Mexiko." },
    { q: "Wie erstelle ich eine WM 2026 Tipp-Gruppe?", a: "Registriere dich kostenlos auf Cup Clash, gib deiner Gruppe einen Namen und lege die Preisverteilung fest — dauert 60 Sekunden. Teile das 6-stellige Passwort mit Freunden. Jedes Mitglied zahlt $2 für alle 104 Spiele." },
    { q: "Wie funktioniert das Punktesystem?", a: "Exaktes Ergebnis = 25 Punkte. Richtiger Ausgang = 10 Punkte. K.o.-Runden-Tipp = 20 Punkte. WM-Sieger-Tipp = 100 Punkte. Torschützenkönig und Vorlagengeber = je 50 Punkte." },
    { q: "Was ist das neue WM 2026 Format?", a: "Erstmals nehmen 48 Teams in 12 Gruppen teil. Eine neue Runde der 32 kommt vor dem Achtelfinale hinzu, was insgesamt 104 Spiele ergibt — 38 mehr als bei der WM 2022 in Katar." },
    { q: "Muss ich eine App herunterladen?", a: "Kein Download nötig. Cup Clash ist eine PWA — öffne cupclash.live auf deinem Handy und tippe auf 'Zum Startbildschirm hinzufügen'. Funktioniert wie eine native App mit Push-Benachrichtigungen für Tore und Ergebnisse." },
    { q: "Kann ich in mehreren Gruppen mitspielen?", a: "Ja, du kannst so vielen Gruppen beitreten wie du möchtest, jede für $2. Nutze die Funktion 'Tipps kopieren', um deine Vorhersagen mit einem Klick von einer Gruppe in eine andere zu importieren." },
  ],
  pt: [
    { q: "Quando começa a Copa do Mundo 2026?", a: "A Copa do Mundo FIFA 2026 começa em 11 de junho de 2026 com México x África do Sul no Estádio Azteca. A Final é em 19 de julho no MetLife Stadium, Nova Jersey. 48 seleções e 104 jogos nos EUA, Canadá e México." },
    { q: "Como crio um grupo de palpites para a Copa 2026?", a: "Cadastre-se gratuitamente no Cup Clash, nomeie seu grupo e defina a divisão de prêmios — leva 60 segundos. Compartilhe a senha de 6 letras com os amigos. Cada membro paga $2 para desbloquear os palpites dos 104 jogos." },
    { q: "Como funciona o sistema de pontuação?", a: "Placar exato = 25 pontos. Resultado correto = 10 pontos. Classificação no mata-mata = 20 pontos. Campeão do torneio = 100 pontos. Artilheiro e assistente = 50 pontos cada." },
    { q: "Qual é o novo formato da Copa 2026?", a: "Pela primeira vez, 48 seleções em 12 grupos de 4. Uma nova fase de 32 equipes é adicionada antes das oitavas de final, totalizando 104 jogos — 38 a mais que no Catar 2022." },
    { q: "Preciso baixar um aplicativo?", a: "Não é necessário download. Cup Clash é um PWA — abra cupclash.live no celular e toque em 'Adicionar à tela inicial'. Funciona como um app nativo com notificações push para gols e resultados." },
    { q: "Posso participar de vários grupos?", a: "Sim, você pode entrar em quantos grupos quiser, cada um por $2. Use o recurso 'Copiar palpites' para importar suas previsões de um grupo para outro com um clique." },
  ],
  fr: [
    { q: "Quand commence la Coupe du Monde 2026?", a: "La Coupe du Monde FIFA 2026 débute le 11 juin 2026 avec Mexique vs Afrique du Sud à l'Estadio Azteca. La Finale est le 19 juillet au MetLife Stadium, New Jersey. 48 équipes, 104 matchs aux États-Unis, au Canada et au Mexique." },
    { q: "Comment créer un groupe de pronostics pour le Mondial 2026?", a: "Inscrivez-vous gratuitement sur Cup Clash, nommez votre groupe et définissez la répartition des prix — 60 secondes suffisent. Partagez le code à 6 lettres avec vos amis. Chaque membre paie 2$ pour débloquer tous les 104 matchs." },
    { q: "Comment fonctionne le système de points?", a: "Score exact = 25 points. Bon résultat = 10 points. Qualification en phase à élimination = 20 points. Vainqueur du tournoi = 100 points. Meilleur buteur et passeur = 50 points chacun." },
    { q: "Quel est le nouveau format de la Coupe du Monde 2026?", a: "Pour la première fois, 48 équipes dans 12 groupes de 4. Un nouveau tour de 32 est ajouté avant les huitièmes de finale, pour un total de 104 matchs — 38 de plus qu'au Qatar 2022." },
    { q: "Dois-je télécharger une application?", a: "Aucun téléchargement nécessaire. Cup Clash est une PWA — ouvrez cupclash.live sur votre téléphone et appuyez sur 'Ajouter à l'écran d'accueil'. Fonctionne comme une app native avec notifications push pour les buts et résultats." },
    { q: "Puis-je participer à plusieurs groupes?", a: "Oui, rejoignez autant de groupes que vous voulez, chacun pour 2$. Utilisez la fonction 'Copier les pronostics' pour importer vos prédictions d'un groupe à l'autre en un clic." },
  ],
  nl: [
    { q: "Wanneer begint het WK 2026?", a: "Het FIFA WK 2026 begint op 11 juni 2026 met Mexico vs Zuid-Afrika in het Estadio Azteca. De Finale is op 19 juli in het MetLife Stadium, New Jersey. 48 landen, 104 wedstrijden in de VS, Canada en Mexico." },
    { q: "Hoe maak ik een WK 2026 voorspellingsgroep aan?", a: "Registreer je gratis op Cup Clash, geef je groep een naam en stel de prijsverdeling in — klaar in 60 seconden. Deel de 6-letterige toegangscode met vrienden. Elk lid betaalt $2 voor alle 104 wedstrijden van het toernooi." },
    { q: "Hoe werkt het puntensysteem?", a: "Exacte uitslag = 25 punten. Juiste uitkomst = 10 punten. Doorstoot in knock-outfase = 20 punten. WK-winnaar = 100 punten. Topscorer en meeste assists = elk 50 punten." },
    { q: "Wat is het nieuwe WK 2026 format?", a: "Voor het eerst doen 48 landen mee in 12 groepen van 4. Een nieuwe ronde van 32 wordt toegevoegd vóór de achtste finales, wat zorgt voor 104 wedstrijden in totaal — 38 meer dan in Qatar 2022." },
    { q: "Moet ik een app downloaden?", a: "Geen download nodig. Cup Clash is een PWA — open cupclash.live op je telefoon en tik op 'Toevoegen aan beginscherm'. Werkt als een native app met pushmeldingen voor doelpunten en uitslagen." },
    { q: "Kan ik in meerdere groepen zitten?", a: "Ja, je kunt lid worden van zoveel groepen als je wilt, elk voor $2. Gebruik de functie 'Voorspellingen kopiëren' om je inzetten in één klik van de ene naar de andere groep te importeren." },
  ],
};

function FAQItem({ q, a, dir }: { q: string; a: string; dir: "ltr" | "rtl" }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-0" style={{ borderColor: "rgba(0,212,255,0.1)" }}>
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-4 px-1 py-4"
        dir={dir}>
        <span className="font-bold text-sm text-left flex-1" style={{ color: "#0F172A" }}>{q}</span>
        <ChevronDown size={16} style={{ color: "#0891B2", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <p className="pb-4 px-1 text-sm leading-relaxed" style={{ color: "#64748b" }} dir={dir}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQSection() {
  const [lang, setLang] = useState<Lang>("en");
  const meta  = LANG_META[lang];
  const faqs  = FAQS[lang];
  const half  = Math.ceil(faqs.length / 2);

  return (
    <section id="faq" className="py-24 px-5 sm:px-8" style={{ background: "#F8FAFC" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="label-caps mb-3">FAQ</div>
          <h2 className="font-display text-4xl sm:text-5xl uppercase" style={{ color: "#0F172A" }}>
            Got questions?{" "}
            <span style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              We&apos;ve got answers.
            </span>
          </h2>

          {/* Language selector */}
          <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
            {(Object.keys(LANG_META) as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className="px-3 py-2 rounded-xl text-sm font-bold transition-all"
                style={lang === l ? {
                  background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", color: "#0891B2",
                } : { background: "#f8fafc", border: "1px solid #e2e8f0", color: "#94a3b8" }}>
                {LANG_META[l].flag} {LANG_META[l].label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl p-6"
            style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,212,255,0.12)" }}>
            {faqs.slice(0, half).map(f => <FAQItem key={f.q} q={f.q} a={f.a} dir={meta.dir} />)}
          </div>
          <div className="rounded-2xl p-6"
            style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,212,255,0.12)" }}>
            {faqs.slice(half).map(f => <FAQItem key={f.q} q={f.q} a={f.a} dir={meta.dir} />)}
          </div>
        </div>
      </div>
    </section>
  );
}