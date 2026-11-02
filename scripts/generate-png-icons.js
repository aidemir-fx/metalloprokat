import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCrcTable() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCrcTable();
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);
  const typeAndData = Buffer.concat([Buffer.from(type), data]);
  const c = crc32(typeAndData);
  chunk.writeUInt32BE(c, 8 + len);
  return chunk;
}

function generatePng(width, height, isMaskable = false) {
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw image scanlines
  const rawScanlines = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawScanlines[offset++] = 0; // Filter type 0 (None)
    const ny = y / height; // 0 to 1

    for (let x = 0; x < width; x++) {
      const nx = x / width; // 0 to 1
      
      // Default dark navy background
      let r = 15;
      let g = 23;
      let b = 42;
      let a = 255;

      // Distance from center for rounded badge / safe-zone
      const cx = (nx - 0.5);
      const cy = (ny - 0.5);

      // Safe zone / inner beam drawing
      const isBeamY = ny >= 0.25 && ny <= 0.75;
      const isTopFlange = ny >= 0.25 && ny <= 0.38 && nx >= 0.25 && nx <= 0.75;
      const isBotFlange = ny >= 0.62 && ny <= 0.75 && nx >= 0.25 && nx <= 0.75;
      const isWeb = ny >= 0.38 && ny <= 0.62 && nx >= 0.43 && nx <= 0.57;

      if (isTopFlange || isBotFlange || isWeb) {
        // Amber gold beam
        r = 245;
        g = 158;
        b = 11;
      } else if (ny >= 0.45 && ny <= 0.55 && nx >= 0.34 && nx <= 0.66) {
        // Inner badge
        r = 30;
        g = 41;
        b = 59;
      } else {
        // Background gradient
        r = Math.round(15 + ny * 15);
        g = Math.round(23 + ny * 18);
        b = Math.round(42 + ny * 20);
      }

      // If not maskable, round corners
      if (!isMaskable) {
        const cornerRadius = 0.2;
        const dx = Math.max(Math.abs(cx) - (0.5 - cornerRadius), 0);
        const dy = Math.max(Math.abs(cy) - (0.5 - cornerRadius), 0);
        const distToCorner = Math.sqrt(dx * dx + dy * dy);
        if (distToCorner > cornerRadius) {
          // outside rounded rectangle
          a = 0;
          r = 0;
          g = 0;
          b = 0;
        }
      }

      rawScanlines[offset++] = r;
      rawScanlines[offset++] = g;
      rawScanlines[offset++] = b;
      rawScanlines[offset++] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawScanlines);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePng(180, 180, false));

console.log('PNG icons created successfully in public directory!');
