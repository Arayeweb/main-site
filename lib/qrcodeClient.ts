/** Client-side loader for public/assets/js/qrcode.js (Kazuhiko Arase). */

export type QrCodeInstance = {
  addData: (data: string) => void;
  make: () => void;
  createImgTag: (cellSize?: number, margin?: number) => string;
  getModuleCount: () => number;
  isDark: (row: number, col: number) => boolean;
};

type QrCodeFactory = (typeNumber: number, errorCorrectionLevel: string) => QrCodeInstance;

declare global {
  interface Window {
    qrcode?: QrCodeFactory;
  }
}

let loadPromise: Promise<QrCodeFactory> | null = null;

function getFactory(): QrCodeFactory | null {
  return typeof window.qrcode === "function" ? window.qrcode : null;
}

export function loadQrcode(): Promise<QrCodeFactory> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("qrcode only available in browser"));
  }

  const existing = getFactory();
  if (existing) return Promise.resolve(existing);

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const finishOk = () => {
      const factory = getFactory();
      if (factory) {
        resolve(factory);
        return;
      }
      loadPromise = null;
      reject(new Error("qrcode failed to load"));
    };

    const finishErr = (err: Error) => {
      loadPromise = null;
      reject(err);
    };

    const prev = document.querySelector<HTMLScriptElement>('script[data-araaye-qrcode="1"]');
    if (prev) {
      // Script already injected; wait briefly for global
      const start = Date.now();
      const poll = () => {
        if (getFactory()) {
          finishOk();
          return;
        }
        if (Date.now() - start > 5000) {
          finishErr(new Error("qrcode script timeout"));
          return;
        }
        requestAnimationFrame(poll);
      };
      poll();
      return;
    }

    const script = document.createElement("script");
    script.src = "/assets/js/qrcode.js";
    script.async = true;
    script.dataset.araayeQrcode = "1";
    script.onload = () => finishOk();
    script.onerror = () => finishErr(new Error("qrcode script error"));
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

export async function buildQrDataUrl(text: string, color: string): Promise<string> {
  const qrcode = await loadQrcode();
  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();
  return drawColoredQr(qr, color).toDataURL("image/png");
}
