// ==============================
// AI Boardroom — Agent Configuration
// ==============================

export interface AgentPersona {
  id: string;
  name: string;
  title: string;
  avatarUrl: string;
  badgeIcon: string; // lucide-react icon name
  badgeColor: string;
  role: string;
  color: string;
  bgColor: string;
}

export const AGENT_PERSONAS: Record<string, AgentPersona> = {
  cro: {
    id: "cro",
    name: "Sarah Chen",
    title: "Chief Risk Officer",
    avatarUrl: "https://api.dicebear.com/9.x/personas/svg?seed=sarah-chen&backgroundColor=b6e3f4",
    badgeIcon: "Shield",
    badgeColor: "#2563EB",
    role: "Chief Risk Officer",
    color: "#DC2626",
    bgColor: "rgba(220,38,38,0.12)",
  },
  trader: {
    id: "trader",
    name: "Marcus Webb",
    title: "Head of Trading",
    avatarUrl: "https://api.dicebear.com/9.x/personas/svg?seed=marcus-webb&backgroundColor=d1d4f9",
    badgeIcon: "TrendingUp",
    badgeColor: "#16A34A",
    role: "Head of Trading",
    color: "#16A34A",
    bgColor: "rgba(22,163,74,0.12)",
  },
  economist: {
    id: "economist",
    name: "Dr. Elena Vogt",
    title: "Chief Economist",
    avatarUrl: "https://api.dicebear.com/9.x/personas/svg?seed=elena-vogt&backgroundColor=c0aede",
    badgeIcon: "User",
    badgeColor: "#7C3AED",
    role: "Chief Economist",
    color: "#2563EB",
    bgColor: "rgba(37,99,235,0.12)",
  },
  compliance: {
    id: "compliance",
    name: "James Okonkwo",
    title: "Compliance Officer",
    avatarUrl: "https://api.dicebear.com/9.x/personas/svg?seed=james-okonkwo&backgroundColor=ffd5dc",
    badgeIcon: "ShieldCheck",
    badgeColor: "#F59E0B",
    role: "Compliance Officer",
    color: "#7C3AED",
    bgColor: "rgba(124,58,237,0.12)",
  },
  devils_advocate: {
    id: "devils_advocate",
    name: "Alex Morozov",
    title: "Devil's Advocate",
    avatarUrl: "https://api.dicebear.com/9.x/personas/svg?seed=alex-morozov&backgroundColor=c0aede",
    badgeIcon: "AlertTriangle",
    badgeColor: "#DC2626",
    role: "Devil's Advocate",
    color: "#4B5563",
    bgColor: "rgba(75,85,99,0.12)",
  },
  chair: {
    id: "chair",
    name: "Dr. Henri Dubois",
    title: "Committee Chair",
    avatarUrl: "https://api.dicebear.com/9.x/personas/svg?seed=henri-dubois&backgroundColor=b6e3f4",
    badgeIcon: "Gavel",
    badgeColor: "#0018A8",
    role: "Committee Chair",
    color: "#0018A8",
    bgColor: "rgba(0,24,168,0.12)",
  },
};

export const AGENT_ORDER = ["cro", "trader", "economist", "compliance", "devils_advocate", "chair"] as const;
export type AgentId = (typeof AGENT_ORDER)[number];
