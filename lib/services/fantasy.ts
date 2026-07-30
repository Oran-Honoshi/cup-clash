// Fantasy League Phase 2 — shared types + pure formation/budget logic for
// the squad builder and transfer flow. Mirrors migration 076's v1 ruleset,
// which is fixed app-wide (not per-league configurable, see the migration's
// header comment) — so these constants live here as code, not DB columns.

export type FantasyPosition = "GK" | "DEF" | "MID" | "FWD";

export interface FantasyLeague {
  id: string;
  name: string;
  adminId: string;
  competitionId: string;
  isPublic: boolean;
  passkey: string;
  maxMembers: number;
}

export interface FantasyPlayerRow {
  id: string;
  competitionId: string;
  apiPlayerId: number;
  apiTeamId: number;
  fullName: string;
  teamName: string;
  position: FantasyPosition;
  photo: string | null;
  creditCost: number;
}

export interface FantasySquad {
  id: string;
  fantasyLeagueId: string;
  userId: string;
  budgetRemaining: number;
  freeTransfersBanked: number;
}

export interface FantasySquadPlayerRow {
  id: string;
  fantasySquadId: string;
  fantasyPlayerId: string;
  addedAt: string;
  removedAt: string | null;
}

// ── v1 ruleset constants (confirmed, see migration 076) ─────────────────────

export const SQUAD_BUDGET_CREDITS = 100;
export const SQUAD_SIZE = 11;

// Bounds mirror check_fantasy_squad_composition() exactly (migration 076,
// section 4) — client-side re-statement of the trigger's real logic, kept
// here so it can't silently drift, not a replacement for the trigger, which
// stays the source of truth at COMMIT time.
export const POSITION_BOUNDS: Record<FantasyPosition, { min: number; max: number }> = {
  GK:  { min: 1, max: 1 },
  DEF: { min: 3, max: 5 },
  MID: { min: 2, max: 5 },
  FWD: { min: 1, max: 3 },
};

export const POSITION_ORDER: FantasyPosition[] = ["GK", "DEF", "MID", "FWD"];

// ── Mapping ───────────────────────────────────────────────────────────────

export function mapFantasyPlayerRow(d: {
  id: string; competition_id: string; api_player_id: number; api_team_id: number;
  full_name: string; team_name: string; position: string; photo: string | null; credit_cost: number;
}): FantasyPlayerRow {
  return {
    id: d.id,
    competitionId: d.competition_id,
    apiPlayerId: d.api_player_id,
    apiTeamId: d.api_team_id,
    fullName: d.full_name,
    teamName: d.team_name,
    position: d.position as FantasyPosition,
    photo: d.photo,
    creditCost: Number(d.credit_cost),
  };
}

// ── Formation / budget math ──────────────────────────────────────────────

export function tallyByPosition(selected: FantasyPlayerRow[]): Record<FantasyPosition, number> {
  const tally: Record<FantasyPosition, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  for (const p of selected) tally[p.position] += 1;
  return tally;
}

export function totalCreditsSpent(selected: FantasyPlayerRow[]): number {
  return selected.reduce((sum, p) => sum + p.creditCost, 0);
}

export function budgetRemaining(selected: FantasyPlayerRow[]): number {
  return SQUAD_BUDGET_CREDITS - totalCreditsSpent(selected);
}

// Hard ceilings apply always, even mid-build — matches the trigger's
// unconditional "v_gk > 1 or v_def > 5 or ..." check.
export function exceedsCeilings(selected: FantasyPlayerRow[]): boolean {
  const tally = tallyByPosition(selected);
  return (
    tally.GK > POSITION_BOUNDS.GK.max ||
    tally.DEF > POSITION_BOUNDS.DEF.max ||
    tally.MID > POSITION_BOUNDS.MID.max ||
    tally.FWD > POSITION_BOUNDS.FWD.max ||
    selected.length > SQUAD_SIZE
  );
}

// Full validity — only meaningful once the squad is complete (11/11),
// matching the trigger's "v_total = 11 and (...)" branch.
export function isSquadValid(selected: FantasyPlayerRow[]): boolean {
  if (selected.length !== SQUAD_SIZE) return false;
  const tally = tallyByPosition(selected);
  return (
    tally.GK === POSITION_BOUNDS.GK.max &&
    tally.DEF >= POSITION_BOUNDS.DEF.min && tally.DEF <= POSITION_BOUNDS.DEF.max &&
    tally.MID >= POSITION_BOUNDS.MID.min && tally.MID <= POSITION_BOUNDS.MID.max &&
    tally.FWD >= POSITION_BOUNDS.FWD.min && tally.FWD <= POSITION_BOUNDS.FWD.max &&
    budgetRemaining(selected) >= 0
  );
}

// Whether `candidate` can be added to `selected` without breaking a hard
// ceiling or the budget — used to disable-not-hide picker rows.
export function canAddPlayer(selected: FantasyPlayerRow[], candidate: FantasyPlayerRow): boolean {
  if (selected.some(p => p.id === candidate.id)) return false;
  if (selected.length >= SQUAD_SIZE) return false;
  const tally = tallyByPosition(selected);
  if (tally[candidate.position] >= POSITION_BOUNDS[candidate.position].max) return false;
  if (candidate.creditCost > budgetRemaining(selected)) return false;
  return true;
}
