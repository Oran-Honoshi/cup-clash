// ── Locale metadata ────────────────────────────────────────────────────────────
export const LOCALES = {
  en: { name: "English",    nativeName: "English",    flag: "🇬🇧", dir: "ltr" as const },
  fr: { name: "French",     nativeName: "Français",   flag: "🇫🇷", dir: "ltr" as const },
  de: { name: "German",     nativeName: "Deutsch",    flag: "🇩🇪", dir: "ltr" as const },
  nl: { name: "Dutch",      nativeName: "Nederlands", flag: "🇳🇱", dir: "ltr" as const },
  es: { name: "Spanish",    nativeName: "Español",    flag: "🇪🇸", dir: "ltr" as const },
  pt: { name: "Portuguese", nativeName: "Português",  flag: "🇧🇷", dir: "ltr" as const },
  he: { name: "Hebrew",     nativeName: "עברית",       flag: "🇮🇱", dir: "rtl" as const },
  ar: { name: "Arabic",     nativeName: "العربية",    flag: "🇸🇦", dir: "rtl" as const },
} as const;

export type Locale = keyof typeof LOCALES;
export const LOCALE_KEYS = Object.keys(LOCALES) as Locale[];
export const RTL_LOCALES: Locale[] = ["he", "ar"];

// ── Translation keys ───────────────────────────────────────────────────────────
export interface Translations {
  // Nav
  nav_dashboard:     string;
  nav_groups:        string;
  nav_leaderboard:   string;
  nav_predictions:   string;
  nav_standings:     string;
  nav_bracket:       string;
  nav_trivia:        string;
  nav_notifications: string;
  nav_profile:       string;
  nav_chat:          string;
  nav_signout:       string;
  nav_home:          string;
  nav_table:         string;
  nav_mybets:        string;

  // Auth
  auth_createAccount:     string;
  auth_signin:            string;
  auth_signup:            string;
  auth_email:             string;
  auth_password:          string;
  auth_displayName:       string;
  auth_continue:          string;
  auth_back:              string;
  auth_checkEmail:        string;
  auth_alreadyHaveAccount:string;
  auth_noAccount:         string;
  auth_signout:           string;
  auth_getStarted:        string;

  // Predictions
  pred_title:       string;
  pred_groupStage:  string;
  pred_tournament:  string;
  pred_locked:      string;
  pred_saved:       string;
  pred_open:        string;
  pred_progress:    string;

  // Groups
  grp_title:       string;
  grp_create:      string;
  grp_join:        string;
  grp_chat:        string;
  grp_members:     string;
  grp_entry:       string;
  grp_passkey:     string;
  grp_manage:      string;
  grp_overview:    string;
  grp_youreInvited:string;

  // Profile
  prof_title:       string;
  prof_yourTeam:    string;
  prof_autoAvatar:  string;
  prof_soccerRole:  string;
  prof_photo:       string;
  prof_saveChanges: string;
  prof_language:    string;
  prof_country:     string;
  prof_displayName: string;

  // Dashboard
  dash_title:      string;
  dash_welcome:    string;
  dash_nextMatch:  string;

  // Common
  common_save:      string;
  common_cancel:    string;
  common_delete:    string;
  common_loading:   string;
  common_error:     string;
  common_later:     string;
  common_joinGroup: string;
  common_complete:  string;
  common_admin:     string;
  common_member:    string;
  common_you:       string;
  common_readMore:  string;
}

