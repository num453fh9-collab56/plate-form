export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function stars(rating: number): string {
  const rounded = Math.max(0, Math.min(5, Math.round(rating)));
  return "★".repeat(rounded) + "☆".repeat(5 - rounded);
}

export function formatPrice(price: number): string {
  return (Number(price) || 0).toLocaleString("en-US");
}

export function firstName(name: string): string {
  return name.split(" ")[0] ?? name;
}
