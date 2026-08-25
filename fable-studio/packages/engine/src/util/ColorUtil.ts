// Color utilities — hex <-> rgb, lerping, named neon palette.

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface RGBA extends RGB {
  a: number;
}

export function hexToColor(hex: string): RGB {
  const cleaned = hex.replace('#', '').trim();
  const expanded =
    cleaned.length === 3
      ? cleaned.split('').map((c) => c + c).join('')
      : cleaned;
  const num = parseInt(expanded, 16);
  if (Number.isNaN(num)) return { r: 0, g: 0, b: 0 };
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  };
}

export function hexToCss(hex: string, alpha = 1): string {
  const { r, g, b } = hexToColor(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function lerpColor(a: RGB, b: RGB, t: number): RGB {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

export function toCss(color: RGB, alpha = 1): string {
  return `rgba(${color.r | 0},${color.g | 0},${color.b | 0},${alpha})`;
}

// Default neon palette used across UI.
export const NEON = {
  cyan: hexToColor('#00e0ff'),
  magenta: hexToColor('#ff00d4'),
  pink: hexToColor('#ff2e7a'),
  yellow: hexToColor('#ffe066'),
  green: hexToColor('#00ffa3'),
  purple: hexToColor('#9b5cff'),
  bg: hexToColor('#0a0a1a'),
} as const;