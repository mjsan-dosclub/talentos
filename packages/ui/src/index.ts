// UI Tokens & Primitive Theme Constants for DOS Club TalentOS
export const THEME_CONSTANTS = {
  canvasBackground: "#FBFBFB",
  cardBackground: "#FFFFFF",
  borderColor: "#E5E5E5",
  neutralDark: "#0A0A0A",
  neutralMuted: "#737373",
} as const;

export const STATUS_COLORS = {
  completed: {
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-300",
  },
  checkedIn: {
    text: "text-sky-700",
    bg: "bg-sky-50",
    border: "border-sky-300",
  },
  late: {
    text: "text-amber-800",
    bg: "bg-amber-50",
    border: "border-amber-300",
  },
  excused: {
    text: "text-purple-800",
    bg: "bg-purple-50",
    border: "border-purple-300",
  },
  registered: {
    text: "text-neutral-500",
    bg: "bg-neutral-100",
    border: "border-neutral-200",
  },
} as const;
