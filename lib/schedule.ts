// World Cup 2026 Schedule — all 104 matches
// Source: FIFA Official Match Schedule v17, 10 April 2026
// All times Eastern Time (ET) as per official schedule

export interface ScheduleMatch {
  id: string;
  date: string;
  time: string;
  timezone: string;
  home: string;
  away: string;
  homeFlagCode?: string;
  awayFlagCode?: string;
  group?: string;
  stage: "Group" | "R32" | "R16" | "QF" | "SF" | "3rd" | "Final";
  stadium: string;
  city: string;
  country: "USA" | "CAN" | "MEX";
  utcTime: string;
}

// Flag code lookup
const F: Record<string, string> = {
  MEX: "mx", RSA: "za", KOR: "kr", CZE: "cz",
  CAN: "ca", BIH: "ba", QAT: "qa", SUI: "ch",
  BRA: "br", MAR: "ma", HAI: "ht", SCO: "gb-sct",
  USA: "us", PAR: "py", AUS: "au", TUR: "tr",
  GER: "de", CUW: "cw", CIV: "ci", ECU: "ec",
  NED: "nl", JPN: "jp", SWE: "se", TUN: "tn",
  BEL: "be", EGY: "eg", IRN: "ir", NZL: "nz",
  ESP: "es", CPV: "cv", KSA: "sa", URU: "uy",
  FRA: "fr", SEN: "sn", IRQ: "iq", NOR: "no",
  ARG: "ar", ALG: "dz", AUT: "at", JOR: "jo",
  POR: "pt", COD: "cd", UZB: "uz", COL: "co",
  ENG: "gb-eng", CRO: "hr", GHA: "gh", PAN: "pa",
};

function h(code: string) { return F[code] ?? "un"; }

