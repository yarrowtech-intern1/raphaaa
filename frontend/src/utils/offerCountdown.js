export const formatCountdown = (targetDate, now = Date.now()) => {
  if (!targetDate) return "";
  const target = new Date(targetDate).getTime();
  const diff = target - now;
  if (!Number.isFinite(diff) || diff <= 0) return "0m";

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${days}:${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export const isSaleLive = (offer) => String(offer?.status || "").toLowerCase() === "live";
export const isSaleUpcoming = (offer) => String(offer?.status || "").toLowerCase() === "upcoming";