// ── English (base) ─────────────────────────────────────────────────────────────
const en: Translations = {
  nav_dashboard:     "Dashboard",
  nav_groups:        "My Groups",
  nav_leaderboard:   "Leaderboard",
  nav_predictions:   "My Predictions",
  nav_standings:     "Standings",
  nav_bracket:       "Bracket",
  nav_trivia:        "Trivia",
  nav_notifications: "Notifications",
  nav_profile:       "Profile",
  nav_chat:          "Group Chat",
  nav_signout:       "Sign out",
  nav_home:          "Home",
  nav_table:         "Table",
  nav_mybets:        "My Bets",

  auth_createAccount:      "Create Account",
  auth_signin:             "Sign in",
  auth_signup:             "Sign up",
  auth_email:              "Email",
  auth_password:           "Password",
  auth_displayName:        "Display name",
  auth_continue:           "Continue",
  auth_back:               "Back",
  auth_checkEmail:         "Check your email!",
  auth_alreadyHaveAccount: "Already have an account?",
  auth_noAccount:          "No account yet?",
  auth_signout:            "Sign out",
  auth_getStarted:         "Get started",

  pred_title:      "Predictions",
  pred_groupStage: "Group Stage",
  pred_tournament: "Tournament Picks",
  pred_locked:     "Locked",
  pred_saved:      "Saved",
  pred_open:       "Open",
  pred_progress:   "Group Stage Progress",

  grp_title:        "My Groups",
  grp_create:       "Create a group",
  grp_join:         "Join a group",
  grp_chat:         "Group Chat",
  grp_members:      "Members",
  grp_entry:        "Entry",
  grp_passkey:      "Passkey",
  grp_manage:       "Manage",
  grp_overview:     "Overview",
  grp_youreInvited: "You're invited to",

  prof_title:       "Profile",
  prof_yourTeam:    "Your team",
  prof_autoAvatar:  "Auto Avatar",
  prof_soccerRole:  "Soccer Role",
  prof_photo:       "My Photo",
  prof_saveChanges: "Save changes",
  prof_language:    "Language",
  prof_country:     "Country",
  prof_displayName: "Display name",

  dash_title:     "Dashboard",
  dash_welcome:   "Welcome",
  dash_nextMatch: "Next Match",

  common_save:      "Save",
  common_cancel:    "Cancel",
  common_delete:    "Delete",
  common_loading:   "Loading…",
  common_error:     "Something went wrong",
  common_later:     "Later",
  common_joinGroup: "Join Group",
  common_complete:  "Complete",
  common_admin:     "Admin",
  common_member:    "Member",
  common_you:       "You",
  common_readMore:  "Read more",
};

// ── French ─────────────────────────────────────────────────────────────────────
const fr: Translations = {
  nav_dashboard:     "Tableau de bord",
  nav_groups:        "Mes groupes",
  nav_leaderboard:   "Classement",
  nav_predictions:   "Mes pronostics",
  nav_standings:     "Classements",
  nav_bracket:       "Tableau",
  nav_trivia:        "Quiz",
  nav_notifications: "Notifications",
  nav_profile:       "Profil",
  nav_chat:          "Chat du groupe",
  nav_signout:       "Déconnexion",
  nav_home:          "Accueil",
  nav_table:         "Tableau",
  nav_mybets:        "Mes paris",

  auth_createAccount:      "Créer un compte",
  auth_signin:             "Se connecter",
  auth_signup:             "S'inscrire",
  auth_email:              "E-mail",
  auth_password:           "Mot de passe",
  auth_displayName:        "Nom affiché",
  auth_continue:           "Continuer",
  auth_back:               "Retour",
  auth_checkEmail:         "Vérifiez votre e-mail !",
  auth_alreadyHaveAccount: "Déjà un compte ?",
  auth_noAccount:          "Pas encore de compte ?",
  auth_signout:            "Déconnexion",
  auth_getStarted:         "Commencer",

  pred_title:      "Pronostics",
  pred_groupStage: "Phase de groupes",
  pred_tournament: "Pronostics tournoi",
  pred_locked:     "Verrouillé",
  pred_saved:      "Enregistré",
  pred_open:       "Ouvert",
  pred_progress:   "Progression – Phase de groupes",

  grp_title:        "Mes groupes",
  grp_create:       "Créer un groupe",
  grp_join:         "Rejoindre un groupe",
  grp_chat:         "Chat du groupe",
  grp_members:      "Membres",
  grp_entry:        "Inscription",
  grp_passkey:      "Code d'accès",
  grp_manage:       "Gérer",
  grp_overview:     "Aperçu",
  grp_youreInvited: "Vous êtes invité à",

  prof_title:       "Profil",
  prof_yourTeam:    "Votre équipe",
  prof_autoAvatar:  "Avatar auto",
  prof_soccerRole:  "Rôle foot",
  prof_photo:       "Ma photo",
  prof_saveChanges: "Enregistrer",
  prof_language:    "Langue",
  prof_country:     "Pays",
  prof_displayName: "Nom affiché",

  dash_title:     "Tableau de bord",
  dash_welcome:   "Bienvenue",
  dash_nextMatch: "Prochain match",

  common_save:      "Enregistrer",
  common_cancel:    "Annuler",
  common_delete:    "Supprimer",
  common_loading:   "Chargement…",
  common_error:     "Une erreur est survenue",
  common_later:     "Plus tard",
  common_joinGroup: "Rejoindre le groupe",
  common_complete:  "Complet",
  common_admin:     "Admin",
  common_member:    "Membre",
  common_you:       "Vous",
  common_readMore:  "Lire la suite",
};