export const WC2026_MATCHES: ScheduleMatch[] = [

  // ══════════════════════════════════════════════════════
  // GROUP STAGE — June 11–26
  // ══════════════════════════════════════════════════════

  // ── GROUP A ──────────────────────────────────────────
  // Mexico City & Los Angeles & Guadalajara
  { id:"g001", date:"2026-06-11", time:"15:00", timezone:"ET", home:"Mexico",       away:"South Africa",        homeFlagCode:h("MEX"), awayFlagCode:h("RSA"), group:"A", stage:"Group", stadium:"Estadio Azteca",        city:"Mexico City",   country:"MEX", utcTime:"2026-06-11T20:00:00Z" },
  { id:"g027", date:"2026-06-15", time:"21:00", timezone:"ET", home:"Korea Republic",away:"Czechia",             homeFlagCode:h("KOR"), awayFlagCode:h("CZE"), group:"A", stage:"Group", stadium:"Estadio Chivas (Akron)",city:"Guadalajara",   country:"MEX", utcTime:"2026-06-16T02:00:00Z" },
  { id:"g028", date:"2026-06-19", time:"18:00", timezone:"ET", home:"Mexico",       away:"Korea Republic",      homeFlagCode:h("MEX"), awayFlagCode:h("KOR"), group:"A", stage:"Group", stadium:"Rose Bowl",             city:"Los Angeles",   country:"USA", utcTime:"2026-06-19T23:00:00Z" },
  { id:"g025", date:"2026-06-19", time:"21:00", timezone:"ET", home:"South Africa", away:"Czechia",             homeFlagCode:h("RSA"), awayFlagCode:h("CZE"), group:"A", stage:"Group", stadium:"Estadio Azteca",        city:"Mexico City",   country:"MEX", utcTime:"2026-06-20T02:00:00Z" },
  { id:"g051", date:"2026-06-23", time:"21:00", timezone:"ET", home:"Czechia",      away:"Mexico",              homeFlagCode:h("CZE"), awayFlagCode:h("MEX"), group:"A", stage:"Group", stadium:"Estadio Azteca",        city:"Mexico City",   country:"MEX", utcTime:"2026-06-24T02:00:00Z" },
  { id:"g053", date:"2026-06-23", time:"21:00", timezone:"ET", home:"South Africa", away:"Korea Republic",      homeFlagCode:h("RSA"), awayFlagCode:h("KOR"), group:"A", stage:"Group", stadium:"Rose Bowl",             city:"Los Angeles",   country:"USA", utcTime:"2026-06-24T02:00:00Z" },

  // ── GROUP B ──────────────────────────────────────────
  // Toronto, Los Angeles, San Francisco
  { id:"g003", date:"2026-06-12", time:"15:00", timezone:"ET", home:"Canada",       away:"Bosnia & Herzegovina",homeFlagCode:h("CAN"), awayFlagCode:h("BIH"), group:"B", stage:"Group", stadium:"BMO Field",             city:"Toronto",       country:"CAN", utcTime:"2026-06-12T20:00:00Z" },
  { id:"g008", date:"2026-06-14", time:"15:00", timezone:"ET", home:"Qatar",        away:"Switzerland",         homeFlagCode:h("QAT"), awayFlagCode:h("SUI"), group:"B", stage:"Group", stadium:"Levi's Stadium",        city:"San Francisco", country:"USA", utcTime:"2026-06-14T20:00:00Z" },
  { id:"g024", date:"2026-06-18", time:"23:00", timezone:"ET", home:"Canada",       away:"Qatar",               homeFlagCode:h("CAN"), awayFlagCode:h("QAT"), group:"B", stage:"Group", stadium:"Rose Bowl",             city:"Los Angeles",   country:"USA", utcTime:"2026-06-19T04:00:00Z" },
  { id:"g026", date:"2026-06-19", time:"15:00", timezone:"ET", home:"Switzerland",  away:"Bosnia & Herzegovina",homeFlagCode:h("SUI"), awayFlagCode:h("BIH"), group:"B", stage:"Group", stadium:"Levi's Stadium",        city:"San Francisco", country:"USA", utcTime:"2026-06-19T20:00:00Z" },
  { id:"g052", date:"2026-06-23", time:"15:00", timezone:"ET", home:"Bosnia & Herzegovina",away:"Qatar",        homeFlagCode:h("BIH"), awayFlagCode:h("QAT"), group:"B", stage:"Group", stadium:"BMO Field",             city:"Toronto",       country:"CAN", utcTime:"2026-06-23T20:00:00Z" },
  { id:"g044", date:"2026-06-23", time:"23:00", timezone:"ET", home:"Switzerland",  away:"Canada",              homeFlagCode:h("SUI"), awayFlagCode:h("CAN"), group:"B", stage:"Group", stadium:"Levi's Stadium",        city:"San Francisco", country:"USA", utcTime:"2026-06-24T04:00:00Z" },

  // ── GROUP C ──────────────────────────────────────────
  // New York/NJ, Los Angeles, Miami
  { id:"g004", date:"2026-06-12", time:"21:00", timezone:"ET", home:"Brazil",       away:"Morocco",             homeFlagCode:h("BRA"), awayFlagCode:h("MAR"), group:"C", stage:"Group", stadium:"MetLife Stadium",       city:"New York/NJ",  country:"USA", utcTime:"2026-06-13T02:00:00Z" },
  { id:"g007", date:"2026-06-13", time:"18:00", timezone:"ET", home:"Haiti",        away:"Scotland",            homeFlagCode:h("HAI"), awayFlagCode:h("SCO"), group:"C", stage:"Group", stadium:"Hard Rock Stadium",     city:"Miami",         country:"USA", utcTime:"2026-06-13T23:00:00Z" },
  { id:"g028b",date:"2026-06-17", time:"21:00", timezone:"ET", home:"Brazil",       away:"Haiti",               homeFlagCode:h("BRA"), awayFlagCode:h("HAI"), group:"C", stage:"Group", stadium:"Rose Bowl",             city:"Los Angeles",   country:"USA", utcTime:"2026-06-18T02:00:00Z" },
  { id:"g029", date:"2026-06-17", time:"20:30", timezone:"ET", home:"Scotland",     away:"Morocco",             homeFlagCode:h("SCO"), awayFlagCode:h("MAR"), group:"C", stage:"Group", stadium:"Hard Rock Stadium",     city:"Miami",         country:"USA", utcTime:"2026-06-18T01:30:00Z" },
  { id:"g047", date:"2026-06-21", time:"13:00", timezone:"ET", home:"Morocco",      away:"Haiti",               homeFlagCode:h("MAR"), awayFlagCode:h("HAI"), group:"C", stage:"Group", stadium:"MetLife Stadium",       city:"New York/NJ",  country:"USA", utcTime:"2026-06-21T18:00:00Z" },
  { id:"g050", date:"2026-06-21", time:"18:00", timezone:"ET", home:"Scotland",     away:"Brazil",              homeFlagCode:h("SCO"), awayFlagCode:h("BRA"), group:"C", stage:"Group", stadium:"Hard Rock Stadium",     city:"Miami",         country:"USA", utcTime:"2026-06-21T23:00:00Z" },

  // ── GROUP D ──────────────────────────────────────────
  // San Francisco, Seattle, Los Angeles
  { id:"g005", date:"2026-06-13", time:"00:00", timezone:"ET", home:"USA",          away:"Paraguay",            homeFlagCode:h("USA"), awayFlagCode:h("PAR"), group:"D", stage:"Group", stadium:"Levi's Stadium",        city:"San Francisco", country:"USA", utcTime:"2026-06-13T05:00:00Z" },
  { id:"g018", date:"2026-06-14", time:"21:00", timezone:"ET", home:"Türkiye",      away:"USA",                 homeFlagCode:h("TUR"), awayFlagCode:h("USA"), group:"D", stage:"Group", stadium:"Lumen Field",           city:"Seattle",       country:"USA", utcTime:"2026-06-15T02:00:00Z" },
  { id:"g030", date:"2026-06-18", time:"18:00", timezone:"ET", home:"USA",          away:"Australia",           homeFlagCode:h("USA"), awayFlagCode:h("AUS"), group:"D", stage:"Group", stadium:"Rose Bowl",             city:"Los Angeles",   country:"USA", utcTime:"2026-06-18T23:00:00Z" },
  { id:"g031", date:"2026-06-18", time:"23:00", timezone:"ET", home:"Paraguay",     away:"Türkiye",             homeFlagCode:h("PAR"), awayFlagCode:h("TUR"), group:"D", stage:"Group", stadium:"Levi's Stadium",        city:"San Francisco", country:"USA", utcTime:"2026-06-19T04:00:00Z" },
  { id:"g058", date:"2026-06-22", time:"19:00", timezone:"ET", home:"Paraguay",     away:"Australia",           homeFlagCode:h("PAR"), awayFlagCode:h("AUS"), group:"D", stage:"Group", stadium:"Lumen Field",           city:"Seattle",       country:"USA", utcTime:"2026-06-23T00:00:00Z" },
  { id:"g059", date:"2026-06-22", time:"22:00", timezone:"ET", home:"Türkiye",      away:"USA",                 homeFlagCode:h("TUR"), awayFlagCode:h("USA"), group:"D", stage:"Group", stadium:"Levi's Stadium",        city:"San Francisco", country:"USA", utcTime:"2026-06-23T03:00:00Z" },

  // ── GROUP E ──────────────────────────────────────────
  // Dallas, Houston, Philadelphia
  { id:"g010", date:"2026-06-14", time:"13:00", timezone:"ET", home:"Germany",      away:"Curaçao",             homeFlagCode:h("GER"), awayFlagCode:h("CUW"), group:"E", stage:"Group", stadium:"AT&T Stadium",          city:"Dallas",        country:"USA", utcTime:"2026-06-14T18:00:00Z" },
  { id:"g011", date:"2026-06-14", time:"19:00", timezone:"ET", home:"Côte d'Ivoire",away:"Ecuador",             homeFlagCode:h("CIV"), awayFlagCode:h("ECU"), group:"E", stage:"Group", stadium:"NRG Stadium",           city:"Houston",       country:"USA", utcTime:"2026-06-15T00:00:00Z" },
  { id:"g034", date:"2026-06-18", time:"20:00", timezone:"ET", home:"Germany",      away:"Côte d'Ivoire",       homeFlagCode:h("GER"), awayFlagCode:h("CIV"), group:"E", stage:"Group", stadium:"AT&T Stadium",          city:"Dallas",        country:"USA", utcTime:"2026-06-19T01:00:00Z" },
  { id:"g036", date:"2026-06-19", time:"00:00", timezone:"ET", home:"Ecuador",      away:"Curaçao",             homeFlagCode:h("ECU"), awayFlagCode:h("CUW"), group:"E", stage:"Group", stadium:"Lincoln Financial Field",city:"Philadelphia",  country:"USA", utcTime:"2026-06-19T05:00:00Z" },
  { id:"g049", date:"2026-06-22", time:"18:00", timezone:"ET", home:"Ecuador",      away:"Germany",             homeFlagCode:h("ECU"), awayFlagCode:h("GER"), group:"E", stage:"Group", stadium:"NRG Stadium",           city:"Houston",       country:"USA", utcTime:"2026-06-22T23:00:00Z" },
  { id:"g056", date:"2026-06-22", time:"16:00", timezone:"ET", home:"Curaçao",      away:"Côte d'Ivoire",       homeFlagCode:h("CUW"), awayFlagCode:h("CIV"), group:"E", stage:"Group", stadium:"AT&T Stadium",          city:"Dallas",        country:"USA", utcTime:"2026-06-22T21:00:00Z" },

  // ── GROUP F ──────────────────────────────────────────
  // Monterrey, Dallas, Seattle
  { id:"g012", date:"2026-06-14", time:"22:00", timezone:"ET", home:"Netherlands",  away:"Japan",               homeFlagCode:h("NED"), awayFlagCode:h("JPN"), group:"F", stage:"Group", stadium:"Estadio BBVA",          city:"Monterrey",     country:"MEX", utcTime:"2026-06-15T03:00:00Z" },
  { id:"g012b",date:"2026-06-15", time:"12:00", timezone:"ET", home:"Sweden",       away:"Tunisia",             homeFlagCode:h("SWE"), awayFlagCode:h("TUN"), group:"F", stage:"Group", stadium:"Estadio BBVA",          city:"Monterrey",     country:"MEX", utcTime:"2026-06-15T17:00:00Z" },
  { id:"g032", date:"2026-06-18", time:"15:00", timezone:"ET", home:"Tunisia",      away:"Japan",               homeFlagCode:h("TUN"), awayFlagCode:h("JPN"), group:"F", stage:"Group", stadium:"AT&T Stadium",          city:"Dallas",        country:"USA", utcTime:"2026-06-18T20:00:00Z" },
  { id:"g035", date:"2026-06-19", time:"13:00", timezone:"ET", home:"Netherlands",  away:"Sweden",              homeFlagCode:h("NED"), awayFlagCode:h("SWE"), group:"F", stage:"Group", stadium:"Lumen Field",           city:"Seattle",       country:"USA", utcTime:"2026-06-19T18:00:00Z" },
  { id:"g055", date:"2026-06-22", time:"16:00", timezone:"ET", home:"Tunisia",      away:"Netherlands",         homeFlagCode:h("TUN"), awayFlagCode:h("NED"), group:"F", stage:"Group", stadium:"Estadio BBVA",          city:"Monterrey",     country:"MEX", utcTime:"2026-06-22T21:00:00Z" },
  { id:"g057", date:"2026-06-22", time:"19:00", timezone:"ET", home:"Japan",        away:"Sweden",              homeFlagCode:h("JPN"), awayFlagCode:h("SWE"), group:"F", stage:"Group", stadium:"Lumen Field",           city:"Seattle",       country:"USA", utcTime:"2026-06-23T00:00:00Z" },

  // ── GROUP G ──────────────────────────────────────────
  // Vancouver, Los Angeles, Seattle
  { id:"g015", date:"2026-06-15", time:"21:00", timezone:"ET", home:"IR Iran",      away:"New Zealand",         homeFlagCode:h("IRN"), awayFlagCode:h("NZL"), group:"G", stage:"Group", stadium:"BC Place",              city:"Vancouver",     country:"CAN", utcTime:"2026-06-16T02:00:00Z" },
  { id:"g016", date:"2026-06-16", time:"15:00", timezone:"ET", home:"Belgium",      away:"Egypt",               homeFlagCode:h("BEL"), awayFlagCode:h("EGY"), group:"G", stage:"Group", stadium:"Rose Bowl",             city:"Los Angeles",   country:"USA", utcTime:"2026-06-16T20:00:00Z" },
  { id:"g039", date:"2026-06-20", time:"15:00", timezone:"ET", home:"New Zealand",  away:"Egypt",               homeFlagCode:h("NZL"), awayFlagCode:h("EGY"), group:"G", stage:"Group", stadium:"Lumen Field",           city:"Seattle",       country:"USA", utcTime:"2026-06-20T20:00:00Z" },
  { id:"g043", date:"2026-06-20", time:"13:00", timezone:"ET", home:"Belgium",      away:"IR Iran",             homeFlagCode:h("BEL"), awayFlagCode:h("IRN"), group:"G", stage:"Group", stadium:"BC Place",              city:"Vancouver",     country:"CAN", utcTime:"2026-06-20T18:00:00Z" },
  { id:"g060", date:"2026-06-24", time:"22:00", timezone:"ET", home:"New Zealand",  away:"Belgium",             homeFlagCode:h("NZL"), awayFlagCode:h("BEL"), group:"G", stage:"Group", stadium:"Rose Bowl",             city:"Los Angeles",   country:"USA", utcTime:"2026-06-25T03:00:00Z" },
  { id:"g070", date:"2026-06-24", time:"22:00", timezone:"ET", home:"Egypt",        away:"IR Iran",             homeFlagCode:h("EGY"), awayFlagCode:h("IRN"), group:"G", stage:"Group", stadium:"BC Place",              city:"Vancouver",     country:"CAN", utcTime:"2026-06-25T03:00:00Z" },

  // ── GROUP H ──────────────────────────────────────────
  // Atlanta, Kansas City, Miami
  { id:"g013", date:"2026-06-15", time:"13:00", timezone:"ET", home:"Spain",        away:"Cabo Verde",          homeFlagCode:h("ESP"), awayFlagCode:h("CPV"), group:"H", stage:"Group", stadium:"Mercedes-Benz Stadium", city:"Atlanta",       country:"USA", utcTime:"2026-06-15T18:00:00Z" },
  { id:"g009", date:"2026-06-14", time:"18:00", timezone:"ET", home:"Saudi Arabia", away:"Uruguay",             homeFlagCode:h("KSA"), awayFlagCode:h("URU"), group:"H", stage:"Group", stadium:"Hard Rock Stadium",     city:"Miami",         country:"USA", utcTime:"2026-06-14T23:00:00Z" },
  { id:"g037", date:"2026-06-19", time:"18:00", timezone:"ET", home:"Spain",        away:"Saudi Arabia",        homeFlagCode:h("ESP"), awayFlagCode:h("KSA"), group:"H", stage:"Group", stadium:"Mercedes-Benz Stadium", city:"Atlanta",       country:"USA", utcTime:"2026-06-19T23:00:00Z" },
  { id:"g046", date:"2026-06-20", time:"19:00", timezone:"ET", home:"Uruguay",      away:"Cabo Verde",          homeFlagCode:h("URU"), awayFlagCode:h("CPV"), group:"H", stage:"Group", stadium:"Arrowhead Stadium",     city:"Kansas City",   country:"USA", utcTime:"2026-06-21T00:00:00Z" },
  { id:"g064", date:"2026-06-24", time:"23:00", timezone:"ET", home:"Cabo Verde",   away:"Saudi Arabia",        homeFlagCode:h("CPV"), awayFlagCode:h("KSA"), group:"H", stage:"Group", stadium:"Mercedes-Benz Stadium", city:"Atlanta",       country:"USA", utcTime:"2026-06-25T04:00:00Z" },
  { id:"g065", date:"2026-06-24", time:"20:00", timezone:"ET", home:"Uruguay",      away:"Spain",               homeFlagCode:h("URU"), awayFlagCode:h("ESP"), group:"H", stage:"Group", stadium:"Hard Rock Stadium",     city:"Miami",         country:"USA", utcTime:"2026-06-25T01:00:00Z" },

  // ── GROUP I ──────────────────────────────────────────
  // New York/NJ, Toronto, Boston
  { id:"g019", date:"2026-06-16", time:"21:00", timezone:"ET", home:"France",       away:"Senegal",             homeFlagCode:h("FRA"), awayFlagCode:h("SEN"), group:"I", stage:"Group", stadium:"MetLife Stadium",       city:"New York/NJ",  country:"USA", utcTime:"2026-06-17T02:00:00Z" },
  { id:"g018b",date:"2026-06-17", time:"18:00", timezone:"ET", home:"Iraq",         away:"Norway",              homeFlagCode:h("IRQ"), awayFlagCode:h("NOR"), group:"I", stage:"Group", stadium:"Gillette Stadium",      city:"Boston",        country:"USA", utcTime:"2026-06-17T23:00:00Z" },
  { id:"g033", date:"2026-06-20", time:"16:00", timezone:"ET", home:"Norway",       away:"Senegal",             homeFlagCode:h("NOR"), awayFlagCode:h("SEN"), group:"I", stage:"Group", stadium:"BMO Field",             city:"Toronto",       country:"CAN", utcTime:"2026-06-20T21:00:00Z" },
  { id:"g042", date:"2026-06-21", time:"17:00", timezone:"ET", home:"Senegal",      away:"Iraq",                homeFlagCode:h("SEN"), awayFlagCode:h("IRQ"), group:"I", stage:"Group", stadium:"Gillette Stadium",      city:"Boston",        country:"USA", utcTime:"2026-06-21T22:00:00Z" },
  { id:"g066", date:"2026-06-25", time:"20:00", timezone:"ET", home:"Norway",       away:"France",              homeFlagCode:h("NOR"), awayFlagCode:h("FRA"), group:"I", stage:"Group", stadium:"MetLife Stadium",       city:"New York/NJ",  country:"USA", utcTime:"2026-06-26T01:00:00Z" },
  { id:"g048", date:"2026-06-25", time:"22:00", timezone:"ET", home:"France",       away:"Iraq",                homeFlagCode:h("FRA"), awayFlagCode:h("IRQ"), group:"I", stage:"Group", stadium:"Gillette Stadium",      city:"Boston",        country:"USA", utcTime:"2026-06-26T03:00:00Z" },

  // ── GROUP J ──────────────────────────────────────────
  // San Francisco, Dallas, Kansas City
  { id:"g020", date:"2026-06-16", time:"00:00", timezone:"ET", home:"Argentina",    away:"Algeria",             homeFlagCode:h("ARG"), awayFlagCode:h("ALG"), group:"J", stage:"Group", stadium:"Levi's Stadium",        city:"San Francisco", country:"USA", utcTime:"2026-06-16T05:00:00Z" },
  { id:"g014", date:"2026-06-15", time:"12:00", timezone:"ET", home:"Austria",      away:"Jordan",              homeFlagCode:h("AUT"), awayFlagCode:h("JOR"), group:"J", stage:"Group", stadium:"AT&T Stadium",          city:"Dallas",        country:"USA", utcTime:"2026-06-15T17:00:00Z" },
  { id:"g038", date:"2026-06-20", time:"12:00", timezone:"ET", home:"Argentina",    away:"Austria",             homeFlagCode:h("ARG"), awayFlagCode:h("AUT"), group:"J", stage:"Group", stadium:"Arrowhead Stadium",     city:"Kansas City",   country:"USA", utcTime:"2026-06-20T17:00:00Z" },
  { id:"g040", date:"2026-06-20", time:"21:00", timezone:"ET", home:"Jordan",       away:"Algeria",             homeFlagCode:h("JOR"), awayFlagCode:h("ALG"), group:"J", stage:"Group", stadium:"AT&T Stadium",          city:"Dallas",        country:"USA", utcTime:"2026-06-21T02:00:00Z" },
  { id:"g069", date:"2026-06-25", time:"22:00", timezone:"ET", home:"Jordan",       away:"Argentina",           homeFlagCode:h("JOR"), awayFlagCode:h("ARG"), group:"J", stage:"Group", stadium:"Levi's Stadium",        city:"San Francisco", country:"USA", utcTime:"2026-06-26T03:00:00Z" },
  { id:"g071", date:"2026-06-25", time:"19:30", timezone:"ET", home:"Algeria",      away:"Austria",             homeFlagCode:h("ALG"), awayFlagCode:h("AUT"), group:"J", stage:"Group", stadium:"Arrowhead Stadium",     city:"Kansas City",   country:"USA", utcTime:"2026-06-26T00:30:00Z" },

  // ── GROUP K ──────────────────────────────────────────
  // Atlanta, Houston, Kansas City
  { id:"g072", date:"2026-06-15", time:"19:30", timezone:"ET", home:"Congo DR",     away:"Uzbekistan",          homeFlagCode:h("COD"), awayFlagCode:h("UZB"), group:"K", stage:"Group", stadium:"Mercedes-Benz Stadium", city:"Atlanta",       country:"USA", utcTime:"2026-06-16T00:30:00Z" },
  { id:"g023", date:"2026-06-16", time:"13:00", timezone:"ET", home:"Portugal",     away:"Congo DR",            homeFlagCode:h("POR"), awayFlagCode:h("COD"), group:"K", stage:"Group", stadium:"NRG Stadium",           city:"Houston",       country:"USA", utcTime:"2026-06-16T18:00:00Z" },
  { id:"g041", date:"2026-06-20", time:"00:00", timezone:"ET", home:"Colombia",     away:"Congo DR",            homeFlagCode:h("COL"), awayFlagCode:h("COD"), group:"K", stage:"Group", stadium:"Arrowhead Stadium",     city:"Kansas City",   country:"USA", utcTime:"2026-06-20T05:00:00Z" },
  { id:"g054", date:"2026-06-21", time:"21:00", timezone:"ET", home:"Portugal",     away:"Uzbekistan",          homeFlagCode:h("POR"), awayFlagCode:h("UZB"), group:"K", stage:"Group", stadium:"Mercedes-Benz Stadium", city:"Atlanta",       country:"USA", utcTime:"2026-06-22T02:00:00Z" },
  { id:"g068", date:"2026-06-25", time:"17:00", timezone:"ET", home:"Colombia",     away:"Portugal",            homeFlagCode:h("COL"), awayFlagCode:h("POR"), group:"K", stage:"Group", stadium:"NRG Stadium",           city:"Houston",       country:"USA", utcTime:"2026-06-25T22:00:00Z" },
  { id:"g022", date:"2026-06-16", time:"16:00", timezone:"ET", home:"Uzbekistan",   away:"Colombia",            homeFlagCode:h("UZB"), awayFlagCode:h("COL"), group:"K", stage:"Group", stadium:"Arrowhead Stadium",     city:"Kansas City",   country:"USA", utcTime:"2026-06-16T21:00:00Z" },

  // ── GROUP L ──────────────────────────────────────────
  // Toronto, Boston, Atlanta
  { id:"g021", date:"2026-06-16", time:"19:00", timezone:"ET", home:"England",      away:"Croatia",             homeFlagCode:h("ENG"), awayFlagCode:h("CRO"), group:"L", stage:"Group", stadium:"BMO Field",             city:"Toronto",       country:"CAN", utcTime:"2026-06-17T00:00:00Z" },
  { id:"g017", date:"2026-06-16", time:"15:00", timezone:"ET", home:"Ghana",        away:"Panama",              homeFlagCode:h("GHA"), awayFlagCode:h("PAN"), group:"L", stage:"Group", stadium:"Gillette Stadium",      city:"Boston",        country:"USA", utcTime:"2026-06-16T20:00:00Z" },
  { id:"g041b",date:"2026-06-20", time:"20:00", timezone:"ET", home:"England",      away:"Ghana",               homeFlagCode:h("ENG"), awayFlagCode:h("GHA"), group:"L", stage:"Group", stadium:"Gillette Stadium",      city:"Boston",        country:"USA", utcTime:"2026-06-21T01:00:00Z" },
  { id:"g045", date:"2026-06-21", time:"16:00", timezone:"ET", home:"Panama",       away:"Croatia",             homeFlagCode:h("PAN"), awayFlagCode:h("CRO"), group:"L", stage:"Group", stadium:"Mercedes-Benz Stadium", city:"Atlanta",       country:"USA", utcTime:"2026-06-21T21:00:00Z" },
  { id:"g061", date:"2026-06-25", time:"15:00", timezone:"ET", home:"Panama",       away:"England",             homeFlagCode:h("PAN"), awayFlagCode:h("ENG"), group:"L", stage:"Group", stadium:"BMO Field",             city:"Toronto",       country:"CAN", utcTime:"2026-06-25T20:00:00Z" },
  { id:"g067", date:"2026-06-25", time:"17:00", timezone:"ET", home:"Croatia",      away:"Ghana",               homeFlagCode:h("CRO"), awayFlagCode:h("GHA"), group:"L", stage:"Group", stadium:"Gillette Stadium",      city:"Boston",        country:"USA", utcTime:"2026-06-25T22:00:00Z" },

  // ══════════════════════════════════════════════════════
  // ROUND OF 32 — June 28 – July 3
  // ══════════════════════════════════════════════════════
  { id:"r001", date:"2026-06-28", time:"15:00", timezone:"ET", home:"2A", away:"2B", stage:"R32", stadium:"TBD", city:"TBD", country:"USA", utcTime:"2026-06-28T20:00:00Z" },
  { id:"r002", date:"2026-06-28", time:"19:30", timezone:"ET", home:"1K", away:"3DEIJL", stage:"R32", stadium:"TBD", city:"TBD", country:"USA", utcTime:"2026-06-29T00:30:00Z" },
  { id:"r003", date:"2026-06-28", time:"21:00", timezone:"ET", home:"1A", away:"3CEFHI", stage:"R32", stadium:"TBD", city:"TBD", country:"USA", utcTime:"2026-06-29T02:00:00Z" },
  { id:"r004", date:"2026-06-29", time:"12:00", timezone:"ET", home:"1E", away:"3ABCDF", stage:"R32", stadium:"TBD", city:"TBD", country:"USA", utcTime:"2026-06-29T17:00:00Z" },
  { id:"r005", date:"2026-06-29", time:"16:30", timezone:"ET", home:"1I", away:"3CDFGH", stage:"R32", stadium:"TBD", city:"TBD", country:"USA", utcTime:"2026-06-29T21:30:00Z" },
  { id:"r006", date:"2026-06-29", time:"21:00", timezone:"ET", home:"1D", away:"3BEFIJ", stage:"R32", stadium:"TBD", city:"TBD", country:"USA", utcTime:"2026-06-30T02:00:00Z" },
  { id:"r007", date:"2026-06-30", time:"16:00", timezone:"ET", home:"1F", away:"2C",     stage:"R32", stadium:"TBD", city:"TBD", country:"USA", utcTime:"2026-06-30T21:00:00Z" },
  { id:"r008", date:"2026-06-30", time:"21:00", timezone:"ET", home:"1C", away:"2F",     stage:"R32", stadium:"TBD", city:"TBD", country:"USA", utcTime:"2026-07-01T02:00:00Z" },
  { id:"r009", date:"2026-07-01", time:"13:00", timezone:"ET", home:"2E", away:"2I",     stage:"R32", stadium:"TBD", city:"TBD", country:"USA", utcTime:"2026-07-01T18:00:00Z" },
  { id:"r010", date:"2026-07-01", time:"17:00", timezone:"ET", home:"1H", away:"2J",     stage:"R32", stadium:"TBD", city:"TBD", country:"USA", utcTime:"2026-07-01T22:00:00Z" },
  { id:"r011", date:"2026-07-01", time:"20:00", timezone:"ET", home:"1G", away:"3AEHIJ", stage:"R32", stadium:"TBD", city:"TBD", country:"USA", utcTime:"2026-07-02T01:00:00Z" },
  { id:"r012", date:"2026-07-02", time:"13:00", timezone:"ET", home:"2K", away:"2L",     stage:"R32", stadium:"TBD", city:"TBD", country:"USA", utcTime:"2026-07-02T18:00:00Z" },
  { id:"r013", date:"2026-07-02", time:"16:00", timezone:"ET", home:"1B", away:"3EFGIJ", stage:"R32", stadium:"TBD", city:"TBD", country:"USA", utcTime:"2026-07-02T21:00:00Z" },
  { id:"r014", date:"2026-07-02", time:"20:00", timezone:"ET", home:"1L", away:"3EHIJK", stage:"R32", stadium:"TBD", city:"TBD", country:"USA", utcTime:"2026-07-03T01:00:00Z" },
  { id:"r015", date:"2026-07-03", time:"14:00", timezone:"ET", home:"2D", away:"2G",     stage:"R32", stadium:"TBD", city:"TBD", country:"USA", utcTime:"2026-07-03T19:00:00Z" },
  { id:"r016", date:"2026-07-03", time:"18:00", timezone:"ET", home:"1J", away:"2H",     stage:"R32", stadium:"TBD", city:"TBD", country:"USA", utcTime:"2026-07-03T23:00:00Z" },

  // ══════════════════════════════════════════════════════
  // ROUND OF 16 — July 4–8
  // ══════════════════════════════════════════════════════
  { id:"ro16a", date:"2026-07-04", time:"15:00", timezone:"ET", home:"W73", away:"W75", stage:"R16", stadium:"TBD", city:"TBD", country:"USA", utcTime:"2026-07-04T20:00:00Z" },
  { id:"ro16b", date:"2026-07-04", time:"21:00", timezone:"ET", home:"W76", away:"W78", stage:"R16", stadium:"TBD", city:"TBD", country:"USA", utcTime:"2026-07-05T02:00:00Z" },
  { id:"ro16c", date:"2026-07-05", time:"16:00", timezone:"ET", home:"W79", away:"W80", stage:"R16", stadium:"TBD", city:"TBD", country:"USA", utcTime:"2026-07-05T21:00:00Z" },
  { id:"ro16d", date:"2026-07-05", time:"20:00", timezone:"ET", home:"W81", away:"W82", stage:"R16", stadium:"TBD", city:"TBD", country:"USA", utcTime:"2026-07-06T01:00:00Z" },
  { id:"ro16e", date:"2026-07-06", time:"13:00", timezone:"ET", home:"W83", away:"W84", stage:"R16", stadium:"TBD", city:"TBD", country:"USA", utcTime:"2026-07-06T18:00:00Z" },
  { id:"ro16f", date:"2026-07-06", time:"20:00", timezone:"ET", home:"W85", away:"W87", stage:"R16", stadium:"TBD", city:"TBD", country:"USA", utcTime:"2026-07-07T01:00:00Z" },
  { id:"ro16g", date:"2026-07-07", time:"19:00", timezone:"ET", home:"W86", away:"W88", stage:"R16", stadium:"TBD", city:"TBD", country:"USA", utcTime:"2026-07-08T00:00:00Z" },
  { id:"ro16h", date:"2026-07-08", time:"18:00", timezone:"ET", home:"W74", away:"W77", stage:"R16", stadium:"TBD", city:"TBD", country:"USA", utcTime:"2026-07-08T23:00:00Z" },

  // ══════════════════════════════════════════════════════
  // QUARTER-FINALS — July 9–12
  // ══════════════════════════════════════════════════════
  { id:"qf1", date:"2026-07-09", time:"13:00", timezone:"ET", home:"W90", away:"W73", stage:"QF", stadium:"TBD", city:"TBD", country:"USA", utcTime:"2026-07-09T18:00:00Z" },
  { id:"qf2", date:"2026-07-09", time:"21:00", timezone:"ET", home:"W89", away:"W90", stage:"QF", stadium:"TBD", city:"TBD", country:"USA", utcTime:"2026-07-10T02:00:00Z" },
  { id:"qf3", date:"2026-07-10", time:"16:00", timezone:"ET", home:"W91", away:"W92", stage:"QF", stadium:"TBD", city:"TBD", country:"USA", utcTime:"2026-07-10T21:00:00Z" },
  { id:"qf4", date:"2026-07-11", time:"20:00", timezone:"ET", home:"W93", away:"W94", stage:"QF", stadium:"TBD", city:"TBD", country:"USA", utcTime:"2026-07-12T01:00:00Z" },
  { id:"qf5", date:"2026-07-12", time:"15:00", timezone:"ET", home:"W95", away:"W96", stage:"QF", stadium:"TBD", city:"TBD", country:"USA", utcTime:"2026-07-12T20:00:00Z" },
  { id:"qf6", date:"2026-07-12", time:"21:00", timezone:"ET", home:"W97", away:"W98", stage:"QF", stadium:"TBD", city:"TBD", country:"USA", utcTime:"2026-07-13T02:00:00Z" },
  { id:"qf7", date:"2026-07-11", time:"12:00", timezone:"ET", home:"W99", away:"W100",stage:"QF", stadium:"TBD", city:"TBD", country:"USA", utcTime:"2026-07-11T17:00:00Z" },
  { id:"qf8", date:"2026-07-10", time:"21:00", timezone:"ET", home:"W101",away:"W102",stage:"QF", stadium:"TBD", city:"TBD", country:"USA", utcTime:"2026-07-11T02:00:00Z" },

  // ══════════════════════════════════════════════════════
  // SEMI-FINALS — July 14–15
  // ══════════════════════════════════════════════════════
  { id:"sf1", date:"2026-07-14", time:"16:00", timezone:"ET", home:"W(QF1)", away:"W(QF2)", stage:"SF", stadium:"MetLife Stadium",       city:"New York/NJ", country:"USA", utcTime:"2026-07-14T21:00:00Z" },
  { id:"sf2", date:"2026-07-15", time:"16:00", timezone:"ET", home:"W(QF3)", away:"W(QF4)", stage:"SF", stadium:"AT&T Stadium",          city:"Dallas",      country:"USA", utcTime:"2026-07-15T21:00:00Z" },

  // ══════════════════════════════════════════════════════
  // BRONZE FINAL — July 18
  // ══════════════════════════════════════════════════════
  { id:"bronze", date:"2026-07-18", time:"15:00", timezone:"ET", home:"L(SF1)", away:"L(SF2)", stage:"3rd", stadium:"Hard Rock Stadium", city:"Miami",       country:"USA", utcTime:"2026-07-18T20:00:00Z" },

  // ══════════════════════════════════════════════════════
  // FINAL — July 19
  // ══════════════════════════════════════════════════════
  { id:"final", date:"2026-07-19", time:"15:00", timezone:"ET", home:"W(SF1)", away:"W(SF2)", stage:"Final", stadium:"MetLife Stadium",  city:"New York/NJ", country:"USA", utcTime:"2026-07-19T20:00:00Z" },
];

