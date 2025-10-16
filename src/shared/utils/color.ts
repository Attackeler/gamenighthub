const FALLBACK_COLOR = "rgba(0, 0, 0, 1)";

function clampAlpha(value: number) {
  if (Number.isNaN(value)) {
    return 1;
  }
  return Math.min(Math.max(value, 0), 1);
}

function normalizeHex(hex: string) {
  const normalized = hex.replace("#", "").trim();
  if (!normalized) {
    return "";
  }

  if (normalized.length === 3 || normalized.length === 4) {
    return normalized
      .split("")
      .map((char) => char + char)
      .join("");
  }

  return normalized;
}

function hexComponents(hex: string): [number, number, number, number] | null {
  const normalized = normalizeHex(hex);
  if (!normalized) {
    return null;
  }

  const base = normalized.slice(0, 6);
  const alphaSegment = normalized.length >= 8 ? normalized.slice(6, 8) : "";
  const numeric = parseInt(base, 16);

  if (Number.isNaN(numeric)) {
    return null;
  }

  const r = (numeric >> 16) & 255;
  const g = (numeric >> 8) & 255;
  const b = numeric & 255;
  const a = alphaSegment ? parseInt(alphaSegment, 16) / 255 : 1;

  return [r, g, b, clampAlpha(a)];
}

function parseRgbString(color: string): [number, number, number, number] | null {
  const match = color.trim().match(/^rgba?\(([^)]+)\)$/i);
  if (!match) {
    return null;
  }

  const parts = match[1]
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < 3) {
    return null;
  }

  const r = Number(parts[0]);
  const g = Number(parts[1]);
  const b = Number(parts[2]);
  const a = parts.length > 3 ? Number(parts[3]) : 1;

  if ([r, g, b].some((channel) => Number.isNaN(channel))) {
    return null;
  }

  return [r, g, b, clampAlpha(a)];
}

export function hexToRgba(color: string, alpha: number) {
  const components = hexComponents(color);
  if (!components) {
    return `rgba(0, 0, 0, ${clampAlpha(alpha)})`;
  }

  const [r, g, b, existingAlpha] = components;
  const combinedAlpha = clampAlpha(existingAlpha * clampAlpha(alpha));

  return `rgba(${r}, ${g}, ${b}, ${combinedAlpha})`;
}

export function colorWithOpacity(color: string, opacity: number) {
  if (!color) {
    return null;
  }

  const trimmed = color.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.toLowerCase() === "transparent") {
    return "rgba(0, 0, 0, 0)";
  }

  if (trimmed.startsWith("#")) {
    return hexToRgba(trimmed, opacity);
  }

  const rgb = parseRgbString(trimmed);
  if (rgb) {
    const [r, g, b, existingAlpha] = rgb;
    const combinedAlpha = clampAlpha(existingAlpha * clampAlpha(opacity));
    return `rgba(${r}, ${g}, ${b}, ${combinedAlpha})`;
  }

  // Fall back to letting the browser parse the color and opacity via CSS variables.
  // This will at least preserve the provided color token.
  return trimmed;
}
