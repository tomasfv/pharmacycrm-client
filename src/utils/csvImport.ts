import Papa from "papaparse";

export interface RawImportRow {
  rowNum: number;
  sku: string;
  name: string;
  priceRaw: string;
  stockRaw: string;
  categoryId?: string;
}

export interface ParseResult {
  rows: RawImportRow[];
  headers: string[];
  missing: string[];
}

export type RowStatus = "new" | "priceUpdate" | "unchanged" | "invalid";

export function normalizeHeader(header: string): string {
  return header
    .replace(/^\uFEFF/, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_]/g, "");
}

export function decodeCsvBuffer(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return new TextDecoder("utf-8").decode(buf);
  }
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder("utf-16le").decode(buf);
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder("utf-16be").decode(buf);
  }
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buf);
  } catch {
    return new TextDecoder("windows-1252").decode(buf);
  }
}

const TITLE_CASE_STOPWORDS = new Set([
  "el", "la", "los", "las", "un", "una", "unos", "unas", "al", "del",
  "y", "o", "u", "e", "ni", "a", "ante", "bajo", "con", "contra",
  "de", "desde", "durante", "en", "entre", "hacia", "hasta",
  "para", "por", "sin", "sobre", "tras", "versus", "via",
]);

const TITLE_CASE_ALWAYS_LOWER = new Set(["y"]);
const TITLE_CASE_SEPARATORS = new Set(["-", "/", "("]);

export function toTitleCase(value: string): string {
  if (!value) return value;
  return value
    .split(" ")
    .map((token, index) => {
      const lower = token.toLowerCase();
      const bare = lower.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
      const keepLower =
        index > 0 &&
        TITLE_CASE_STOPWORDS.has(bare) &&
        (bare.length > 1 || TITLE_CASE_ALWAYS_LOWER.has(bare));
      if (keepLower) return lower;
      let out = "";
      let cap = true;
      for (const ch of lower) {
        if (cap && /\p{L}/u.test(ch)) {
          out += ch.toUpperCase();
          cap = false;
        } else {
          out += ch;
          cap = TITLE_CASE_SEPARATORS.has(ch);
        }
      }
      return out;
    })
    .join(" ");
}

const SKU_HEADERS = ["codigo"];
const NAME_HEADERS = ["descricion", "descripcion"];
const PRICE_HEADERS = ["pventa"];

export function parseImportCsv(text: string): ParseResult {
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: normalizeHeader,
  });

  const headers = (parsed.meta.fields ?? []).filter(Boolean);

  const findHeader = (candidates: string[]) =>
    candidates.find((c) => headers.includes(c));
  const skuHeader = findHeader(SKU_HEADERS);
  const nameHeader = findHeader(NAME_HEADERS);
  const priceHeader = findHeader(PRICE_HEADERS);
  const stockHeader = headers.includes("stock") ? "stock" : undefined;

  const missing: string[] = [];
  if (!skuHeader) missing.push("Código");
  if (!nameHeader) missing.push("Descrición");
  if (!priceHeader) missing.push("P.Venta");
  if (missing.length > 0 || !skuHeader || !nameHeader || !priceHeader) {
    return { rows: [], headers, missing };
  }

  const rows: RawImportRow[] = parsed.data
    .map((r, i) => ({
      rowNum: i + 1,
      sku: String(r[skuHeader] ?? "").trim(),
      name: toTitleCase(String(r[nameHeader] ?? "").trim()),
      priceRaw: String(r[priceHeader] ?? "").trim(),
      stockRaw: stockHeader ? String(r[stockHeader] ?? "").trim() : "",
    }))
    .filter((r) => r.sku || r.name || r.priceRaw);

  return { rows, headers, missing };
}

export function parseNumber(raw: string | null | undefined): number | null {
  if (raw === null || raw === undefined) return null;
  let s = String(raw).trim();
  if (!s) return null;
  s = s.replace(/[^\d.,-]/g, "");
  if (!s) return null;
  if (s.includes(",")) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, "");
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

export function getRowStatus(
  row: RawImportRow,
  price: number | null,
  existingPrice?: number | null,
): RowStatus {
  if (!row.sku || price === null) return "invalid";
  if (existingPrice === null || existingPrice === undefined) return "new";
  return Number(existingPrice) === price ? "unchanged" : "priceUpdate";
}

export function findDuplicateSkus(rows: RawImportRow[]): Set<string> {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const row of rows) {
    if (!row.sku) continue;
    if (seen.has(row.sku)) duplicates.add(row.sku);
    seen.add(row.sku);
  }
  return duplicates;
}

export function inStockFromRaw(stockRaw: string): boolean {
  const n = parseNumber(stockRaw);
  if (n === null) return true;
  return n > 0;
}

export function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}
