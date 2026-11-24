/** Builds a crisp SVG QR code from text (UTF-8 safe). */
import qrcode from 'qrcode-generator';

export function qrSVG(text, color = '#0E0E0D') {
  const qr = qrcode(0, 'M');
  // the library expects one byte per character, so encode to UTF-8 first
  const bytes = new TextEncoder().encode(text);
  qr.addData(String.fromCharCode(...bytes), 'Byte');
  qr.make();

  const n = qr.getModuleCount();
  let d = '';
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) if (qr.isDark(y, x)) d += `M${x} ${y}h1v1h-1z`;
  }
  return `<svg viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges" role="img" aria-label="QR code with the route"><path d="${d}" fill="${color}"/></svg>`;
}