// ── German ─────────────────────────────────────────────────────────────────────
const de: Translations = {
  nav_dashboard:     "Übersicht",
  nav_groups:        "Meine Gruppen",
  nav_leaderboard:   "Rangliste",
  nav_predictions:   "Meine Tipps",
  nav_standings:     "Tabelle",
  nav_bracket:       "Turnierbaum",
  nav_trivia:        "Quiz",
  nav_notifications: "Benachrichtigungen",
  nav_profile:       "Profil",
  nav_chat:          "Gruppen-Chat",
  nav_signout:       "Abmelden",
  nav_home:          "Start",
  nav_table:         "Tabelle",
  nav_mybets:        "Meine Tipps",

  auth_createAccount:      "Konto erstellen",
  auth_signin:             "Anmelden",
  auth_signup:             "Registrieren",
  auth_email:              "E-Mail",
  auth_password:           "Passwort",
  auth_displayName:        "Anzeigename",
  auth_continue:           "Weiter",
  auth_back:               "Zurück",
  auth_checkEmail:         "Überprüfe deine E-Mails!",
  auth_alreadyHaveAccount: "Schon ein Konto?",
  auth_noAccount:          "Noch kein Konto?",
  auth_signout:            "Abmelden",
  auth_getStarted:         "Loslegen",

  pred_title:      "Tipps",
  pred_groupStage: "Gruppenphase",
  pred_tournament: "Turnier-Tipps",
  pred_locked:     "Gesperrt",
  pred_saved:      "Gespeichert",
  pred_open:       "Offen",
  pred_progress:   "Gruppenphase – Fortschritt",

  grp_title:        "Meine Gruppen",
  grp_create:       "Gruppe erstellen",
  grp_join:         "Gruppe beitreten",
  grp_chat:         "Gruppen-Chat",
  grp_members:      "Mitglieder",
  grp_entry:        "Eintritt",
  grp_passkey:      "Zugangscode",
  grp_manage:       "Verwalten",
  grp_overview:     "Übersicht",
  grp_youreInvited: "Du wurdest eingeladen zu",

  prof_title:       "Profil",
  prof_yourTeam:    "Dein Team",
  prof_autoAvatar:  "Auto-Avatar",
  prof_soccerRole:  "Fußballrolle",
  prof_photo:       "Mein Foto",
  prof_saveChanges: "Speichern",
  prof_language:    "Sprache",
  prof_country:     "Land",
  prof_displayName: "Anzeigename",

  dash_title:     "Übersicht",
  dash_welcome:   "Willkommen",
  dash_nextMatch: "Nächstes Spiel",

  common_save:      "Speichern",
  common_cancel:    "Abbrechen",
  common_delete:    "Löschen",
  common_loading:   "Laden…",
  common_error:     "Ein Fehler ist aufgetreten",
  common_later:     "Später",
  common_joinGroup: "Gruppe beitreten",
  common_complete:  "Abgeschlossen",
  common_admin:     "Admin",
  common_member:    "Mitglied",
  common_you:       "Du",
  common_readMore:  "Mehr lesen",
};

