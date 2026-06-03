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
  dash_title:        string;
  dash_welcome:      string;
  dash_nextMatch:    string;
  dash_guest_banner: string;
  dash_guest_sub:    string;
  dash_create_group: string;
  dash_sign_in:      string;

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

  // Groups — extended
  grp_delete:      string;
  grp_del_title:   string;
  grp_del_undo:    string;
  grp_deleting:    string;
  grp_del_body:    string;
  grp_back:        string;
  grp_prize_pot:   string;
  grp_adfree:      string;
  grp_prize_split: string;
  grp_scoring:     string;
  grp_locks:       string;
  grp_no_members:  string;

  // Scoring labels
  sc_outcome:  string;
  sc_exact:    string;
  sc_ko:       string;
  sc_winner:   string;
  sc_scorer:   string;
  sc_assister: string;
  sc_golden:   string;
  sc_defence:  string;
  sc_young:    string;
  sc_third:    string;

  // Predictions — extended
  pred_lock_notice:    string;
  pred_predicting_for: string;
  pred_grp_subtitle:   string;
  pred_trn_subtitle:   string;
  pred_active:         string;
  pred_autosave_hint:  string;
  pred_saving:         string;
  pred_failed:         string;
  pred_locks_hm:       string;
  pred_locks_m:        string;
  pred_qual_hint:      string;
  pred_grp_winners:    string;
  pred_runners_up:     string;
  pred_best_third:     string;
  pred_pred_table:     string;
  pred_top2:           string;
  pred_third_may:      string;

  // Common — extended
  common_dashboard:   string;
  common_admin_panel: string;

  // Admin panel
  adm_payments:     string;
  adm_payout_split: string;
  adm_save_payouts: string;
  adm_saved:        string;
  adm_payout_err:   string;
  adm_invite:       string;
  adm_copy:         string;
  adm_copied:       string;
  adm_new_code:     string;
  adm_invite_hint:  string;
  adm_danger:       string;
  adm_danger_warn:  string;
  adm_del_body:     string;

  // Profile — extended
  prof_my_profile:  string;
  prof_regenerate:  string;
  prof_no_country:  string;
  prof_auto_desc:   string;
  prof_preset_desc: string;
  prof_photo_desc:  string;
  prof_auto_exp:    string;
  prof_use_auto:    string;
  prof_pick_role:   string;
  prof_name_hint:   string;
  prof_af_title:    string;
  prof_af_label:    string;
  prof_af_desc:     string;
  prof_af_home:     string;
  prof_af_away:     string;
  prof_err_size:    string;
  prof_err_auth:    string;
  prof_loading:     string;
  prof_upload_info: string;
  prof_uploading:   string;
  prof_choose:      string;
  prof_remove:      string;
  prof_saving:      string;
  prof_saved:       string;

  // Auth — extended
  auth_ph_name:          string;
  auth_signup_join:      string;
  auth_signin_instead:   string;
  auth_welcome_back:     string;
  auth_signin_sub:       string;
  auth_forgot:           string;
  auth_signing_in:       string;
  auth_no_account:       string;
  auth_create_free:      string;
  auth_subtitle:         string;
  auth_continue_email:   string;
  auth_ph_email:         string;
  auth_ph_password:      string;
  auth_err_password:     string;
  auth_pick_team:        string;
  auth_pick_team_sub:    string;
  auth_skip:             string;
  auth_creating:         string;
  auth_check_body:       string;
  auth_confirmed:        string;
  auth_signin_here:      string;

  // Groups listing
  grp_compete:      string;
  grp_create_or:    string;
  grp_join_pk:      string;
  grp_your:         string;
  grp_none:         string;
  grp_none_sub:     string;
  grp_invited_to:   string;
  grp_complete_step:string;

  // Common extended
  common_new_group:    string;
  common_view_group:   string;
  common_create_group: string;
  common_sign_in:      string;

  // Leaderboard / Standings / Bracket
  lb_no_group:   string;
  lb_no_group_b: string;
  lb_find:       string;
  st_title:      string;
  st_info:       string;
  br_title:      string;
  br_info:       string;
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

  dash_title:        "Dashboard",
  dash_welcome:      "Welcome",
  dash_nextMatch:    "Next Match",
  dash_guest_banner: "You're exploring as a guest. No account needed yet.",
  dash_guest_sub:    "Save predictions, create a group, or join one to get started.",
  dash_create_group: "Create Group",
  dash_sign_in:      "Sign in",

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

  grp_delete:      "Delete Group",
  grp_del_title:   "Delete Group?",
  grp_del_undo:    "This cannot be undone",
  grp_deleting:    "Deleting…",
  grp_del_body:    "{name} and all its members, predictions, and chat history will be permanently deleted.",
  grp_back:        "← My Groups",
  grp_prize_pot:   "Prize pot",
  grp_adfree:      "Ad-free",
  grp_prize_split: "Prize Split",
  grp_scoring:     "Scoring Rules",
  grp_locks:       "Locks June 11",
  grp_no_members:  "No members yet.",

  sc_outcome:  "Correct outcome",
  sc_exact:    "Exact score",
  sc_ko:       "KO advancement",
  sc_winner:   "Tournament winner",
  sc_scorer:   "Top scorer",
  sc_assister: "Top assister",
  sc_golden:   "Golden Ball",
  sc_defence:  "Best defence",
  sc_young:    "Best young player",
  sc_third:    "Best 3rd-place (each)",

  pred_lock_notice:    "Matches lock 5 min before kickoff · Tournament picks lock June 11",
  pred_predicting_for: "Predicting for",
  pred_grp_subtitle:   "36 matches · scores & tables",
  pred_trn_subtitle:   "Winner, boot, defence & more",
  pred_active:         "Active",
  pred_autosave_hint:  "Auto-saves as you type · Each match locks 5 min before kickoff",
  pred_saving:         "Saving…",
  pred_failed:         "Failed",
  pred_locks_hm:       "Locks in {h}H {m}M",
  pred_locks_m:        "Locks in {m}M",
  pred_qual_hint:      "Complete all groups for full picture",
  pred_grp_winners:    "Group Winners",
  pred_runners_up:     "Runners-up",
  pred_best_third:     "Best 8 Third-Place Teams",
  pred_pred_table:     "Predicted Table",
  pred_top2:           "Top 2 qualify",
  pred_third_may:      "3rd — may qualify",

  common_dashboard:   "Dashboard",
  common_admin_panel: "Admin Panel",

  adm_payments:     "Member Payments",
  adm_payout_split: "Payout Split",
  adm_save_payouts: "Save Payout Split",
  adm_saved:        "Saved!",
  adm_payout_err:   "Must add up to exactly 100%",
  adm_invite:       "Invite Link",
  adm_copy:         "Copy Link",
  adm_copied:       "Copied!",
  adm_new_code:     "New Code",
  adm_invite_hint:  "Share this link with your group. Anyone with it can join.",
  adm_danger:       "Danger Zone",
  adm_danger_warn:  "Permanently delete this group and all associated data. This cannot be undone.",
  adm_del_body:     "All members, predictions, and chat history will be permanently deleted.",

  prof_my_profile:  "My Profile",
  prof_regenerate:  "Regenerate",
  prof_no_country:  "No country",
  prof_auto_desc:   "Auto-generated · unique to your name",
  prof_preset_desc: "Soccer role avatar",
  prof_photo_desc:  "Your uploaded photo",
  prof_auto_exp:    "Your avatar is generated automatically from your name. Every name produces a unique, consistent illustrated face.",
  prof_use_auto:    "Use this avatar",
  prof_pick_role:   "Pick your role on the pitch:",
  prof_name_hint:   "Your auto avatar updates live as you type.",
  prof_af_title:    "Auto-fill Safety Net",
  prof_af_label:    "Auto-fill my predictions",
  prof_af_desc:     "Submit a fallback score before the lock window",
  prof_af_home:     "Default home score",
  prof_af_away:     "Default away score",
  prof_err_size:    "Photo must be under 2MB",
  prof_err_auth:    "Not signed in. Please refresh and try again.",
  prof_loading:     "Loading profile...",
  prof_upload_info: "Upload a photo. Max 2MB, JPG or PNG.",
  prof_uploading:   "Uploading...",
  prof_choose:      "Choose photo",
  prof_remove:      "Remove photo",
  prof_saving:      "Saving...",
  prof_saved:       "Profile saved!",
  auth_ph_name:          "How your friends will see you",
  auth_signup_join:      "Create account & Join",
  auth_signin_instead:   "Already have an account? Sign in",
  auth_welcome_back:     "Welcome back",
  auth_signin_sub:       "Enter your credentials to continue.",
  auth_forgot:           "Forgot?",
  auth_signing_in:       "Signing in...",
  auth_no_account:       "Don't have an account?",
  auth_create_free:      "Create one free",
  auth_subtitle:         "Quick — takes 30 seconds.",
  auth_continue_email:   "or continue with email",
  auth_ph_email:         "you@example.com",
  auth_ph_password:      "Min 8 characters",
  auth_err_password:     "Password must be at least 8 characters",
  auth_pick_team:        "Pick your team",
  auth_pick_team_sub:    "Your team colors become the app's theme. You can change this later.",
  auth_skip:             "Skip for now",
  auth_creating:         "Creating...",
  auth_check_body:       "We sent a confirmation link to {email}. Click it to verify your account.",
  auth_confirmed:        "Already confirmed?",
  auth_signin_here:      "Sign in here",
  grp_compete:      "Join a group to compete",
  grp_create_or:    "Create your own prediction league or join one with a passkey.",
  grp_join_pk:      "Join with passkey",
  grp_your:         "Your groups",
  grp_none:         "No groups yet",
  grp_none_sub:     "Create a group or join one with a passkey.",
  grp_invited_to:   "You're invited to join",
  grp_complete_step:"Complete the last step to join the group and start predicting.",
  common_new_group:    "New Group",
  common_view_group:   "View Group",
  common_create_group: "Create a group",
  common_sign_in:      "Sign in",
  lb_no_group:   "No group yet",
  lb_no_group_b: "Join or create a group to see the leaderboard.",
  lb_find:       "Find a group",
  st_title:      "Group Standings",
  st_info:       "All 12 groups · Updated after every match · Top 2 + 8 best 3rd-place teams advance",
  br_title:      "Knockout Bracket",
  br_info:       "Teams confirmed after the group stage concludes June 29.",

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

  dash_title:        "Tableau de bord",
  dash_welcome:      "Bienvenue",
  dash_nextMatch:    "Prochain match",
  dash_guest_banner: "Vous explorez en tant qu'invité. Pas besoin de compte.",
  dash_guest_sub:    "Sauvegardez vos pronostics, créez ou rejoignez un groupe.",
  dash_create_group: "Créer un groupe",
  dash_sign_in:      "Se connecter",

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

  grp_delete:      "Supprimer le groupe",
  grp_del_title:   "Supprimer le groupe ?",
  grp_del_undo:    "Cette action est irréversible",
  grp_deleting:    "Suppression…",
  grp_del_body:    "{name} et toutes ses données seront supprimés définitivement.",
  grp_back:        "← Mes groupes",
  grp_prize_pot:   "Cagnotte",
  grp_adfree:      "Sans pub",
  grp_prize_split: "Répartition des prix",
  grp_scoring:     "Règles de notation",
  grp_locks:       "Verrouillé le 11 juin",
  grp_no_members:  "Aucun membre pour l'instant.",

  sc_outcome:  "Résultat correct",
  sc_exact:    "Score exact",
  sc_ko:       "Avancement en KO",
  sc_winner:   "Vainqueur du tournoi",
  sc_scorer:   "Meilleur buteur",
  sc_assister: "Meilleur passeur",
  sc_golden:   "Ballon d'Or",
  sc_defence:  "Meilleure défense",
  sc_young:    "Meilleur jeune joueur",
  sc_third:    "3e place (chacun)",

  pred_lock_notice:    "Les matchs se verrouillent 5 min avant le coup d'envoi",
  pred_predicting_for: "Pronostic pour",
  pred_grp_subtitle:   "36 matchs · scores & tableaux",
  pred_trn_subtitle:   "Vainqueur, top buteur, défense & plus",
  pred_active:         "Actif",
  pred_autosave_hint:  "Sauvegarde auto · Chaque match se verrouille 5 min avant",
  pred_saving:         "Enregistrement…",
  pred_failed:         "Échec",
  pred_locks_hm:       "Verrouillé dans {h}h {m}m",
  pred_locks_m:        "Verrouillé dans {m}m",
  pred_qual_hint:      "Complétez tous les groupes pour une vue complète",
  pred_grp_winners:    "Vainqueurs de groupe",
  pred_runners_up:     "Deuxièmes",
  pred_best_third:     "8 meilleures 3es équipes",
  pred_pred_table:     "Tableau prévu",
  pred_top2:           "Les 2 premiers se qualifient",
  pred_third_may:      "3e — peut se qualifier",

  common_dashboard:   "Tableau de bord",
  common_admin_panel: "Panneau admin",

  adm_payments:     "Paiements des membres",
  adm_payout_split: "Répartition des gains",
  adm_save_payouts: "Enregistrer la répartition",
  adm_saved:        "Enregistré !",
  adm_payout_err:   "Doit totaliser exactement 100 %",
  adm_invite:       "Lien d'invitation",
  adm_copy:         "Copier le lien",
  adm_copied:       "Copié !",
  adm_new_code:     "Nouveau code",
  adm_invite_hint:  "Partagez ce lien — tout le monde peut rejoindre.",
  adm_danger:       "Zone dangereuse",
  adm_danger_warn:  "Supprimer définitivement ce groupe. Irréversible.",
  adm_del_body:     "Membres, pronostics et messages seront définitivement supprimés.",

  prof_my_profile:  "Mon profil",
  prof_regenerate:  "Régénérer",
  prof_no_country:  "Aucun pays",
  prof_auto_desc:   "Généré auto · unique à votre nom",
  prof_preset_desc: "Avatar rôle foot",
  prof_photo_desc:  "Votre photo",
  prof_auto_exp:    "Votre avatar est généré automatiquement à partir de votre nom.",
  prof_use_auto:    "Utiliser cet avatar",
  prof_pick_role:   "Choisissez votre rôle sur le terrain :",
  prof_name_hint:   "L'avatar se met à jour en temps réel.",
  prof_af_title:    "Remplissage automatique",
  prof_af_label:    "Auto-remplir mes pronostics",
  prof_af_desc:     "Soumettre un score de secours avant la fermeture",
  prof_af_home:     "Score domicile par défaut",
  prof_af_away:     "Score extérieur par défaut",
  prof_err_size:    "La photo doit faire moins de 2 Mo",
  prof_err_auth:    "Non connecté. Veuillez rafraîchir.",
  prof_loading:     "Chargement du profil...",
  prof_upload_info: "2 Mo max, JPG ou PNG.",
  prof_uploading:   "Téléchargement...",
  prof_choose:      "Choisir une photo",
  prof_remove:      "Supprimer la photo",
  prof_saving:      "Enregistrement...",
  prof_saved:       "Profil enregistré !",
  auth_signup_join:      "Créer un compte & Rejoindre",
  auth_signin_instead:   "Déjà un compte ? Se connecter",
  auth_welcome_back:     "Bienvenue de retour",
  auth_signin_sub:       "Entrez vos identifiants pour continuer.",
  auth_forgot:           "Oublié ?",
  auth_signing_in:       "Connexion...",
  auth_no_account:       "Pas de compte ?",
  auth_create_free:      "Créez-en un gratuitement",
  auth_subtitle:         "Rapide — ça prend 30 secondes.",
  auth_continue_email:   "ou continuer avec l'e-mail",
  auth_ph_email:         "vous@exemple.com",
  auth_ph_password:      "8 caractères minimum",
  auth_err_password:     "Le mot de passe doit comporter au moins 8 caractères",
  auth_pick_team:        "Choisissez votre équipe",
  auth_pick_team_sub:    "Les couleurs de votre équipe deviennent le thème de l'app.",
  auth_skip:             "Passer pour l'instant",
  auth_creating:         "Création...",
  auth_check_body:       "Nous avons envoyé un lien de confirmation à {email}.",
  auth_confirmed:        "Déjà confirmé ?",
  auth_signin_here:      "Se connecter ici",
  grp_compete:      "Rejoignez un groupe pour concourir",
  grp_create_or:    "Créez votre ligue ou rejoignez-en une avec un code d'accès.",
  grp_join_pk:      "Rejoindre avec un code",
  grp_your:         "Vos groupes",
  grp_none:         "Pas encore de groupes",
  grp_none_sub:     "Créez un groupe ou rejoignez-en un.",
  grp_invited_to:   "Vous êtes invité à rejoindre",
  grp_complete_step:"Complétez la dernière étape pour rejoindre le groupe.",
  common_new_group:    "Nouveau groupe",
  common_view_group:   "Voir le groupe",
  common_create_group: "Créer un groupe",
  common_sign_in:      "Se connecter",
  lb_no_group:   "Pas encore de groupe",
  lb_no_group_b: "Rejoignez ou créez un groupe pour voir le classement.",
  lb_find:       "Trouver un groupe",
  st_title:      "Classements de groupe",
  st_info:       "12 groupes · Mis à jour après chaque match",
  br_title:      "Tableau des éliminatoires",
  br_info:       "Équipes confirmées après la phase de groupes le 29 juin.",
  auth_ph_name:          "Comment vos amis vous verront",

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

  dash_title:        "Übersicht",
  dash_welcome:      "Willkommen",
  dash_nextMatch:    "Nächstes Spiel",
  dash_guest_banner: "Du erkundest als Gast. Noch kein Konto nötig.",
  dash_guest_sub:    "Speichere Tipps, erstelle oder tritt einer Gruppe bei.",
  dash_create_group: "Gruppe erstellen",
  dash_sign_in:      "Anmelden",

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

  grp_delete:      "Gruppe löschen",
  grp_del_title:   "Gruppe löschen?",
  grp_del_undo:    "Dies kann nicht rückgängig gemacht werden",
  grp_deleting:    "Löschen…",
  grp_del_body:    "{name} und alle Daten werden dauerhaft gelöscht.",
  grp_back:        "← Meine Gruppen",
  grp_prize_pot:   "Preistopf",
  grp_adfree:      "Werbefrei",
  grp_prize_split: "Preisaufteilung",
  grp_scoring:     "Bewertungsregeln",
  grp_locks:       "Sperrt am 11. Juni",
  grp_no_members:  "Noch keine Mitglieder.",

  sc_outcome:  "Richtiges Ergebnis",
  sc_exact:    "Genaues Ergebnis",
  sc_ko:       "KO-Weiterkommen",
  sc_winner:   "Turniersieger",
  sc_scorer:   "Torschützenkönig",
  sc_assister: "Vorlagenkönig",
  sc_golden:   "Goldener Ball",
  sc_defence:  "Beste Abwehr",
  sc_young:    "Bester Jungspieler",
  sc_third:    "3. Platz (je)",

  pred_lock_notice:    "Spiele sperren 5 Min. vor Anpfiff",
  pred_predicting_for: "Tippt für",
  pred_grp_subtitle:   "36 Spiele · Ergebnisse & Tabellen",
  pred_trn_subtitle:   "Sieger, Torjäger, Abwehr & mehr",
  pred_active:         "Aktiv",
  pred_autosave_hint:  "Automatisch gespeichert · 5 Min. vor Anpfiff gesperrt",
  pred_saving:         "Speichern…",
  pred_failed:         "Fehlgeschlagen",
  pred_locks_hm:       "Sperrt in {h}H {m}M",
  pred_locks_m:        "Sperrt in {m}M",
  pred_qual_hint:      "Schließe alle Gruppen für das vollständige Bild ab",
  pred_grp_winners:    "Gruppensieger",
  pred_runners_up:     "Zweite Plätze",
  pred_best_third:     "Beste 8 Drittplatzierten",
  pred_pred_table:     "Vorhergesagte Tabelle",
  pred_top2:           "Top 2 qualifizieren sich",
  pred_third_may:      "3. — kann sich qualifizieren",

  common_dashboard:   "Übersicht",
  common_admin_panel: "Admin-Panel",

  adm_payments:     "Mitgliederzahlungen",
  adm_payout_split: "Auszahlungsaufteilung",
  adm_save_payouts: "Aufteilung speichern",
  adm_saved:        "Gespeichert!",
  adm_payout_err:   "Muss genau 100 % ergeben",
  adm_invite:       "Einladungslink",
  adm_copy:         "Link kopieren",
  adm_copied:       "Kopiert!",
  adm_new_code:     "Neuer Code",
  adm_invite_hint:  "Teile diesen Link — jeder kann beitreten.",
  adm_danger:       "Gefahrenzone",
  adm_danger_warn:  "Gruppe dauerhaft löschen. Nicht rückgängig zu machen.",
  adm_del_body:     "Alle Mitglieder, Tipps und Nachrichten werden dauerhaft gelöscht.",

  prof_my_profile:  "Mein Profil",
  prof_regenerate:  "Neu generieren",
  prof_no_country:  "Kein Land",
  prof_auto_desc:   "Auto-generiert · einzigartig für deinen Namen",
  prof_preset_desc: "Fußballrollen-Avatar",
  prof_photo_desc:  "Dein hochgeladenes Foto",
  prof_auto_exp:    "Dein Avatar wird automatisch aus deinem Namen generiert.",
  prof_use_auto:    "Diesen Avatar verwenden",
  prof_pick_role:   "Wähle deine Rolle auf dem Platz:",
  prof_name_hint:   "Avatar aktualisiert sich live beim Tippen.",
  prof_af_title:    "Auto-Ausfüll-Sicherheitsnetz",
  prof_af_label:    "Meine Tipps automatisch ausfüllen",
  prof_af_desc:     "Reserveergebnis vor der Sperrung einreichen",
  prof_af_home:     "Standard-Heimtore",
  prof_af_away:     "Standard-Auswärtstore",
  prof_err_size:    "Foto muss unter 2 MB sein",
  prof_err_auth:    "Nicht angemeldet. Bitte Seite neu laden.",
  prof_loading:     "Profil wird geladen...",
  prof_upload_info: "Foto hochladen. Max. 2 MB, JPG oder PNG.",
  prof_uploading:   "Wird hochgeladen...",
  prof_choose:      "Foto wählen",
  prof_remove:      "Foto entfernen",
  prof_saving:      "Speichern...",
  prof_saved:       "Profil gespeichert!",
  auth_signup_join:      "Konto erstellen & Beitreten",
  auth_signin_instead:   "Schon ein Konto? Anmelden",
  auth_welcome_back:     "Willkommen zurück",
  auth_signin_sub:       "Gib deine Zugangsdaten ein, um fortzufahren.",
  auth_forgot:           "Vergessen?",
  auth_signing_in:       "Anmelden...",
  auth_no_account:       "Noch kein Konto?",
  auth_create_free:      "Kostenlos erstellen",
  auth_subtitle:         "Schnell — dauert 30 Sekunden.",
  auth_continue_email:   "oder mit E-Mail fortfahren",
  auth_ph_email:         "du@beispiel.de",
  auth_ph_password:      "Mind. 8 Zeichen",
  auth_err_password:     "Das Passwort muss mindestens 8 Zeichen lang sein",
  auth_pick_team:        "Wähle dein Team",
  auth_pick_team_sub:    "Die Farben deines Teams werden zum App-Thema.",
  auth_skip:             "Jetzt überspringen",
  auth_creating:         "Wird erstellt...",
  auth_check_body:       "Wir haben einen Bestätigungslink an {email} gesendet.",
  auth_confirmed:        "Bereits bestätigt?",
  auth_signin_here:      "Hier anmelden",
  grp_compete:      "Tritt einer Gruppe bei und konkurriere",
  grp_create_or:    "Erstelle deine Liga oder tritt mit Zugangscode bei.",
  grp_join_pk:      "Mit Code beitreten",
  grp_your:         "Deine Gruppen",
  grp_none:         "Noch keine Gruppen",
  grp_none_sub:     "Erstelle eine Gruppe oder tritt einer bei.",
  grp_invited_to:   "Du wurdest eingeladen, beizutreten",
  grp_complete_step:"Schließe den letzten Schritt ab, um der Gruppe beizutreten.",
  common_new_group:    "Neue Gruppe",
  common_view_group:   "Gruppe ansehen",
  common_create_group: "Gruppe erstellen",
  common_sign_in:      "Anmelden",
  lb_no_group:   "Noch keine Gruppe",
  lb_no_group_b: "Tritt einer Gruppe bei oder erstelle eine, um die Rangliste zu sehen.",
  lb_find:       "Gruppe suchen",
  st_title:      "Gruppentabellen",
  st_info:       "12 Gruppen · Nach jedem Spiel aktualisiert",
  br_title:      "K.-o.-Runde",
  br_info:       "Teams bestätigt nach Abschluss der Gruppenphase am 29. Juni.",
  auth_ph_name:          "So sehen dich deine Freunde",

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

  dash_title:        "Dashboard",
  dash_welcome:      "Welkom",
  dash_nextMatch:    "Volgende wedstrijd",
  dash_guest_banner: "Je verkent als gast. Nog geen account nodig.",
  dash_guest_sub:    "Sla voorspellingen op, maak een groep of sluit je aan.",
  dash_create_group: "Groep aanmaken",
  dash_sign_in:      "Inloggen",

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

  grp_delete:      "Groep verwijderen",
  grp_del_title:   "Groep verwijderen?",
  grp_del_undo:    "Dit kan niet ongedaan worden gemaakt",
  grp_deleting:    "Verwijderen…",
  grp_del_body:    "{name} en alle gegevens worden permanent verwijderd.",
  grp_back:        "← Mijn groepen",
  grp_prize_pot:   "Prijzenpot",
  grp_adfree:      "Advertentievrij",
  grp_prize_split: "Prijsverdeling",
  grp_scoring:     "Puntenstelsel",
  grp_locks:       "Vergrendelt op 11 juni",
  grp_no_members:  "Nog geen leden.",

  sc_outcome:  "Juiste uitslag",
  sc_exact:    "Exacte score",
  sc_ko:       "KO-doorgaan",
  sc_winner:   "Toernooiwinnaar",
  sc_scorer:   "Topscorer",
  sc_assister: "Topassistgever",
  sc_golden:   "Gouden Bal",
  sc_defence:  "Beste verdediging",
  sc_young:    "Beste jonge speler",
  sc_third:    "3e plaats (elk)",

  pred_lock_notice:    "Wedstrijden vergrendelen 5 min voor aftrap",
  pred_predicting_for: "Voorspelling voor",
  pred_grp_subtitle:   "36 wedstrijden · scores & tabellen",
  pred_trn_subtitle:   "Winnaar, topscorer, verdediging & meer",
  pred_active:         "Actief",
  pred_autosave_hint:  "Auto-opgeslagen · 5 min voor aftrap vergrendeld",
  pred_saving:         "Opslaan…",
  pred_failed:         "Mislukt",
  pred_locks_hm:       "Vergrendelt in {h}u {m}m",
  pred_locks_m:        "Vergrendelt in {m}m",
  pred_qual_hint:      "Voltooi alle groepen voor het volledige beeld",
  pred_grp_winners:    "Groepswinnaars",
  pred_runners_up:     "Nummers twee",
  pred_best_third:     "Beste 8 derde teams",
  pred_pred_table:     "Voorspelde tabel",
  pred_top2:           "Top 2 plaatst zich",
  pred_third_may:      "3e — mogelijk geplaatst",

  common_dashboard:   "Dashboard",
  common_admin_panel: "Beheerpaneel",

  adm_payments:     "Betalingen leden",
  adm_payout_split: "Prijsverdeling",
  adm_save_payouts: "Verdeling opslaan",
  adm_saved:        "Opgeslagen!",
  adm_payout_err:   "Moet precies 100% zijn",
  adm_invite:       "Uitnodigingslink",
  adm_copy:         "Link kopiëren",
  adm_copied:       "Gekopieerd!",
  adm_new_code:     "Nieuwe code",
  adm_invite_hint:  "Deel deze link — iedereen kan deelnemen.",
  adm_danger:       "Gevarenzone",
  adm_danger_warn:  "Groep permanent verwijderen. Kan niet ongedaan worden gemaakt.",
  adm_del_body:     "Alle leden, voorspellingen en berichten worden permanent verwijderd.",

  prof_my_profile:  "Mijn profiel",
  prof_regenerate:  "Regenereren",
  prof_no_country:  "Geen land",
  prof_auto_desc:   "Auto-gegenereerd · uniek voor jouw naam",
  prof_preset_desc: "Voetbalrol-avatar",
  prof_photo_desc:  "Jouw geüploade foto",
  prof_auto_exp:    "Jouw avatar wordt automatisch gegenereerd uit jouw naam.",
  prof_use_auto:    "Deze avatar gebruiken",
  prof_pick_role:   "Kies jouw rol op het veld:",
  prof_name_hint:   "Avatar wordt live bijgewerkt terwijl je typt.",
  prof_af_title:    "Auto-invul vangnet",
  prof_af_label:    "Mijn voorspellingen automatisch invullen",
  prof_af_desc:     "Reservescore indienen voor vergrendeling",
  prof_af_home:     "Standaard thuisscore",
  prof_af_away:     "Standaard uitscore",
  prof_err_size:    "Foto moet kleiner zijn dan 2 MB",
  prof_err_auth:    "Niet ingelogd. Vernieuw de pagina.",
  prof_loading:     "Profiel laden...",
  prof_upload_info: "Foto uploaden. Max. 2 MB, JPG of PNG.",
  prof_uploading:   "Uploaden...",
  prof_choose:      "Foto kiezen",
  prof_remove:      "Foto verwijderen",
  prof_saving:      "Opslaan...",
  prof_saved:       "Profiel opgeslagen!",
  auth_signup_join:      "Account aanmaken & Aansluiten",
  auth_signin_instead:   "Al een account? Inloggen",
  auth_welcome_back:     "Welkom terug",
  auth_signin_sub:       "Voer je gegevens in om door te gaan.",
  auth_forgot:           "Vergeten?",
  auth_signing_in:       "Inloggen...",
  auth_no_account:       "Geen account?",
  auth_create_free:      "Maak er gratis een aan",
  auth_subtitle:         "Snel — duurt 30 seconden.",
  auth_continue_email:   "of doorgaan met e-mail",
  auth_ph_email:         "jij@voorbeeld.nl",
  auth_ph_password:      "Min. 8 tekens",
  auth_err_password:     "Wachtwoord moet minimaal 8 tekens bevatten",
  auth_pick_team:        "Kies jouw team",
  auth_pick_team_sub:    "De kleuren van jouw team worden het thema van de app.",
  auth_skip:             "Nu overslaan",
  auth_creating:         "Aanmaken...",
  auth_check_body:       "We hebben een bevestigingslink gestuurd naar {email}.",
  auth_confirmed:        "Al bevestigd?",
  auth_signin_here:      "Hier inloggen",
  grp_compete:      "Sluit je aan bij een groep om mee te doen",
  grp_create_or:    "Maak je eigen competitie of sluit je aan met een code.",
  grp_join_pk:      "Aansluiten met code",
  grp_your:         "Jouw groepen",
  grp_none:         "Nog geen groepen",
  grp_none_sub:     "Maak een groep of sluit je aan.",
  grp_invited_to:   "Je bent uitgenodigd om lid te worden van",
  grp_complete_step:"Voltooi de laatste stap om je aan te sluiten bij de groep.",
  common_new_group:    "Nieuwe groep",
  common_view_group:   "Groep bekijken",
  common_create_group: "Groep aanmaken",
  common_sign_in:      "Inloggen",
  lb_no_group:   "Nog geen groep",
  lb_no_group_b: "Sluit je aan bij of maak een groep om de ranglijst te zien.",
  lb_find:       "Groep vinden",
  st_title:      "Groepsstanden",
  st_info:       "12 groepen · Na elke wedstrijd bijgewerkt",
  br_title:      "Knock-outronde",
  br_info:       "Teams bevestigd na groepsfase op 29 juni.",
  auth_ph_name:          "Hoe jouw vrienden je zullen zien",

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

  dash_title:        "Panel",
  dash_welcome:      "Bienvenido",
  dash_nextMatch:    "Próximo partido",
  dash_guest_banner: "Estás explorando como invitado. Aún no necesitas cuenta.",
  dash_guest_sub:    "Guarda pronósticos, crea un grupo o únete a uno.",
  dash_create_group: "Crear grupo",
  dash_sign_in:      "Iniciar sesión",

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

  grp_delete:      "Eliminar grupo",
  grp_del_title:   "¿Eliminar grupo?",
  grp_del_undo:    "Esto no se puede deshacer",
  grp_deleting:    "Eliminando…",
  grp_del_body:    "{name} y todos sus datos se eliminarán permanentemente.",
  grp_back:        "← Mis grupos",
  grp_prize_pot:   "Premio total",
  grp_adfree:      "Sin anuncios",
  grp_prize_split: "Reparto de premios",
  grp_scoring:     "Reglas de puntuación",
  grp_locks:       "Se bloquea el 11 de junio",
  grp_no_members:  "Aún no hay miembros.",

  sc_outcome:  "Resultado correcto",
  sc_exact:    "Marcador exacto",
  sc_ko:       "Avance en KO",
  sc_winner:   "Campeón del torneo",
  sc_scorer:   "Máximo goleador",
  sc_assister: "Máximo asistente",
  sc_golden:   "Balón de Oro",
  sc_defence:  "Mejor defensa",
  sc_young:    "Mejor jugador joven",
  sc_third:    "3.º lugar (cada uno)",

  pred_lock_notice:    "Los partidos se bloquean 5 min antes del inicio",
  pred_predicting_for: "Pronosticando para",
  pred_grp_subtitle:   "36 partidos · puntuaciones y tablas",
  pred_trn_subtitle:   "Ganador, bota, defensa y más",
  pred_active:         "Activo",
  pred_autosave_hint:  "Guardado automático · Se bloquea 5 min antes",
  pred_saving:         "Guardando…",
  pred_failed:         "Error",
  pred_locks_hm:       "Se bloquea en {h}h {m}m",
  pred_locks_m:        "Se bloquea en {m}m",
  pred_qual_hint:      "Completa todos los grupos para una vista completa",
  pred_grp_winners:    "Ganadores de grupo",
  pred_runners_up:     "Subcampeones",
  pred_best_third:     "Mejores 8 terceros",
  pred_pred_table:     "Tabla pronosticada",
  pred_top2:           "Los 2 primeros clasifican",
  pred_third_may:      "3.º — puede clasificar",

  common_dashboard:   "Panel",
  common_admin_panel: "Panel de admin",

  adm_payments:     "Pagos de miembros",
  adm_payout_split: "Reparto de premios",
  adm_save_payouts: "Guardar reparto",
  adm_saved:        "¡Guardado!",
  adm_payout_err:   "Debe sumar exactamente 100%",
  adm_invite:       "Enlace de invitación",
  adm_copy:         "Copiar enlace",
  adm_copied:       "¡Copiado!",
  adm_new_code:     "Nuevo código",
  adm_invite_hint:  "Comparte este enlace — cualquiera puede unirse.",
  adm_danger:       "Zona de peligro",
  adm_danger_warn:  "Eliminar este grupo permanentemente. No se puede deshacer.",
  adm_del_body:     "Todos los miembros, pronósticos e historial de chat se eliminarán permanentemente.",

  prof_my_profile:  "Mi perfil",
  prof_regenerate:  "Regenerar",
  prof_no_country:  "Sin país",
  prof_auto_desc:   "Generado automáticamente · único para tu nombre",
  prof_preset_desc: "Avatar de rol de fútbol",
  prof_photo_desc:  "Tu foto subida",
  prof_auto_exp:    "Tu avatar se genera automáticamente a partir de tu nombre.",
  prof_use_auto:    "Usar este avatar",
  prof_pick_role:   "Elige tu rol en el campo:",
  prof_name_hint:   "El avatar se actualiza en tiempo real mientras escribes.",
  prof_af_title:    "Red de seguridad de autocompletar",
  prof_af_label:    "Autocompletar mis pronósticos",
  prof_af_desc:     "Enviar una puntuación de reserva antes del cierre",
  prof_af_home:     "Puntuación local predeterminada",
  prof_af_away:     "Puntuación visitante predeterminada",
  prof_err_size:    "La foto debe ser menor de 2 MB",
  prof_err_auth:    "No has iniciado sesión. Actualiza la página.",
  prof_loading:     "Cargando perfil...",
  prof_upload_info: "Sube una foto. Máx. 2 MB, JPG o PNG.",
  prof_uploading:   "Subiendo...",
  prof_choose:      "Elegir foto",
  prof_remove:      "Eliminar foto",
  prof_saving:      "Guardando...",
  prof_saved:       "¡Perfil guardado!",
  auth_signup_join:      "Crear cuenta y unirse",
  auth_signin_instead:   "¿Ya tienes cuenta? Iniciar sesión",
  auth_welcome_back:     "Bienvenido de nuevo",
  auth_signin_sub:       "Ingresa tus credenciales para continuar.",
  auth_forgot:           "¿Olvidaste?",
  auth_signing_in:       "Iniciando sesión...",
  auth_no_account:       "¿No tienes cuenta?",
  auth_create_free:      "Crea una gratis",
  auth_subtitle:         "Rápido — tarda 30 segundos.",
  auth_continue_email:   "o continuar con correo",
  auth_ph_email:         "tu@ejemplo.com",
  auth_ph_password:      "Mín. 8 caracteres",
  auth_err_password:     "La contraseña debe tener al menos 8 caracteres",
  auth_pick_team:        "Elige tu equipo",
  auth_pick_team_sub:    "Los colores de tu equipo se convierten en el tema de la app.",
  auth_skip:             "Omitir por ahora",
  auth_creating:         "Creando...",
  auth_check_body:       "Enviamos un enlace de confirmación a {email}.",
  auth_confirmed:        "¿Ya confirmado?",
  auth_signin_here:      "Inicia sesión aquí",
  grp_compete:      "Únete a un grupo para competir",
  grp_create_or:    "Crea tu liga o únete a una con una contraseña.",
  grp_join_pk:      "Unirse con contraseña",
  grp_your:         "Tus grupos",
  grp_none:         "Aún no hay grupos",
  grp_none_sub:     "Crea un grupo o únete a uno.",
  grp_invited_to:   "Has sido invitado a unirte a",
  grp_complete_step:"Completa el último paso para unirte al grupo.",
  common_new_group:    "Nuevo grupo",
  common_view_group:   "Ver grupo",
  common_create_group: "Crear grupo",
  common_sign_in:      "Iniciar sesión",
  lb_no_group:   "Aún no hay grupo",
  lb_no_group_b: "Únete o crea un grupo para ver la clasificación.",
  lb_find:       "Encontrar grupo",
  st_title:      "Clasificaciones de grupo",
  st_info:       "12 grupos · Actualizado después de cada partido",
  br_title:      "Cuadro de eliminatorias",
  br_info:       "Equipos confirmados tras la fase de grupos el 29 de junio.",
  auth_ph_name:          "Cómo te verán tus amigos",

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

  dash_title:        "Painel",
  dash_welcome:      "Bem-vindo",
  dash_nextMatch:    "Próximo jogo",
  dash_guest_banner: "Você está explorando como visitante. Sem conta por enquanto.",
  dash_guest_sub:    "Salve palpites, crie um grupo ou entre em um.",
  dash_create_group: "Criar grupo",
  dash_sign_in:      "Entrar",

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

  grp_delete:      "Excluir grupo",
  grp_del_title:   "Excluir grupo?",
  grp_del_undo:    "Esta ação não pode ser desfeita",
  grp_deleting:    "Excluindo…",
  grp_del_body:    "{name} e todos os seus dados serão excluídos permanentemente.",
  grp_back:        "← Meus grupos",
  grp_prize_pot:   "Prêmio total",
  grp_adfree:      "Sem anúncios",
  grp_prize_split: "Divisão de prêmios",
  grp_scoring:     "Regras de pontuação",
  grp_locks:       "Bloqueia em 11 de junho",
  grp_no_members:  "Sem membros ainda.",

  sc_outcome:  "Resultado correto",
  sc_exact:    "Placar exato",
  sc_ko:       "Avanço no mata-mata",
  sc_winner:   "Campeão do torneio",
  sc_scorer:   "Artilheiro",
  sc_assister: "Garçom principal",
  sc_golden:   "Bola de Ouro",
  sc_defence:  "Melhor defesa",
  sc_young:    "Melhor jovem jogador",
  sc_third:    "3.º lugar (cada)",

  pred_lock_notice:    "As partidas bloqueiam 5 min antes do início",
  pred_predicting_for: "Apostando para",
  pred_grp_subtitle:   "36 partidas · placar e tabelas",
  pred_trn_subtitle:   "Campeão, artilheiro, defesa e mais",
  pred_active:         "Ativo",
  pred_autosave_hint:  "Salvo automaticamente · Bloqueia 5 min antes",
  pred_saving:         "Salvando…",
  pred_failed:         "Falhou",
  pred_locks_hm:       "Bloqueia em {h}h {m}m",
  pred_locks_m:        "Bloqueia em {m}m",
  pred_qual_hint:      "Complete todos os grupos para ver o quadro completo",
  pred_grp_winners:    "Vencedores do grupo",
  pred_runners_up:     "Vice-campeões",
  pred_best_third:     "Melhores 8 terceiros",
  pred_pred_table:     "Tabela prevista",
  pred_top2:           "Os 2 primeiros se classificam",
  pred_third_may:      "3.º — pode se classificar",

  common_dashboard:   "Painel",
  common_admin_panel: "Painel admin",

  adm_payments:     "Pagamentos dos membros",
  adm_payout_split: "Divisão de prêmios",
  adm_save_payouts: "Salvar divisão",
  adm_saved:        "Salvo!",
  adm_payout_err:   "Deve somar exatamente 100%",
  adm_invite:       "Link de convite",
  adm_copy:         "Copiar link",
  adm_copied:       "Copiado!",
  adm_new_code:     "Novo código",
  adm_invite_hint:  "Compartilhe este link — qualquer um pode entrar.",
  adm_danger:       "Zona de perigo",
  adm_danger_warn:  "Excluir este grupo permanentemente. Não pode ser desfeito.",
  adm_del_body:     "Todos os membros, palpites e histórico de chat serão excluídos permanentemente.",

  prof_my_profile:  "Meu perfil",
  prof_regenerate:  "Regenerar",
  prof_no_country:  "Sem país",
  prof_auto_desc:   "Gerado automaticamente · único ao seu nome",
  prof_preset_desc: "Avatar de posição no futebol",
  prof_photo_desc:  "Sua foto enviada",
  prof_auto_exp:    "Seu avatar é gerado automaticamente a partir do seu nome.",
  prof_use_auto:    "Usar este avatar",
  prof_pick_role:   "Escolha sua posição no campo:",
  prof_name_hint:   "O avatar é atualizado em tempo real enquanto você digita.",
  prof_af_title:    "Rede de segurança de preenchimento automático",
  prof_af_label:    "Preencher meus palpites automaticamente",
  prof_af_desc:     "Enviar uma pontuação de reserva antes do bloqueio",
  prof_af_home:     "Pontuação padrão do time da casa",
  prof_af_away:     "Pontuação padrão do time visitante",
  prof_err_size:    "A foto deve ter menos de 2 MB",
  prof_err_auth:    "Não conectado. Atualize a página.",
  prof_loading:     "Carregando perfil...",
  prof_upload_info: "Envie uma foto. Máx. 2 MB, JPG ou PNG.",
  prof_uploading:   "Enviando...",
  prof_choose:      "Escolher foto",
  prof_remove:      "Remover foto",
  prof_saving:      "Salvando...",
  prof_saved:       "Perfil salvo!",
  auth_signup_join:      "Criar conta & Entrar",
  auth_signin_instead:   "Já tem conta? Entrar",
  auth_welcome_back:     "Bem-vindo de volta",
  auth_signin_sub:       "Insira suas credenciais para continuar.",
  auth_forgot:           "Esqueceu?",
  auth_signing_in:       "Entrando...",
  auth_no_account:       "Não tem conta?",
  auth_create_free:      "Crie uma gratuitamente",
  auth_subtitle:         "Rápido — leva 30 segundos.",
  auth_continue_email:   "ou continuar com e-mail",
  auth_ph_email:         "voce@exemplo.com",
  auth_ph_password:      "Mín. 8 caracteres",
  auth_err_password:     "A senha deve ter pelo menos 8 caracteres",
  auth_pick_team:        "Escolha seu time",
  auth_pick_team_sub:    "As cores do seu time se tornam o tema do app.",
  auth_skip:             "Pular por agora",
  auth_creating:         "Criando...",
  auth_check_body:       "Enviamos um link de confirmação para {email}.",
  auth_confirmed:        "Já confirmou?",
  auth_signin_here:      "Entre aqui",
  grp_compete:      "Entre em um grupo para competir",
  grp_create_or:    "Crie sua liga ou entre em uma com senha.",
  grp_join_pk:      "Entrar com senha",
  grp_your:         "Seus grupos",
  grp_none:         "Ainda sem grupos",
  grp_none_sub:     "Crie um grupo ou entre em um.",
  grp_invited_to:   "Você foi convidado para entrar em",
  grp_complete_step:"Complete o último passo para entrar no grupo.",
  common_new_group:    "Novo grupo",
  common_view_group:   "Ver grupo",
  common_create_group: "Criar grupo",
  common_sign_in:      "Entrar",
  lb_no_group:   "Ainda sem grupo",
  lb_no_group_b: "Entre ou crie um grupo para ver a classificação.",
  lb_find:       "Encontrar grupo",
  st_title:      "Classificações de grupo",
  st_info:       "12 grupos · Atualizado após cada partida",
  br_title:      "Chaveamento",
  br_info:       "Times confirmados após a fase de grupos em 29 de junho.",
  auth_ph_name:          "Como seus amigos vão te ver",

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

  dash_title:        "לוח בקרה",
  dash_welcome:      "ברוך הבא",
  dash_nextMatch:    "המשחק הבא",
  dash_guest_banner: "אתה גולש כאורח. עדיין לא צריך חשבון.",
  dash_guest_sub:    "שמור ניחושים, צור קבוצה או הצטרף לאחת.",
  dash_create_group: "יצירת קבוצה",
  dash_sign_in:      "כניסה",

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

  grp_delete:      "מחיקת קבוצה",
  grp_del_title:   "למחוק את הקבוצה?",
  grp_del_undo:    "לא ניתן לבטל פעולה זו",
  grp_deleting:    "…מוחק",
  grp_del_body:    "{name} וכל הנתונים יימחקו לצמיתות.",
  grp_back:        "הקבוצות שלי ←",
  grp_prize_pot:   "סכום הפרסים",
  grp_adfree:      "ללא פרסומות",
  grp_prize_split: "חלוקת פרסים",
  grp_scoring:     "כללי ניקוד",
  grp_locks:       "נועל ב-11 ביוני",
  grp_no_members:  "אין עדיין חברים.",

  sc_outcome:  "תוצאה נכונה",
  sc_exact:    "תוצאה מדויקת",
  sc_ko:       "התקדמות בנוקאאוט",
  sc_winner:   "אלוף הטורניר",
  sc_scorer:   "מלך השערים",
  sc_assister: "מלך הבישולים",
  sc_golden:   "כדור הזהב",
  sc_defence:  "הגנה הטובה ביותר",
  sc_young:    "שחקן צעיר הטוב ביותר",
  sc_third:    "מקום שלישי (כל אחד)",

  pred_lock_notice:    "משחקים ננעלים 5 דקות לפני הקיקאוף",
  pred_predicting_for: "מנחש עבור",
  pred_grp_subtitle:   "36 משחקים · תוצאות וטבלאות",
  pred_trn_subtitle:   "אלוף, מלך שערים, הגנה ועוד",
  pred_active:         "פעיל",
  pred_autosave_hint:  "נשמר אוטומטית · ננעל 5 דקות לפני הקיקאוף",
  pred_saving:         "…שומר",
  pred_failed:         "נכשל",
  pred_locks_hm:       "ננעל בעוד {h}ש {m}ד",
  pred_locks_m:        "ננעל בעוד {m}ד",
  pred_qual_hint:      "השלם את כל הבתים לתמונה המלאה",
  pred_grp_winners:    "מנצחי הבתים",
  pred_runners_up:     "מקום שני",
  pred_best_third:     "8 הטובים ממקום שלישי",
  pred_pred_table:     "טבלת ניחושים",
  pred_top2:           "2 הראשונים מתקדמים",
  pred_third_may:      "3 — עשוי להתקדם",

  common_dashboard:   "לוח בקרה",
  common_admin_panel: "פאנל ניהול",

  adm_payments:     "תשלומי חברים",
  adm_payout_split: "חלוקת פרסים",
  adm_save_payouts: "שמירת החלוקה",
  adm_saved:        "!נשמר",
  adm_payout_err:   "חייב להסתכם ב-100% בדיוק",
  adm_invite:       "קישור הזמנה",
  adm_copy:         "העתקת קישור",
  adm_copied:       "!הועתק",
  adm_new_code:     "קוד חדש",
  adm_invite_hint:  "שתפו את הקישור — כל אחד יכול להצטרף.",
  adm_danger:       "אזור מסוכן",
  adm_danger_warn:  "מחיקה קבועה של הקבוצה. לא ניתן לבטל.",
  adm_del_body:     "כל החברים, הניחושים והודעות הצ'אט יימחקו לצמיתות.",

  prof_my_profile:  "הפרופיל שלי",
  prof_regenerate:  "יצירה מחדש",
  prof_no_country:  "ללא מדינה",
  prof_auto_desc:   "נוצר אוטומטית · ייחודי לשמך",
  prof_preset_desc: "אווטאר תפקיד כדורגל",
  prof_photo_desc:  "התמונה שהעלת",
  prof_auto_exp:    "האווטאר שלך נוצר אוטומטית מהשם שלך.",
  prof_use_auto:    "השתמש באווטאר זה",
  prof_pick_role:   "בחר את תפקידך במגרש:",
  prof_name_hint:   "האווטאר מתעדכן בזמן אמת בזמן הקלדה.",
  prof_af_title:    "רשת בטיחות למילוי אוטומטי",
  prof_af_label:    "מלא את הניחושים שלי אוטומטית",
  prof_af_desc:     "שלח תוצאת גיבוי לפני נעילת החיזוי",
  prof_af_home:     "תוצאת ברירת מחדל לבית",
  prof_af_away:     "תוצאת ברירת מחדל לאורח",
  prof_err_size:    "התמונה חייבת להיות מתחת ל-2 מגה",
  prof_err_auth:    "אינך מחובר. אנא רענן את הדף.",
  prof_loading:     "טוען פרופיל...",
  prof_upload_info: "העלה תמונה. מקסימום 2 מגה, JPG או PNG.",
  prof_uploading:   "מעלה...",
  prof_choose:      "בחר תמונה",
  prof_remove:      "הסר תמונה",
  prof_saving:      "שומר...",
  prof_saved:       "הפרופיל נשמר!",
  auth_signup_join:      "צור חשבון והצטרף",
  auth_signin_instead:   "כבר יש לך חשבון? היכנס",
  auth_welcome_back:     "ברוך שובך",
  auth_signin_sub:       "הזן את פרטי הכניסה שלך להמשך.",
  auth_forgot:           "שכחת?",
  auth_signing_in:       "מתחבר...",
  auth_no_account:       "אין לך חשבון?",
  auth_create_free:      "צור אחד בחינם",
  auth_subtitle:         "מהיר — לוקח 30 שניות.",
  auth_continue_email:   "או להמשיך עם אימייל",
  auth_ph_email:         "אתה@דוגמה.com",
  auth_ph_password:      "מינימום 8 תווים",
  auth_err_password:     "הסיסמה חייבת להכיל לפחות 8 תווים",
  auth_pick_team:        "בחר את הנבחרת שלך",
  auth_pick_team_sub:    "צבעי הנבחרת שלך יהפכו לנושא האפליקציה.",
  auth_skip:             "דלג לעכשיו",
  auth_creating:         "יוצר...",
  auth_check_body:       "שלחנו קישור אישור ל-{email}.",
  auth_confirmed:        "כבר אישרת?",
  auth_signin_here:      "היכנס כאן",
  grp_compete:      "הצטרף לקבוצה כדי להתחרות",
  grp_create_or:    "צור ליגה משלך או הצטרף לאחת עם קוד גישה.",
  grp_join_pk:      "הצטרפות עם קוד",
  grp_your:         "הקבוצות שלך",
  grp_none:         "עדיין אין קבוצות",
  grp_none_sub:     "צור קבוצה או הצטרף לאחת.",
  grp_invited_to:   "הוזמנת להצטרף ל",
  grp_complete_step:"השלם את השלב האחרון כדי להצטרף לקבוצה.",
  common_new_group:    "קבוצה חדשה",
  common_view_group:   "צפייה בקבוצה",
  common_create_group: "יצירת קבוצה",
  common_sign_in:      "כניסה",
  lb_no_group:   "עדיין אין קבוצה",
  lb_no_group_b: "הצטרף או צור קבוצה כדי לראות את הדירוג.",
  lb_find:       "מצא קבוצה",
  st_title:      "טבלאות הבתים",
  st_info:       "12 בתים · מתעדכן לאחר כל משחק",
  br_title:      "שלב הנוקאאוט",
  br_info:       "קבוצות מאושרות לאחר שלב הבתים ב-29 ביוני.",
  auth_ph_name:          "כך חבריך יראו אותך",

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

  dash_title:        "لوحة القيادة",
  dash_welcome:      "مرحباً",
  dash_nextMatch:    "المباراة القادمة",
  dash_guest_banner: "أنت تستكشف كضيف. لا حاجة لحساب بعد.",
  dash_guest_sub:    "احفظ التنبؤات أو أنشئ مجموعة أو انضم إليها.",
  dash_create_group: "إنشاء مجموعة",
  dash_sign_in:      "تسجيل الدخول",

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

  grp_delete:      "حذف المجموعة",
  grp_del_title:   "حذف المجموعة؟",
  grp_del_undo:    "لا يمكن التراجع عن هذا الإجراء",
  grp_deleting:    "…جارٍ الحذف",
  grp_del_body:    "{name} وجميع البيانات ستُحذف نهائياً.",
  grp_back:        "مجموعاتي ←",
  grp_prize_pot:   "الجائزة الكلية",
  grp_adfree:      "بدون إعلانات",
  grp_prize_split: "توزيع الجوائز",
  grp_scoring:     "قواعد التسجيل",
  grp_locks:       "يُغلق في 11 يونيو",
  grp_no_members:  "لا أعضاء بعد.",

  sc_outcome:  "النتيجة الصحيحة",
  sc_exact:    "النتيجة الدقيقة",
  sc_ko:       "التقدم في الإقصاء",
  sc_winner:   "بطل البطولة",
  sc_scorer:   "الهداف",
  sc_assister: "صانع الأهداف",
  sc_golden:   "الكرة الذهبية",
  sc_defence:  "أفضل دفاع",
  sc_young:    "أفضل لاعب شاب",
  sc_third:    "المركز الثالث (كل)",

  pred_lock_notice:    "تُغلق المباريات قبل 5 دقائق من الانطلاق",
  pred_predicting_for: "تتوقع لـ",
  pred_grp_subtitle:   "36 مباراة · النتائج والجداول",
  pred_trn_subtitle:   "البطل، الهداف، الدفاع والمزيد",
  pred_active:         "نشط",
  pred_autosave_hint:  "حفظ تلقائي · يُغلق كل مباراة قبل 5 دقائق",
  pred_saving:         "…جارٍ الحفظ",
  pred_failed:         "فشل",
  pred_locks_hm:       "يُغلق في {h}س {m}د",
  pred_locks_m:        "يُغلق في {m}د",
  pred_qual_hint:      "أكمل جميع المجموعات للصورة الكاملة",
  pred_grp_winners:    "الفائزون بالمجموعات",
  pred_runners_up:     "المركز الثاني",
  pred_best_third:     "أفضل 8 فرق ثالثة",
  pred_pred_table:     "الجدول المتوقع",
  pred_top2:           "أفضل 2 يتأهلان",
  pred_third_may:      "3 — قد يتأهل",

  common_dashboard:   "لوحة القيادة",
  common_admin_panel: "لوحة الإدارة",

  adm_payments:     "مدفوعات الأعضاء",
  adm_payout_split: "توزيع الجوائز",
  adm_save_payouts: "حفظ التوزيع",
  adm_saved:        "!تم الحفظ",
  adm_payout_err:   "يجب أن يساوي 100% بالضبط",
  adm_invite:       "رابط الدعوة",
  adm_copy:         "نسخ الرابط",
  adm_copied:       "!تم النسخ",
  adm_new_code:     "رمز جديد",
  adm_invite_hint:  "شارك هذا الرابط — يمكن لأي شخص الانضمام.",
  adm_danger:       "منطقة الخطر",
  adm_danger_warn:  "حذف هذه المجموعة نهائياً. لا يمكن التراجع.",
  adm_del_body:     "سيتم حذف جميع الأعضاء والتوقعات وسجل الدردشة نهائياً.",

  prof_my_profile:  "ملفي الشخصي",
  prof_regenerate:  "إعادة توليد",
  prof_no_country:  "بلا دولة",
  prof_auto_desc:   "تلقائي · فريد لاسمك",
  prof_preset_desc: "صورة رمزية لدور كرة القدم",
  prof_photo_desc:  "صورتك المرفوعة",
  prof_auto_exp:    "يتم توليد صورتك الرمزية تلقائياً من اسمك.",
  prof_use_auto:    "استخدام هذه الصورة الرمزية",
  prof_pick_role:   "اختر دورك في الملعب:",
  prof_name_hint:   "تتحدث الصورة الرمزية في الوقت الفعلي أثناء الكتابة.",
  prof_af_title:    "شبكة أمان التعبئة التلقائية",
  prof_af_label:    "تعبئة توقعاتي تلقائياً",
  prof_af_desc:     "إرسال نتيجة احتياطية قبل قفل التوقع",
  prof_af_home:     "النتيجة الافتراضية للفريق المحلي",
  prof_af_away:     "النتيجة الافتراضية للفريق الزائر",
  prof_err_size:    "يجب أن تكون الصورة أقل من 2 ميغابايت",
  prof_err_auth:    "لست مسجلاً. يرجى تحديث الصفحة.",
  prof_loading:     "تحميل الملف الشخصي...",
  prof_upload_info: "ارفع صورة. الحد الأقصى 2 ميغابايت، JPG أو PNG.",
  prof_uploading:   "جارٍ الرفع...",
  prof_choose:      "اختيار صورة",
  prof_remove:      "إزالة الصورة",
  prof_saving:      "جارٍ الحفظ...",
  prof_saved:       "!تم حفظ الملف الشخصي",
  auth_signup_join:      "إنشاء حساب والانضمام",
  auth_signin_instead:   "هل لديك حساب؟ سجّل الدخول",
  auth_welcome_back:     "مرحباً بعودتك",
  auth_signin_sub:       "أدخل بيانات الدخول للمتابعة.",
  auth_forgot:           "نسيت؟",
  auth_signing_in:       "جارٍ تسجيل الدخول...",
  auth_no_account:       "ليس لديك حساب؟",
  auth_create_free:      "أنشئ حساباً مجاناً",
  auth_subtitle:         "سريع — يستغرق 30 ثانية.",
  auth_continue_email:   "أو المتابعة بالبريد الإلكتروني",
  auth_ph_email:         "you@example.com",
  auth_ph_password:      "8 أحرف على الأقل",
  auth_err_password:     "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل",
  auth_pick_team:        "اختر فريقك",
  auth_pick_team_sub:    "ستصبح ألوان فريقك موضوع التطبيق.",
  auth_skip:             "تخطي الآن",
  auth_creating:         "جارٍ الإنشاء...",
  auth_check_body:       "أرسلنا رابط تأكيد إلى {email}.",
  auth_confirmed:        "هل أكدت بالفعل؟",
  auth_signin_here:      "سجّل الدخول هنا",
  grp_compete:      "انضم إلى مجموعة للمنافسة",
  grp_create_or:    "أنشئ دوريك الخاص أو انضم بكلمة مرور.",
  grp_join_pk:      "الانضمام بكلمة مرور",
  grp_your:         "مجموعاتك",
  grp_none:         "لا توجد مجموعات بعد",
  grp_none_sub:     "أنشئ مجموعة أو انضم إلى إحداها.",
  grp_invited_to:   "لقد دُعيت للانضمام إلى",
  grp_complete_step:"أكمل الخطوة الأخيرة للانضمام إلى المجموعة.",
  common_new_group:    "مجموعة جديدة",
  common_view_group:   "عرض المجموعة",
  common_create_group: "إنشاء مجموعة",
  common_sign_in:      "تسجيل الدخول",
  lb_no_group:   "لا توجد مجموعة بعد",
  lb_no_group_b: "انضم أو أنشئ مجموعة لرؤية لوحة المتصدرين.",
  lb_find:       "البحث عن مجموعة",
  st_title:      "ترتيب المجموعات",
  st_info:       "12 مجموعة · يُحدَّث بعد كل مباراة",
  br_title:      "دور الإقصاء",
  br_info:       "الفرق مؤكدة بعد انتهاء دور المجموعات في 29 يونيو.",
  auth_ph_name:          "كيف سيراك أصدقاؤك",

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

// ── Template string interpolation ────────────────────────────────────────────
export function interpolate(str: string, vars: Record<string, string | number>): string {
  return str.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`));
}
