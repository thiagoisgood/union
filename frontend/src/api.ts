export type Club = {
  name: string;
  en_name: string;
  short_name: string;
  founded: string;
  city: string;
  colors: string;
  motto: string;
  membership_since: string;
  stadium: string;
  capacity: number;
  market_value: string;
  members: number;
  former_names: string;
  summary: string;
};

export type Season = {
  year: number;
  competition: string;
  rank: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  points: number;
  home_venue: string;
  highlight: string;
};

export type Milestone = {
  date: string;
  title: string;
  description: string;
  category: string;
  source_key: string;
};

export type Coach = {
  name: string;
  role: string;
  nationality: string;
  start_date: string;
  end_date: string;
  career: string;
  record: string;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  photo: string;
  note: string;
};

export type ClubRecord = {
  key: string;
  title: string;
  holder: string;
  value: string;
  unit: string;
  detail: string;
  scope: string;
  source_key: string;
};

export type Player = {
  season_year: number;
  name: string;
  number: number | null;
  position: string;
  nationality: string;
  birth_date: string;
  hometown: string;
  height: number | null;
  weight: number | null;
  foot: string;
  u21: boolean;
  photo: string;
  appearances: number;
  starts: number;
  minutes: number;
  cup_apps: number;
  cup_starts: number;
  cup_partial: boolean;
  goals: number;
  assists: number;
  captain: boolean;
  note: string;
};

export type Transfer = {
  season_year: number;
  date: string;
  player_name: string;
  direction: string;
  kind: string;
  club: string;
  fee: string;
  source_key: string;
  note: string;
};

export type Match = {
  season_year: number;
  competition: string;
  round: number | null;
  date: string;
  is_home: boolean;
  opponent: string;
  goals_for: number | null;
  goals_against: number | null;
  venue: string;
  attendance: number | null;
  result: string;
  scorers: string;
  is_key: boolean;
  note: string;
};

export type Venue = {
  name: string;
  city: string;
  capacity: number;
  opened: string;
  years: string;
  note: string;
};

export type FanEvent = {
  date: string;
  name: string;
  location: string;
  attendance: number | null;
  description: string;
  source_key: string;
};

export type Source = {
  key: string;
  title: string;
  publisher: string;
  url: string;
  published_at: string;
  note: string;
};

export type ProgressItem = {
  loop_index: number;
  phase: string;
  title: string;
  status: string;
  completed_at: string;
  detail: string;
};

export type AuditCheck = {
  key: string;
  label: string;
  status: "pass" | "warn";
  detail: string;
};

export type Audit = {
  checked_at: string;
  source_count: number;
  reference_count: number;
  missing_references: string[];
  match_count: number;
  unknown_matches: {
    date: string;
    season_year: number;
    opponent: string;
    round: number | null;
  }[];
  checks: AuditCheck[];
};

export type Overview = {
  club: Club | null;
  seasons: Season[];
  latest_season: Season | null;
  recent_milestones: Milestone[];
  recent_coaches: Coach[];
  stats: {
    milestones: number;
    players: number;
    matches: number;
    sources: number;
  };
};

const BASE = "/api";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error(`请求失败：${res.status}`);
  return (await res.json()) as T;
}

export const api = {
  overview: () => get<Overview>("/overview"),
  milestones: () => get<Milestone[]>("/milestones"),
  seasons: () => get<Season[]>("/seasons"),
  coaches: () => get<Coach[]>("/coaches"),
  records: () => get<ClubRecord[]>("/records"),
  players: (season?: number) => get<Player[]>(`/players${season ? `?season=${season}` : ""}`),
  transfers: (season?: number) =>
    get<Transfer[]>(`/transfers${season ? `?season=${season}` : ""}`),
  matches: (season?: number) => get<Match[]>(`/matches${season ? `?season=${season}` : ""}`),
  venues: () => get<Venue[]>("/venues"),
  fanEvents: () => get<FanEvent[]>("/fan-events"),
  sources: () => get<Source[]>("/sources"),
  progress: () => get<ProgressItem[]>("/progress"),
  audit: () => get<Audit>("/audit"),
};
