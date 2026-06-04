import { useAuth } from "@/components/auth/auth-provider";

export const formatDateTime = (date: Date) => {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function formatMillisecondsToDays(ms: number): string {
  if (!ms || ms === 0) return "0";
  const days = Math.round(ms / (1000 * 60 * 60 * 24));
  return days.toString();
}

export const isAdmin = () => {
  const { user } = useAuth();
  return user?.role === "owner";
};
