/**
 * TOTP Generator in pure JavaScript using Web Crypto API.
 * Supports standard RFC 6238 Base32 TOTP AND panel seed algorithm from web_api_index.php.
 */

const Base32 = {
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
  decode(str) {
    if (!str) return new Uint8Array(0);
    str = str.replace(/=+$/, '').toUpperCase().replace(/[\s-]/g, '');
    let bits = 0;
    let value = 0;
    const output = [];

    for (let i = 0; i < str.length; i++) {
      const idx = this.alphabet.indexOf(str[i]);
      if (idx === -1) continue;
      value = (value << 5) | idx;
      bits += 5;
      if (bits >= 8) {
        output.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }
    return new Uint8Array(output);
  }
};

async function sha1Hex(str) {
  const enc = new TextEncoder();
  const data = enc.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function generateTOTP(secretSeed, timeStep = 30) {
  if (!secretSeed) return null;
  secretSeed = secretSeed.trim();

  // If already a 6-digit code, return it
  if (/^\d{6}$/.test(secretSeed)) {
    return { otp: secretSeed, secondsRemaining: 30 };
  }

  const epoch = Math.floor(Date.now() / 1000);
  const counter = Math.floor(epoch / timeStep);
  const secondsRemaining = timeStep - (epoch % timeStep);

  try {
    const keyBytes = Base32.decode(secretSeed);

    // Standard RFC 6238 Base32 TOTP (Google Authenticator)
    if (keyBytes.length >= 8) {
      const buffer = new ArrayBuffer(8);
      const view = new DataView(buffer);
      view.setUint32(4, counter, false);

      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyBytes,
        { name: "HMAC", hash: { name: "SHA-1" } },
        false,
        ["sign"]
      );

      const signature = await crypto.subtle.sign("HMAC", cryptoKey, buffer);
      const sigBytes = new Uint8Array(signature);

      const offset = sigBytes[sigBytes.length - 1] & 0x0f;
      const binary =
        ((sigBytes[offset] & 0x7f) << 24) |
        ((sigBytes[offset + 1] & 0xff) << 16) |
        ((sigBytes[offset + 2] & 0xff) << 8) |
        (sigBytes[offset + 3] & 0xff);

      const otp = (binary % 1000000).toString().padStart(6, '0');
      return { otp, secondsRemaining };
    }

    // Custom panel seed hashing (matching web_api_index.php generateDynamicTotpCode)
    const cleanSeed = secretSeed.toUpperCase().replace(/[\s-]/g, '');
    const hash = await sha1Hex(cleanSeed + counter);
    const num = parseInt(hash.slice(0, 8), 16) & 0x7fffffff;
    const otp = (num % 1000000).toString().padStart(6, '0');
    return { otp, secondsRemaining };

  } catch (e) {
    console.error("[TOTP Generator] Error:", e);
    return null;
  }
}
