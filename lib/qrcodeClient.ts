/** Client-side loader for public/assets/js/qrcode.js (Kazuhiko Arase). */

export type QrCodeInstance = {
  addData: (data: string) => void;
  make: () => void;
  createImgTag: (cellSize?: number, margin?: number) => string;
  getModuleCount: () => number;
  isDark: (row: number, col: number) => boolean;
};

type QrCodeFactory = (typeNumber: number, errorCorrectionLevel: string) => QrCodeInstance;

let loadPromise: Promise<QrCodeFactory> | null = null;

export function loadQrcode(): Promise<QrCodeFactory> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("qrcode only available in browser"));
  }

  const existing = (window as unknown as { qrcode?: QrCodeFactory }).qrcode;
  if (typeof existing === "function") {
    return Promise.resolve(existing);
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/assets/js/qrcode.js";
    script.async = true;
    script.onload = () => {
      const factory = (window as unknown as { qrcode?: QrCodeFactory }).qrcode;
      if (typeof factory === "function") resolve(factory);
      else reject(new Error("qrcode failed to load"));
    };
    script.onerror = () => reject(new Error("qrcode script error"));
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function drawColoredQr(
  qr: QrCodeInstance,
  color: string,
  cell = 12,
): HTMLCanvasElement {
  const count = qr.getModuleCount();
  const margin = cell * 2;
  const size = count * cell + margin * 2;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unsupported");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = color;
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) {
        ctx.fillRect(margin + c * cell, margin + r * cell, cell, cell);
      }
    }
  }
  return canvas;
}
