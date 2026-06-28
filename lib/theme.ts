// COUNTRY_THEMES — maps a country key to primary + secondary Tailwind color class suffixes.
// These are decorative accents for flag-based theming (badges, borders, highlights).
// For CSS-variable-based theming, see lib/countries.ts + components/theme-provider.tsx.

export interface CountryTheme {
  primary:   string; // Tailwind bg-* / text-* class fragment, e.g. "sky-400"
  secondary: string; // e.g. "white"
}

export const COUNTRY_THEMES: Record<string, CountryTheme> = {
  // Host nations
  USA:  { primary: "blue-600",   secondary: "red-500"    },
  CAN:  { primary: "red-600",    secondary: "white"      },
  MEX:  { primary: "green-600",  secondary: "red-600"    },

  // CONMEBOL
  ARG:  { primary: "sky-400",    secondary: "white"      },
  BRA:  { primary: "yellow-400", secondary: "green-600"  },
  COL:  { primary: "yellow-400", secondary: "red-600"    },
  URU:  { primary: "blue-500",   secondary: "white"      },
  ECU:  { primary: "yellow-400", secondary: "blue-600"   },
  PAR:  { primary: "red-600",    secondary: "white"      },

  // UEFA
  ENG:  { primary: "red-600",    secondary: "white"      },
  FRA:  { primary: "blue-700",   secondary: "red-600"    },
  ESP:  { primary: "red-600",    secondary: "yellow-400" },
  GER:  { primary: "gray-900",   secondary: "yellow-400" },
  POR:  { primary: "green-700",  secondary: "red-600"    },
  NED:  { primary: "orange-500", secondary: "white"      },
  BEL:  { primary: "red-600",    secondary: "yellow-400" },
  AUT:  { primary: "red-700",    secondary: "white"      },
  CHE:  { primary: "red-600",    secondary: "white"      },
  CRO:  { primary: "red-600",    secondary: "white"      },
  SCO:  { primary: "blue-700",   secondary: "white"      },
  NOR:  { primary: "red-700",    secondary: "blue-700"   },
  SWE:  { primary: "blue-700",   secondary: "yellow-400" },
  TUR:  { primary: "red-600",    secondary: "white"      },

  // CAF
  MAR:  { primary: "red-700",    secondary: "green-700"  },
  SEN:  { primary: "green-600",  secondary: "yellow-400" },
  EGY:  { primary: "red-600",    secondary: "white"      },
  GHA:  { primary: "yellow-500", secondary: "red-600"    },

  // AFC
  JPN:  { primary: "red-600",    secondary: "white"      },
  KOR:  { primary: "red-600",    secondary: "blue-700"   },
  AUS:  { primary: "blue-700",   secondary: "yellow-400" },
  KSA:  { primary: "green-700",  secondary: "white"      },

  // ISR — not in 2026 but kept for the project's existing audience
  ISR:  { primary: "blue-600",   secondary: "white"      },

  // Legacy full-name keys that may appear in mock data
  Argentina:  { primary: "sky-400",    secondary: "white"      },
  Brazil:     { primary: "yellow-400", secondary: "green-600"  },
  England:    { primary: "red-600",    secondary: "white"      },
  France:     { primary: "blue-700",   secondary: "red-600"    },
  Israel:     { primary: "blue-600",   secondary: "white"      },
  Germany:    { primary: "gray-900",   secondary: "yellow-400" },
  Spain:      { primary: "red-600",    secondary: "yellow-400" },
  Italy:      { primary: "blue-600",   secondary: "white"      },
  Morocco:    { primary: "red-700",    secondary: "green-700"  },
  Japan:      { primary: "red-600",    secondary: "white"      },
};

/** Return the theme for a country key, falling back to a neutral default. */
export function getCountryTheme(country: string): CountryTheme {
  return COUNTRY_THEMES[country] ?? { primary: "slate-500", secondary: "white" };
}