// ── Helpers ─────────────────────────────────────────────
export const STAGE_LABELS: Record<string, string> = {
  Group: "Group Stage", R32: "Round of 32", R16: "Round of 16",
  QF: "Quarter-Finals", SF: "Semi-Finals", "3rd": "Bronze Final", Final: "Final",
};

export const HOST_CITY_FLAGS: Record<string, string> = {
  "Vancouver": "🇨🇦",  "Seattle": "🇺🇸",    "San Francisco": "🇺🇸",
  "Los Angeles": "🇺🇸", "Guadalajara": "🇲🇽", "Mexico City": "🇲🇽",
  "Monterrey": "🇲🇽",  "Houston": "🇺🇸",     "Dallas": "🇺🇸",
  "Atlanta": "🇺🇸",    "Toronto": "🇨🇦",     "Boston": "🇺🇸",
  "Kansas City": "🇺🇸","Miami": "🇺🇸",        "New York/NJ": "🇺🇸",
  "Philadelphia": "🇺🇸",
};

export function groupMatchesByDate(matches: ScheduleMatch[]) {
  const map: Record<string, ScheduleMatch[]> = {};
  matches.forEach(m => {
    if (!map[m.date]) map[m.date] = [];
    map[m.date].push(m);
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, ms]) => ({ date, matches: ms.sort((a, b) => a.utcTime.localeCompare(b.utcTime)) }));
}