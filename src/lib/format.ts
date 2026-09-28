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

/* Mask an email for public display, keeping the first and last character of
   each part: n********9@g**l.com */
export function maskEmail(email: string): string {
  const value = (email || "").trim();
  const at = value.lastIndexOf("@");
  if (at <= 0) return value;

  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  const dot = domain.lastIndexOf(".");
  const name = dot > 0 ? domain.slice(0, dot) : domain;
  const tld = dot > 0 ? domain.slice(dot) : "";

  const maskPart = (part: string): string => {
    if (part.length <= 1) return part;
    if (part.length === 2) return `${part[0]}*`;
    const stars = Math.min(Math.max(part.length - 2, 3), 8);
    return `${part[0]}${"*".repeat(stars)}${part[part.length - 1]}`;
  };

  return `${maskPart(local)}@${maskPart(name)}${tld}`;
}