// ── Dutch ──────────────────────────────────────────────────────────────────────
const nl: Translations = {
  nav_dashboard:     "Dashboard",
  nav_groups:        "Mijn groepen",
  nav_leaderboard:   "Ranglijst",
  nav_predictions:   "Mijn voorspellingen",
  nav_standings:     "Standen",
  nav_bracket:       "Schema",
  nav_trivia:        "Quiz",
  nav_notifications: "Meldingen",
  nav_profile:       "Profiel",
  nav_chat:          "Groepschat",
  nav_signout:       "Uitloggen",
  nav_home:          "Home",
  nav_table:         "Tabel",
  nav_mybets:        "Mijn tips",

  auth_createAccount:      "Account aanmaken",
  auth_signin:             "Inloggen",
  auth_signup:             "Registreren",
  auth_email:              "E-mail",
  auth_password:           "Wachtwoord",
  auth_displayName:        "Weergavenaam",
  auth_continue:           "Doorgaan",
  auth_back:               "Terug",
  auth_checkEmail:         "Controleer je e-mail!",
  auth_alreadyHaveAccount: "Al een account?",
  auth_noAccount:          "Nog geen account?",
  auth_signout:            "Uitloggen",
  auth_getStarted:         "Aan de slag",

  pred_title:      "Voorspellingen",
  pred_groupStage: "Groepsfase",
  pred_tournament: "Toernooitips",
  pred_locked:     "Vergrendeld",
  pred_saved:      "Opgeslagen",
  pred_open:       "Open",
  pred_progress:   "Groepsfase – voortgang",

  grp_title:        "Mijn groepen",
  grp_create:       "Groep aanmaken",
  grp_join:         "Groep aansluiten",
  grp_chat:         "Groepschat",
  grp_members:      "Leden",
  grp_entry:        "Inschrijving",
  grp_passkey:      "Toegangscode",
  grp_manage:       "Beheren",
  grp_overview:     "Overzicht",
  grp_youreInvited: "Je bent uitgenodigd voor",

  prof_title:       "Profiel",
  prof_yourTeam:    "Jouw team",
  prof_autoAvatar:  "Auto-avatar",
  prof_soccerRole:  "Voetbalrol",
  prof_photo:       "Mijn foto",
  prof_saveChanges: "Opslaan",
  prof_language:    "Taal",
  prof_country:     "Land",
  prof_displayName: "Weergavenaam",

  dash_title:     "Dashboard",
  dash_welcome:   "Welkom",
  dash_nextMatch: "Volgende wedstrijd",

  common_save:      "Opslaan",
  common_cancel:    "Annuleren",
  common_delete:    "Verwijderen",
  common_loading:   "Laden…",
  common_error:     "Er is iets misgegaan",
  common_later:     "Later",
  common_joinGroup: "Groep aansluiten",
  common_complete:  "Voltooid",
  common_admin:     "Admin",
  common_member:    "Lid",
  common_you:       "Jij",
  common_readMore:  "Meer lezen",
};

