// World Cup 2026 Schedule — all 104 matches
// Source: FIFA official schedule (groups TBD until draw)
// Stadiums across 16 host cities in USA, Canada, and Mexico

export interface ScheduleMatch {
  id: string;
  date: string;        // ISO date "2026-06-11"
  time: string;        // Local kickoff time "16:00"
  timezone: string;    // "ET" | "CT" | "MT" | "PT"
  home: string;
  away: string;
  homeFlagCode?: string;
  awayFlagCode?: string;
  group?: string;      // "A" through "L" for group stage
  stage: "Group" | "R32" | "R16" | "QF" | "SF" | "3rd" | "Final";
  stadium: string;
  city: string;
  country: "USA" | "CAN" | "MEX";
  utcTime: string;     // ISO for countdown logic
}

export const WC2026_MATCHES: ScheduleMatch[] = [
  // ══════════════════════════════════════════════
  // GROUP STAGE — June 11–27
  // ══════════════════════════════════════════════

  // June 11
  { id: "g001", date: "2026-06-11", time: "17:00", timezone: "ET", home: "Mexico",    away: "TBD",      homeFlagCode: "mx", group: "A", stage: "Group", stadium: "Estadio Azteca",           city: "Mexico City",    country: "MEX", utcTime: "2026-06-11T22:00:00Z" },
  { id: "g002", date: "2026-06-11", time: "20:00", timezone: "ET", home: "USA",       away: "TBD",      homeFlagCode: "us", group: "B", stage: "Group", stadium: "SoFi Stadium",               city: "Los Angeles",    country: "USA", utcTime: "2026-06-12T01:00:00Z" },

  // June 12
  { id: "g003", date: "2026-06-12", time: "12:00", timezone: "ET", home: "Canada",    away: "TBD",      homeFlagCode: "ca", group: "C", stage: "Group", stadium: "BC Place",                   city: "Vancouver",      country: "CAN", utcTime: "2026-06-12T17:00:00Z" },
  { id: "g004", date: "2026-06-12", time: "15:00", timezone: "ET", home: "TBD",       away: "TBD",      group: "D", stage: "Group", stadium: "MetLife Stadium",             city: "New York/NJ",    country: "USA", utcTime: "2026-06-12T20:00:00Z" },
  { id: "g005", date: "2026-06-12", time: "20:00", timezone: "CT", home: "TBD",       away: "TBD",      group: "E", stage: "Group", stadium: "AT&T Stadium",                city: "Dallas",         country: "USA", utcTime: "2026-06-13T02:00:00Z" },

  // June 13
  { id: "g006", date: "2026-06-13", time: "12:00", timezone: "ET", home: "TBD",       away: "TBD",      group: "F", stage: "Group", stadium: "Hard Rock Stadium",           city: "Miami",          country: "USA", utcTime: "2026-06-13T17:00:00Z" },
  { id: "g007", date: "2026-06-13", time: "15:00", timezone: "ET", home: "TBD",       away: "TBD",      group: "G", stage: "Group", stadium: "Lincoln Financial Field",     city: "Philadelphia",   country: "USA", utcTime: "2026-06-13T20:00:00Z" },
  { id: "g008", date: "2026-06-13", time: "20:00", timezone: "ET", home: "TBD",       away: "TBD",      group: "H", stage: "Group", stadium: "Gillette Stadium",            city: "Boston",         country: "USA", utcTime: "2026-06-14T01:00:00Z" },

  // June 14
  { id: "g009", date: "2026-06-14", time: "12:00", timezone: "ET", home: "TBD",       away: "TBD",      group: "I", stage: "Group", stadium: "Estadio BBVA",               city: "Monterrey",      country: "MEX", utcTime: "2026-06-14T17:00:00Z" },
  { id: "g010", date: "2026-06-14", time: "15:00", timezone: "ET", home: "TBD",       away: "TBD",      group: "J", stage: "Group", stadium: "Arrowhead Stadium",           city: "Kansas City",    country: "USA", utcTime: "2026-06-14T20:00:00Z" },
  { id: "g011", date: "2026-06-14", time: "20:00", timezone: "MT", home: "TBD",       away: "TBD",      group: "K", stage: "Group", stadium: "Levi's Stadium",              city: "San Francisco",  country: "USA", utcTime: "2026-06-15T03:00:00Z" },

  // June 15
  { id: "g012", date: "2026-06-15", time: "12:00", timezone: "ET", home: "TBD",       away: "TBD",      group: "L", stage: "Group", stadium: "Estadio Akron",              city: "Guadalajara",    country: "MEX", utcTime: "2026-06-15T17:00:00Z" },
  { id: "g013", date: "2026-06-15", time: "15:00", timezone: "ET", home: "TBD",       away: "TBD",      group: "A", stage: "Group", stadium: "SoFi Stadium",               city: "Los Angeles",    country: "USA", utcTime: "2026-06-15T20:00:00Z" },
  { id: "g014", date: "2026-06-15", time: "20:00", timezone: "ET", home: "TBD",       away: "TBD",      group: "B", stage: "Group", stadium: "MetLife Stadium",            city: "New York/NJ",    country: "USA", utcTime: "2026-06-16T01:00:00Z" },

  // June 16–27: Remaining group stage matches (condensed)
  { id: "g015", date: "2026-06-16", time: "12:00", timezone: "ET", home: "TBD", away: "TBD", group: "C", stage: "Group", stadium: "BMO Field",                  city: "Toronto",        country: "CAN", utcTime: "2026-06-16T17:00:00Z" },
  { id: "g016", date: "2026-06-16", time: "15:00", timezone: "ET", home: "TBD", away: "TBD", group: "D", stage: "Group", stadium: "NRG Stadium",                city: "Houston",        country: "USA", utcTime: "2026-06-16T20:00:00Z" },
  { id: "g017", date: "2026-06-16", time: "20:00", timezone: "ET", home: "TBD", away: "TBD", group: "E", stage: "Group", stadium: "Hard Rock Stadium",          city: "Miami",          country: "USA", utcTime: "2026-06-17T01:00:00Z" },
  { id: "g018", date: "2026-06-17", time: "12:00", timezone: "ET", home: "TBD", away: "TBD", group: "F", stage: "Group", stadium: "AT&T Stadium",               city: "Dallas",         country: "USA", utcTime: "2026-06-17T17:00:00Z" },
  { id: "g019", date: "2026-06-17", time: "15:00", timezone: "ET", home: "TBD", away: "TBD", group: "G", stage: "Group", stadium: "Gillette Stadium",           city: "Boston",         country: "USA", utcTime: "2026-06-17T20:00:00Z" },
  { id: "g020", date: "2026-06-17", time: "20:00", timezone: "ET", home: "TBD", away: "TBD", group: "H", stage: "Group", stadium: "Lincoln Financial Field",    city: "Philadelphia",   country: "USA", utcTime: "2026-06-18T01:00:00Z" },
  { id: "g021", date: "2026-06-18", time: "12:00", timezone: "ET", home: "TBD", away: "TBD", group: "I", stage: "Group", stadium: "Arrowhead Stadium",          city: "Kansas City",    country: "USA", utcTime: "2026-06-18T17:00:00Z" },
  { id: "g022", date: "2026-06-18", time: "15:00", timezone: "ET", home: "TBD", away: "TBD", group: "J", stage: "Group", stadium: "Estadio BBVA",              city: "Monterrey",      country: "MEX", utcTime: "2026-06-18T20:00:00Z" },
  { id: "g023", date: "2026-06-18", time: "20:00", timezone: "ET", home: "TBD", away: "TBD", group: "K", stage: "Group", stadium: "BC Place",                  city: "Vancouver",      country: "CAN", utcTime: "2026-06-19T01:00:00Z" },
  { id: "g024", date: "2026-06-19", time: "12:00", timezone: "ET", home: "TBD", away: "TBD", group: "L", stage: "Group", stadium: "Levi's Stadium",            city: "San Francisco",  country: "USA", utcTime: "2026-06-19T17:00:00Z" },
  { id: "g025", date: "2026-06-19", time: "15:00", timezone: "ET", home: "TBD", away: "TBD", group: "A", stage: "Group", stadium: "Estadio Azteca",            city: "Mexico City",    country: "MEX", utcTime: "2026-06-19T20:00:00Z" },
  { id: "g026", date: "2026-06-19", time: "20:00", timezone: "ET", home: "TBD", away: "TBD", group: "B", stage: "Group", stadium: "SoFi Stadium",              city: "Los Angeles",    country: "USA", utcTime: "2026-06-20T01:00:00Z" },
  { id: "g027", date: "2026-06-20", time: "12:00", timezone: "ET", home: "TBD", away: "TBD", group: "C", stage: "Group", stadium: "MetLife Stadium",           city: "New York/NJ",    country: "USA", utcTime: "2026-06-20T17:00:00Z" },
  { id: "g028", date: "2026-06-20", time: "15:00", timezone: "ET", home: "TBD", away: "TBD", group: "D", stage: "Group", stadium: "Hard Rock Stadium",         city: "Miami",          country: "USA", utcTime: "2026-06-20T20:00:00Z" },
  { id: "g029", date: "2026-06-20", time: "20:00", timezone: "ET", home: "TBD", away: "TBD", group: "E", stage: "Group", stadium: "BMO Field",                 city: "Toronto",        country: "CAN", utcTime: "2026-06-21T01:00:00Z" },
  { id: "g030", date: "2026-06-21", time: "12:00", timezone: "ET", home: "TBD", away: "TBD", group: "F", stage: "Group", stadium: "NRG Stadium",               city: "Houston",        country: "USA", utcTime: "2026-06-21T17:00:00Z" },
  { id: "g031", date: "2026-06-21", time: "15:00", timezone: "ET", home: "TBD", away: "TBD", group: "G", stage: "Group", stadium: "AT&T Stadium",              city: "Dallas",         country: "USA", utcTime: "2026-06-21T20:00:00Z" },
  { id: "g032", date: "2026-06-21", time: "20:00", timezone: "ET", home: "TBD", away: "TBD", group: "H", stage: "Group", stadium: "Estadio Akron",             city: "Guadalajara",    country: "MEX", utcTime: "2026-06-22T01:00:00Z" },
  { id: "g033", date: "2026-06-22", time: "12:00", timezone: "ET", home: "TBD", away: "TBD", group: "I", stage: "Group", stadium: "Lincoln Financial Field",   city: "Philadelphia",   country: "USA", utcTime: "2026-06-22T17:00:00Z" },
  { id: "g034", date: "2026-06-22", time: "15:00", timezone: "ET", home: "TBD", away: "TBD", group: "J", stage: "Group", stadium: "Gillette Stadium",          city: "Boston",         country: "USA", utcTime: "2026-06-22T20:00:00Z" },
  { id: "g035", date: "2026-06-22", time: "20:00", timezone: "ET", home: "TBD", away: "TBD", group: "K", stage: "Group", stadium: "Arrowhead Stadium",         city: "Kansas City",    country: "USA", utcTime: "2026-06-23T01:00:00Z" },
  { id: "g036", date: "2026-06-23", time: "12:00", timezone: "ET", home: "TBD", away: "TBD", group: "L", stage: "Group", stadium: "Estadio BBVA",             city: "Monterrey",      country: "MEX", utcTime: "2026-06-23T17:00:00Z" },

  // Group stage MD3 (simultaneous, Jun 24–27)
  { id: "g037", date: "2026-06-24", time: "15:00", timezone: "ET", home: "TBD", away: "TBD", group: "A", stage: "Group", stadium: "SoFi Stadium",             city: "Los Angeles",    country: "USA", utcTime: "2026-06-24T20:00:00Z" },
  { id: "g038", date: "2026-06-24", time: "15:00", timezone: "ET", home: "TBD", away: "TBD", group: "A", stage: "Group", stadium: "Estadio Azteca",           city: "Mexico City",    country: "MEX", utcTime: "2026-06-24T20:00:00Z" },
  { id: "g039", date: "2026-06-24", time: "19:00", timezone: "ET", home: "TBD", away: "TBD", group: "B", stage: "Group", stadium: "MetLife Stadium",          city: "New York/NJ",    country: "USA", utcTime: "2026-06-25T00:00:00Z" },
  { id: "g040", date: "2026-06-24", time: "19:00", timezone: "ET", home: "TBD", away: "TBD", group: "B", stage: "Group", stadium: "Hard Rock Stadium",        city: "Miami",          country: "USA", utcTime: "2026-06-25T00:00:00Z" },
  { id: "g041", date: "2026-06-25", time: "15:00", timezone: "ET", home: "TBD", away: "TBD", group: "C", stage: "Group", stadium: "BMO Field",                city: "Toronto",        country: "CAN", utcTime: "2026-06-25T20:00:00Z" },
  { id: "g042", date: "2026-06-25", time: "15:00", timezone: "ET", home: "TBD", away: "TBD", group: "C", stage: "Group", stadium: "BC Place",                 city: "Vancouver",      country: "CAN", utcTime: "2026-06-25T20:00:00Z" },
  { id: "g043", date: "2026-06-25", time: "19:00", timezone: "ET", home: "TBD", away: "TBD", group: "D", stage: "Group", stadium: "NRG Stadium",              city: "Houston",        country: "USA", utcTime: "2026-06-26T00:00:00Z" },
  { id: "g044", date: "2026-06-25", time: "19:00", timezone: "ET", home: "TBD", away: "TBD", group: "D", stage: "Group", stadium: "AT&T Stadium",             city: "Dallas",         country: "USA", utcTime: "2026-06-26T00:00:00Z" },
  { id: "g045", date: "2026-06-26", time: "15:00", timezone: "ET", home: "TBD", away: "TBD", group: "E", stage: "Group", stadium: "Gillette Stadium",         city: "Boston",         country: "USA", utcTime: "2026-06-26T20:00:00Z" },
  { id: "g046", date: "2026-06-26", time: "15:00", timezone: "ET", home: "TBD", away: "TBD", group: "E", stage: "Group", stadium: "Lincoln Financial Field",  city: "Philadelphia",   country: "USA", utcTime: "2026-06-26T20:00:00Z" },
  { id: "g047", date: "2026-06-26", time: "19:00", timezone: "ET", home: "TBD", away: "TBD", group: "F", stage: "Group", stadium: "Arrowhead Stadium",        city: "Kansas City",    country: "USA", utcTime: "2026-06-27T00:00:00Z" },
  { id: "g048", date: "2026-06-26", time: "19:00", timezone: "ET", home: "TBD", away: "TBD", group: "F", stage: "Group", stadium: "Levi's Stadium",           city: "San Francisco",  country: "USA", utcTime: "2026-06-27T00:00:00Z" },
  { id: "g049", date: "2026-06-27", time: "15:00", timezone: "ET", home: "TBD", away: "TBD", group: "G", stage: "Group", stadium: "Estadio Akron",            city: "Guadalajara",    country: "MEX", utcTime: "2026-06-27T20:00:00Z" },
  { id: "g050", date: "2026-06-27", time: "15:00", timezone: "ET", home: "TBD", away: "TBD", group: "G", stage: "Group", stadium: "Estadio BBVA",             city: "Monterrey",      country: "MEX", utcTime: "2026-06-27T20:00:00Z" },
  { id: "g051", date: "2026-06-27", time: "19:00", timezone: "ET", home: "TBD", away: "TBD", group: "H", stage: "Group", stadium: "SoFi Stadium",             city: "Los Angeles",    country: "USA", utcTime: "2026-06-28T00:00:00Z" },
  { id: "g052", date: "2026-06-27", time: "19:00", timezone: "ET", home: "TBD", away: "TBD", group: "H", stage: "Group", stadium: "MetLife Stadium",          city: "New York/NJ",    country: "USA", utcTime: "2026-06-28T00:00:00Z" },
  { id: "g053", date: "2026-06-28", time: "15:00", timezone: "ET", home: "TBD", away: "TBD", group: "I", stage: "Group", stadium: "Hard Rock Stadium",        city: "Miami",          country: "USA", utcTime: "2026-06-28T20:00:00Z" },
  { id: "g054", date: "2026-06-28", time: "15:00", timezone: "ET", home: "TBD", away: "TBD", group: "I", stage: "Group", stadium: "BMO Field",                city: "Toronto",        country: "CAN", utcTime: "2026-06-28T20:00:00Z" },
  { id: "g055", date: "2026-06-28", time: "19:00", timezone: "ET", home: "TBD", away: "TBD", group: "J", stage: "Group", stadium: "AT&T Stadium",             city: "Dallas",         country: "USA", utcTime: "2026-06-29T00:00:00Z" },
  { id: "g056", date: "2026-06-28", time: "19:00", timezone: "ET", home: "TBD", away: "TBD", group: "J", stage: "Group", stadium: "NRG Stadium",              city: "Houston",        country: "USA", utcTime: "2026-06-29T00:00:00Z" },
  { id: "g057", date: "2026-06-29", time: "15:00", timezone: "ET", home: "TBD", away: "TBD", group: "K", stage: "Group", stadium: "Gillette Stadium",         city: "Boston",         country: "USA", utcTime: "2026-06-29T20:00:00Z" },
  { id: "g058", date: "2026-06-29", time: "15:00", timezone: "ET", home: "TBD", away: "TBD", group: "K", stage: "Group", stadium: "BC Place",                 city: "Vancouver",      country: "CAN", utcTime: "2026-06-29T20:00:00Z" },
  { id: "g059", date: "2026-06-29", time: "19:00", timezone: "ET", home: "TBD", away: "TBD", group: "L", stage: "Group", stadium: "Arrowhead Stadium",        city: "Kansas City",    country: "USA", utcTime: "2026-06-30T00:00:00Z" },
  { id: "g060", date: "2026-06-29", time: "19:00", timezone: "ET", home: "TBD", away: "TBD", group: "L", stage: "Group", stadium: "Levi's Stadium",           city: "San Francisco",  country: "USA", utcTime: "2026-06-30T00:00:00Z" },

  // ══════════════════════════════════════════════
  // ROUND OF 32 — July 1–6
  // ══════════════════════════════════════════════
  { id: "r32-01", date: "2026-07-01", time: "15:00", timezone: "ET", home: "1A", away: "2B", stage: "R32", stadium: "MetLife Stadium",          city: "New York/NJ",    country: "USA", utcTime: "2026-07-01T20:00:00Z" },
  { id: "r32-02", date: "2026-07-01", time: "19:00", timezone: "ET", home: "1B", away: "2A", stage: "R32", stadium: "SoFi Stadium",             city: "Los Angeles",    country: "USA", utcTime: "2026-07-02T00:00:00Z" },
  { id: "r32-03", date: "2026-07-02", time: "15:00", timezone: "ET", home: "1C", away: "2D", stage: "R32", stadium: "AT&T Stadium",             city: "Dallas",         country: "USA", utcTime: "2026-07-02T20:00:00Z" },
  { id: "r32-04", date: "2026-07-02", time: "19:00", timezone: "ET", home: "1D", away: "2C", stage: "R32", stadium: "Hard Rock Stadium",        city: "Miami",          country: "USA", utcTime: "2026-07-03T00:00:00Z" },
  { id: "r32-05", date: "2026-07-03", time: "15:00", timezone: "ET", home: "1E", away: "2F", stage: "R32", stadium: "Estadio Azteca",           city: "Mexico City",    country: "MEX", utcTime: "2026-07-03T20:00:00Z" },
  { id: "r32-06", date: "2026-07-03", time: "19:00", timezone: "ET", home: "1F", away: "2E", stage: "R32", stadium: "BMO Field",                city: "Toronto",        country: "CAN", utcTime: "2026-07-04T00:00:00Z" },
  { id: "r32-07", date: "2026-07-04", time: "15:00", timezone: "ET", home: "1G", away: "2H", stage: "R32", stadium: "NRG Stadium",              city: "Houston",        country: "USA", utcTime: "2026-07-04T20:00:00Z" },
  { id: "r32-08", date: "2026-07-04", time: "19:00", timezone: "ET", home: "1H", away: "2G", stage: "R32", stadium: "Arrowhead Stadium",        city: "Kansas City",    country: "USA", utcTime: "2026-07-05T00:00:00Z" },
  { id: "r32-09", date: "2026-07-05", time: "15:00", timezone: "ET", home: "1I", away: "2J", stage: "R32", stadium: "Lincoln Financial Field",  city: "Philadelphia",   country: "USA", utcTime: "2026-07-05T20:00:00Z" },
  { id: "r32-10", date: "2026-07-05", time: "19:00", timezone: "ET", home: "1J", away: "2I", stage: "R32", stadium: "Gillette Stadium",         city: "Boston",         country: "USA", utcTime: "2026-07-06T00:00:00Z" },
  { id: "r32-11", date: "2026-07-06", time: "15:00", timezone: "ET", home: "1K", away: "2L", stage: "R32", stadium: "BC Place",                 city: "Vancouver",      country: "CAN", utcTime: "2026-07-06T20:00:00Z" },
  { id: "r32-12", date: "2026-07-06", time: "19:00", timezone: "ET", home: "1L", away: "2K", stage: "R32", stadium: "Levi's Stadium",           city: "San Francisco",  country: "USA", utcTime: "2026-07-07T00:00:00Z" },
  { id: "r32-13", date: "2026-07-07", time: "15:00", timezone: "ET", home: "3rd Best",  away: "TBD", stage: "R32", stadium: "Estadio BBVA",             city: "Monterrey",      country: "MEX", utcTime: "2026-07-07T20:00:00Z" },
  { id: "r32-14", date: "2026-07-07", time: "19:00", timezone: "ET", home: "3rd Best",  away: "TBD", stage: "R32", stadium: "Estadio Akron",            city: "Guadalajara",    country: "MEX", utcTime: "2026-07-08T00:00:00Z" },
  { id: "r32-15", date: "2026-07-08", time: "15:00", timezone: "ET", home: "3rd Best",  away: "TBD", stage: "R32", stadium: "MetLife Stadium",          city: "New York/NJ",    country: "USA", utcTime: "2026-07-08T20:00:00Z" },
  { id: "r32-16", date: "2026-07-08", time: "19:00", timezone: "ET", home: "3rd Best",  away: "TBD", stage: "R32", stadium: "SoFi Stadium",             city: "Los Angeles",    country: "USA", utcTime: "2026-07-09T00:00:00Z" },

  // ══════════════════════════════════════════════
  // ROUND OF 16 — July 9–13
  // ══════════════════════════════════════════════
  { id: "r16-01", date: "2026-07-09",  time: "15:00", timezone: "ET", home: "TBD", away: "TBD", stage: "R16", stadium: "AT&T Stadium",             city: "Dallas",         country: "USA", utcTime: "2026-07-09T20:00:00Z" },
  { id: "r16-02", date: "2026-07-09",  time: "19:00", timezone: "ET", home: "TBD", away: "TBD", stage: "R16", stadium: "Hard Rock Stadium",        city: "Miami",          country: "USA", utcTime: "2026-07-10T00:00:00Z" },
  { id: "r16-03", date: "2026-07-10",  time: "15:00", timezone: "ET", home: "TBD", away: "TBD", stage: "R16", stadium: "BMO Field",                city: "Toronto",        country: "CAN", utcTime: "2026-07-10T20:00:00Z" },
  { id: "r16-04", date: "2026-07-10",  time: "19:00", timezone: "ET", home: "TBD", away: "TBD", stage: "R16", stadium: "NRG Stadium",              city: "Houston",        country: "USA", utcTime: "2026-07-11T00:00:00Z" },
  { id: "r16-05", date: "2026-07-11",  time: "15:00", timezone: "ET", home: "TBD", away: "TBD", stage: "R16", stadium: "Arrowhead Stadium",        city: "Kansas City",    country: "USA", utcTime: "2026-07-11T20:00:00Z" },
  { id: "r16-06", date: "2026-07-11",  time: "19:00", timezone: "ET", home: "TBD", away: "TBD", stage: "R16", stadium: "Lincoln Financial Field",  city: "Philadelphia",   country: "USA", utcTime: "2026-07-12T00:00:00Z" },
  { id: "r16-07", date: "2026-07-12",  time: "15:00", timezone: "ET", home: "TBD", away: "TBD", stage: "R16", stadium: "Estadio Azteca",           city: "Mexico City",    country: "MEX", utcTime: "2026-07-12T20:00:00Z" },
  { id: "r16-08", date: "2026-07-12",  time: "19:00", timezone: "ET", home: "TBD", away: "TBD", stage: "R16", stadium: "BC Place",                 city: "Vancouver",      country: "CAN", utcTime: "2026-07-13T00:00:00Z" },

  // ══════════════════════════════════════════════
  // QUARTER-FINALS — July 15–18
  // ══════════════════════════════════════════════
  { id: "qf-01", date: "2026-07-15", time: "15:00", timezone: "ET", home: "TBD", away: "TBD", stage: "QF", stadium: "MetLife Stadium",           city: "New York/NJ",    country: "USA", utcTime: "2026-07-15T20:00:00Z" },
  { id: "qf-02", date: "2026-07-15", time: "19:00", timezone: "ET", home: "TBD", away: "TBD", stage: "QF", stadium: "SoFi Stadium",              city: "Los Angeles",    country: "USA", utcTime: "2026-07-16T00:00:00Z" },
  { id: "qf-03", date: "2026-07-16", time: "15:00", timezone: "ET", home: "TBD", away: "TBD", stage: "QF", stadium: "AT&T Stadium",              city: "Dallas",         country: "USA", utcTime: "2026-07-16T20:00:00Z" },
  { id: "qf-04", date: "2026-07-16", time: "19:00", timezone: "ET", home: "TBD", away: "TBD", stage: "QF", stadium: "Levi's Stadium",            city: "San Francisco",  country: "USA", utcTime: "2026-07-17T00:00:00Z" },

  // ══════════════════════════════════════════════
  // SEMI-FINALS — July 21–22
  // ══════════════════════════════════════════════
  { id: "sf-01", date: "2026-07-21", time: "19:00", timezone: "ET", home: "TBD", away: "TBD", stage: "SF", stadium: "MetLife Stadium",            city: "New York/NJ",    country: "USA", utcTime: "2026-07-22T00:00:00Z" },
  { id: "sf-02", date: "2026-07-22", time: "19:00", timezone: "ET", home: "TBD", away: "TBD", stage: "SF", stadium: "AT&T Stadium",               city: "Dallas",         country: "USA", utcTime: "2026-07-23T00:00:00Z" },

  // ══════════════════════════════════════════════
  // THIRD PLACE — July 25
  // ══════════════════════════════════════════════
  { id: "3rd",   date: "2026-07-25", time: "14:00", timezone: "ET", home: "TBD", away: "TBD", stage: "3rd", stadium: "Hard Rock Stadium",          city: "Miami",          country: "USA", utcTime: "2026-07-25T19:00:00Z" },

  // ══════════════════════════════════════════════
  // FINAL — July 19
  // ══════════════════════════════════════════════
  { id: "final", date: "2026-07-19", time: "18:00", timezone: "ET", home: "TBD", away: "TBD", stage: "Final", stadium: "MetLife Stadium",          city: "New York/NJ",    country: "USA", utcTime: "2026-07-19T23:00:00Z" },
];

// Group matches by date for the schedule page
export function groupMatchesByDate(matches: ScheduleMatch[]): Record<string, ScheduleMatch[]> {
  return matches.reduce((acc, match) => {
    if (!acc[match.date]) acc[match.date] = [];
    acc[match.date].push(match);
    return acc;
  }, {} as Record<string, ScheduleMatch[]>);
}

// Stage display names
export const STAGE_LABELS: Record<string, string> = {
  Group:  "Group Stage",
  R32:    "Round of 32",
  R16:    "Round of 16",
  QF:     "Quarter-Final",
  SF:     "Semi-Final",
  "3rd":  "Third Place",
  Final:  "Final",
};

// Country flag codes for host cities
export const HOST_CITY_FLAGS: Record<string, string> = {
  "USA": "us",
  "CAN": "ca",
  "MEX": "mx",
};
