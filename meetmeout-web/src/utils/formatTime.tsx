export default function formatTime(dateStr: string): string {

  const safeDateStr = dateStr.split('.')[0];

  const date = new Date(safeDateStr);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;

  if (isNaN(date.getTime())) return "Invalid date";

  if (diff < 60) return `${Math.floor(diff)} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;

  return date.toLocaleString("tr-TR", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