// ── Spanish ────────────────────────────────────────────────────────────────────
const es: Translations = {
  nav_dashboard:     "Panel",
  nav_groups:        "Mis grupos",
  nav_leaderboard:   "Clasificación",
  nav_predictions:   "Mis pronósticos",
  nav_standings:     "Tabla",
  nav_bracket:       "Cuadro",
  nav_trivia:        "Trivia",
  nav_notifications: "Notificaciones",
  nav_profile:       "Perfil",
  nav_chat:          "Chat del grupo",
  nav_signout:       "Cerrar sesión",
  nav_home:          "Inicio",
  nav_table:         "Tabla",
  nav_mybets:        "Mis apuestas",

  auth_createAccount:      "Crear cuenta",
  auth_signin:             "Iniciar sesión",
  auth_signup:             "Registrarse",
  auth_email:              "Correo electrónico",
  auth_password:           "Contraseña",
  auth_displayName:        "Nombre visible",
  auth_continue:           "Continuar",
  auth_back:               "Atrás",
  auth_checkEmail:         "¡Revisa tu correo!",
  auth_alreadyHaveAccount: "¿Ya tienes cuenta?",
  auth_noAccount:          "¿Sin cuenta aún?",
  auth_signout:            "Cerrar sesión",
  auth_getStarted:         "Empezar",

  pred_title:      "Pronósticos",
  pred_groupStage: "Fase de grupos",
  pred_tournament: "Picks del torneo",
  pred_locked:     "Bloqueado",
  pred_saved:      "Guardado",
  pred_open:       "Abierto",
  pred_progress:   "Fase de grupos – progreso",

  grp_title:        "Mis grupos",
  grp_create:       "Crear grupo",
  grp_join:         "Unirse a un grupo",
  grp_chat:         "Chat del grupo",
  grp_members:      "Miembros",
  grp_entry:        "Entrada",
  grp_passkey:      "Contraseña",
  grp_manage:       "Gestionar",
  grp_overview:     "Resumen",
  grp_youreInvited: "Estás invitado a",

  prof_title:       "Perfil",
  prof_yourTeam:    "Tu equipo",
  prof_autoAvatar:  "Avatar auto",
  prof_soccerRole:  "Rol de fútbol",
  prof_photo:       "Mi foto",
  prof_saveChanges: "Guardar cambios",
  prof_language:    "Idioma",
  prof_country:     "País",
  prof_displayName: "Nombre visible",

  dash_title:     "Panel",
  dash_welcome:   "Bienvenido",
  dash_nextMatch: "Próximo partido",

  common_save:      "Guardar",
  common_cancel:    "Cancelar",
  common_delete:    "Eliminar",
  common_loading:   "Cargando…",
  common_error:     "Algo salió mal",
  common_later:     "Más tarde",
  common_joinGroup: "Unirse al grupo",
  common_complete:  "Completado",
  common_admin:     "Admin",
  common_member:    "Miembro",
  common_you:       "Tú",
  common_readMore:  "Leer más",
};

// ── Portuguese ─────────────────────────────────────────────────────────────────
const pt: Translations = {
  nav_dashboard:     "Painel",
  nav_groups:        "Meus grupos",
  nav_leaderboard:   "Classificação",
  nav_predictions:   "Meus palpites",
  nav_standings:     "Tabela",
  nav_bracket:       "Chaveamento",
  nav_trivia:        "Trivia",
  nav_notifications: "Notificações",
  nav_profile:       "Perfil",
  nav_chat:          "Chat do grupo",
  nav_signout:       "Sair",
  nav_home:          "Início",
  nav_table:         "Tabela",
  nav_mybets:        "Meus palpites",

  auth_createAccount:      "Criar conta",
  auth_signin:             "Entrar",
  auth_signup:             "Cadastrar",
  auth_email:              "E-mail",
  auth_password:           "Senha",
  auth_displayName:        "Nome de exibição",
  auth_continue:           "Continuar",
  auth_back:               "Voltar",
  auth_checkEmail:         "Verifique seu e-mail!",
  auth_alreadyHaveAccount: "Já tem uma conta?",
  auth_noAccount:          "Ainda não tem conta?",
  auth_signout:            "Sair",
  auth_getStarted:         "Começar",

  pred_title:      "Palpites",
  pred_groupStage: "Fase de grupos",
  pred_tournament: "Picks do torneio",
  pred_locked:     "Bloqueado",
  pred_saved:      "Salvo",
  pred_open:       "Aberto",
  pred_progress:   "Fase de grupos – progresso",

  grp_title:        "Meus grupos",
  grp_create:       "Criar grupo",
  grp_join:         "Entrar em um grupo",
  grp_chat:         "Chat do grupo",
  grp_members:      "Membros",
  grp_entry:        "Inscrição",
  grp_passkey:      "Senha de acesso",
  grp_manage:       "Gerenciar",
  grp_overview:     "Visão geral",
  grp_youreInvited: "Você foi convidado para",

  prof_title:       "Perfil",
  prof_yourTeam:    "Seu time",
  prof_autoAvatar:  "Avatar automático",
  prof_soccerRole:  "Posição no futebol",
  prof_photo:       "Minha foto",
  prof_saveChanges: "Salvar alterações",
  prof_language:    "Idioma",
  prof_country:     "País",
  prof_displayName: "Nome de exibição",

  dash_title:     "Painel",
  dash_welcome:   "Bem-vindo",
  dash_nextMatch: "Próximo jogo",

  common_save:      "Salvar",
  common_cancel:    "Cancelar",
  common_delete:    "Excluir",
  common_loading:   "Carregando…",
  common_error:     "Algo deu errado",
  common_later:     "Mais tarde",
  common_joinGroup: "Entrar no grupo",
  common_complete:  "Completo",
  common_admin:     "Admin",
  common_member:    "Membro",
  common_you:       "Você",
  common_readMore:  "Ler mais",
};

