import { colorWithOpacity } from "./color";

type ShadowStyle = {
  shadowColor?: string;
  shadowOpacity?: number;
  shadowOffset?: { width?: number; height?: number } | null;
  shadowRadius?: number;
};

function formatPixel(value: number | undefined) {
  const numeric = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return `${numeric}px`;
}

export function shadowStyleToBoxShadow(style: ShadowStyle) {
  if (!style) {
    return null;
  }

  const { shadowColor, shadowOpacity = 1, shadowOffset, shadowRadius = 0 } = style;
  const resolvedColor = colorWithOpacity(shadowColor ?? "#000", shadowOpacity);
  if (!resolvedColor) {
    return null;
  }

  const offsetX = formatPixel(shadowOffset?.width);
  const offsetY = formatPixel(shadowOffset?.height);
  const blur = formatPixel(shadowRadius);

  return `${offsetX} ${offsetY} ${blur} ${resolvedColor}`;
}
