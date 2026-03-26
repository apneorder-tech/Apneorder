import { 
  Clock, 
  ChefHat, 
  Check, 
  XCircle, 
  AlertCircle,
  LayoutDashboard,
  UtensilsCrossed,
  BarChart3,
  Settings,
  QrCode,
  Sparkles
} from "lucide-react";

export const ORDER_STATUS_CONFIG = {
  payment_pending: {
    label: "Verifying",
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-200",
    dot: "bg-purple-500",
  },
  pending: {
    label: "New Order",
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  preparing: {
    label: "In Kitchen",
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  ready: {
    label: "Ready",
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
    dot: "bg-green-500",
  },
  completed: {
    label: "Served",
    bg: "bg-zinc-100",
    text: "text-zinc-600",
    border: "border-zinc-200",
    dot: "bg-zinc-400",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
  },
} as const;

export const NAV_ITEMS = [
  {
    id: "orders",
    label: "Orders",
    icon: Clock,
  },
  {
    id: "menu",
    label: "Menu",
    icon: UtensilsCrossed,
  },
  {
    id: "tables",
    label: "Tables",
    icon: QrCode,
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
  },
  {
    id: "plans",
    label: "Plans",
    icon: Sparkles,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
  },
] as const;