// ── Hebrew ─────────────────────────────────────────────────────────────────────
const he: Translations = {
  nav_dashboard:     "לוח בקרה",
  nav_groups:        "הקבוצות שלי",
  nav_leaderboard:   "טבלת דירוג",
  nav_predictions:   "הניחושים שלי",
  nav_standings:     "טבלאות",
  nav_bracket:       "סבבי הבדיה",
  nav_trivia:        "טריוויה",
  nav_notifications: "התראות",
  nav_profile:       "פרופיל",
  nav_chat:          "צ'אט קבוצה",
  nav_signout:       "התנתקות",
  nav_home:          "בית",
  nav_table:         "טבלה",
  nav_mybets:        "ההימורים שלי",

  auth_createAccount:      "יצירת חשבון",
  auth_signin:             "כניסה",
  auth_signup:             "הרשמה",
  auth_email:              "אימייל",
  auth_password:           "סיסמה",
  auth_displayName:        "שם תצוגה",
  auth_continue:           "המשך",
  auth_back:               "חזרה",
  auth_checkEmail:         "!בדוק את האימייל שלך",
  auth_alreadyHaveAccount: "כבר יש לך חשבון?",
  auth_noAccount:          "עדיין אין חשבון?",
  auth_signout:            "התנתקות",
  auth_getStarted:         "בוא נתחיל",

  pred_title:      "ניחושים",
  pred_groupStage: "שלב הבתים",
  pred_tournament: "ניחושי הטורניר",
  pred_locked:     "נעול",
  pred_saved:      "נשמר",
  pred_open:       "פתוח",
  pred_progress:   "התקדמות שלב הבתים",

  grp_title:        "הקבוצות שלי",
  grp_create:       "יצירת קבוצה",
  grp_join:         "הצטרפות לקבוצה",
  grp_chat:         "צ'אט קבוצה",
  grp_members:      "חברים",
  grp_entry:        "דמי כניסה",
  grp_passkey:      "קוד גישה",
  grp_manage:       "ניהול",
  grp_overview:     "סקירה",
  grp_youreInvited: "הוזמנת להצטרף ל",

  prof_title:       "פרופיל",
  prof_yourTeam:    "הנבחרת שלך",
  prof_autoAvatar:  "אווטאר אוטומטי",
  prof_soccerRole:  "תפקיד בכדורגל",
  prof_photo:       "התמונה שלי",
  prof_saveChanges: "שמירת שינויים",
  prof_language:    "שפה",
  prof_country:     "מדינה",
  prof_displayName: "שם תצוגה",

  dash_title:     "לוח בקרה",
  dash_welcome:   "ברוך הבא",
  dash_nextMatch: "המשחק הבא",

  common_save:      "שמירה",
  common_cancel:    "ביטול",
  common_delete:    "מחיקה",
  common_loading:   "…טוען",
  common_error:     "משהו השתבש",
  common_later:     "מאוחר יותר",
  common_joinGroup: "הצטרפות לקבוצה",
  common_complete:  "הושלם",
  common_admin:     "מנהל",
  common_member:    "חבר",
  common_you:       "אתה",
  common_readMore:  "קרא עוד",
};

