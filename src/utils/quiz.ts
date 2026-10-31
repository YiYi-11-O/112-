/**
 * Pure quiz rules, normalization, and serial formatting
 */

/**
 * Normalizes an answer string by trimming, converting to lower case,
 * and converting full-width alphanumeric chars to half-width.
 */
export function normalizeAnswer(ans: string): string {
  if (!ans) return '';
  return ans
    .trim()
    .toLowerCase()
    // Convert full-width ASCII (e.g. ０-９, Ａ-Ｚ, ａ-ｚ) to standard half-width
    .replace(/[\uff01-\uff5e]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
    )
    // Convert full-width space to half-width
    .replace(/\u3000/g, ' ');
}

/**
 * Checks if user input matches ANY of the acceptable correct answers.
 */
export function checkAnswer(userInput: string, correctAnswers: string[]): boolean {
  const normalizedInput = normalizeAnswer(userInput);
  if (!normalizedInput) return false;

  return correctAnswers.some((ans) => {
    const normalizedTarget = normalizeAnswer(ans);
    return normalizedTarget === normalizedInput;
  });
}

/**
 * Formats a global serial number into standard coupon voucher format:
 * e.g. 1 -> "NO.0001", 42 -> "NO.0042", 12345 -> "NO.12345"
 */
export function formatSerialNumber(serial: number, minDigits: number = 4): string {
  const safeSerial = Math.max(1, Math.floor(serial || 1));
  return `NO.${String(safeSerial).padStart(minDigits, '0')}`;
}

/**
 * Parses user input in the admin panel (comma, newline, or semicolon separated)
 * into a clean list of unique answer strings.
 */
export function parseAnswerList(raw: string): string[] {
  if (!raw) return [];
  const parts = raw
    .split(/[,，\n;；]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Return unique entries while preserving original casing
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of parts) {
    const key = part.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(part);
    }
  }
  return result;
}
