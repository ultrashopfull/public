// Local OCR resources. No embedded Base64 payloads or generated Blob scripts.
importScripts("./tesseract-core.js");

const createOriginalCore = self.TesseractCore;
self.TesseractCore = async (options) => {
  const response = await fetch(new URL("./tesseract-core.wasm", self.location.href));
  if (!response.ok) throw new Error("No se pudo cargar el motor OCR: " + response.status);
  const wasmBinary = new Uint8Array(await response.arrayBuffer());
  return createOriginalCore({ ...options, wasmBinary });
};

importScripts("./worker.js");