// ── Arabic ─────────────────────────────────────────────────────────────────────
const ar: Translations = {
  nav_dashboard:     "لوحة القيادة",
  nav_groups:        "مجموعاتي",
  nav_leaderboard:   "لوحة المتصدرين",
  nav_predictions:   "تنبؤاتي",
  nav_standings:     "الترتيب",
  nav_bracket:       "جدول المباريات",
  nav_trivia:        "معلومات عامة",
  nav_notifications: "الإشعارات",
  nav_profile:       "الملف الشخصي",
  nav_chat:          "دردشة المجموعة",
  nav_signout:       "تسجيل الخروج",
  nav_home:          "الرئيسية",
  nav_table:         "الجدول",
  nav_mybets:        "رهاناتي",

  auth_createAccount:      "إنشاء حساب",
  auth_signin:             "تسجيل الدخول",
  auth_signup:             "التسجيل",
  auth_email:              "البريد الإلكتروني",
  auth_password:           "كلمة المرور",
  auth_displayName:        "الاسم المعروض",
  auth_continue:           "متابعة",
  auth_back:               "رجوع",
  auth_checkEmail:         "!تحقق من بريدك الإلكتروني",
  auth_alreadyHaveAccount: "هل لديك حساب بالفعل؟",
  auth_noAccount:          "ليس لديك حساب بعد؟",
  auth_signout:            "تسجيل الخروج",
  auth_getStarted:         "ابدأ الآن",

  pred_title:      "التنبؤات",
  pred_groupStage: "مرحلة المجموعات",
  pred_tournament: "توقعات البطولة",
  pred_locked:     "مغلق",
  pred_saved:      "محفوظ",
  pred_open:       "مفتوح",
  pred_progress:   "تقدم مرحلة المجموعات",

  grp_title:        "مجموعاتي",
  grp_create:       "إنشاء مجموعة",
  grp_join:         "الانضمام إلى مجموعة",
  grp_chat:         "دردشة المجموعة",
  grp_members:      "الأعضاء",
  grp_entry:        "رسوم الدخول",
  grp_passkey:      "رمز الوصول",
  grp_manage:       "إدارة",
  grp_overview:     "نظرة عامة",
  grp_youreInvited: "لقد دُعيت للانضمام إلى",

  prof_title:       "الملف الشخصي",
  prof_yourTeam:    "فريقك",
  prof_autoAvatar:  "صورة تلقائية",
  prof_soccerRole:  "دور كرة القدم",
  prof_photo:       "صورتي",
  prof_saveChanges: "حفظ التغييرات",
  prof_language:    "اللغة",
  prof_country:     "البلد",
  prof_displayName: "الاسم المعروض",

  dash_title:     "لوحة القيادة",
  dash_welcome:   "مرحباً",
  dash_nextMatch: "المباراة القادمة",

  common_save:      "حفظ",
  common_cancel:    "إلغاء",
  common_delete:    "حذف",
  common_loading:   "…جارٍ التحميل",
  common_error:     "حدث خطأ ما",
  common_later:     "لاحقاً",
  common_joinGroup: "الانضمام إلى المجموعة",
  common_complete:  "مكتمل",
  common_admin:     "مشرف",
  common_member:    "عضو",
  common_you:       "أنت",
  common_readMore:  "اقرأ المزيد",
};

// ── Translation map ────────────────────────────────────────────────────────────
export const TRANSLATIONS: Record<Locale, Translations> = { en, fr, de, nl, es, pt, he, ar };

// ── Helper to detect locale from browser ──────────────────────────────────────
export function detectLocale(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const stored = localStorage.getItem("cupclash_locale") as Locale | null;
    if (stored && stored in LOCALES) return stored;
  } catch {}
  const lang = navigator.language.split("-")[0] as Locale;
  return lang in LOCALES ? lang : "en";
}
