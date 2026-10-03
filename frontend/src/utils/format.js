// "MONDAY" -> "Monday"
export function formatDay(day) {
  return day[0] + day.slice(1).toLowerCase();
}

// "16:00:00" saha "18:00:00" -> "16:00 – 18:00"
export function formatTimeRange(c) {
  return `${c.startTime.slice(0, 5)} – ${c.endTime.slice(0, 5)}`;
}

// 5000 -> "LKR 5,000"
export function formatLKR(amount) {
  return `LKR ${amount.toLocaleString()}`;
}

// "Kasun Perera" -> "KP"
export function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}
