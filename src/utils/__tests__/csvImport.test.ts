import { describe, it, expect } from '@jest/globals';
import {
  normalizeHeader,
  parseImportCsv,
  parseNumber,
  getRowStatus,
  findDuplicateSkus,
  inStockFromRaw,
  chunk,
  decodeCsvBuffer,
  toTitleCase,
  RawImportRow,
} from '../csvImport';

const ERP_CSV = [
  'Código;Descrición;C.Lab.;Laborat;P.Venta;Stock;Prom;Minimo;Maximo;I.V.A;P.Oferta;P.Costo;C.Barra;Rubro_Art',
  '7754;IBUPROFENO 600 MG;123;Genfar;13.550,00;45;0;5;50;21;14.000,00;9.000,00;7801234567890;Analgésicos',
  '8812;CREMA HIDRATANTE NIVEA;456;Nivea;9.900,00;0;0;2;20;21;;;;2000000000012;Perfumería',
  '',
  '9931;VITAMINA C 1000;789;Bayer;4500;12;0;3;30;21;;;;2000000000029;Vitaminas',
].join('\n');

describe('normalizeHeader', () => {
  it('lowercases and removes dots and accents', () => {
    expect(normalizeHeader('P.Venta')).toBe('pventa');
    expect(normalizeHeader('Código')).toBe('codigo');
    expect(normalizeHeader('Descrición')).toBe('descricion');
    expect(normalizeHeader('I.V.A')).toBe('iva');
    expect(normalizeHeader('Rubro_Art')).toBe('rubro_art');
  });

  it('strips a leading BOM', () => {
    expect(normalizeHeader('\uFEFFCódigo')).toBe('codigo');
  });

  it('tolerates dots, spaces, colons and other separators', () => {
    expect(normalizeHeader('P. Venta')).toBe('pventa');
    expect(normalizeHeader('Codigo:')).toBe('codigo');
    expect(normalizeHeader('Descrición ')).toBe('descricion');
    expect(normalizeHeader('C. Lab.')).toBe('clab');
  });
});

describe('parseImportCsv', () => {
  it('parses the ERP export into rows', () => {
    const { rows, missing } = parseImportCsv(ERP_CSV);
    expect(missing).toEqual([]);
    expect(rows).toHaveLength(3);

    expect(rows[0]).toEqual({
      rowNum: 1,
      sku: '7754',
      name: 'Ibuprofeno 600 Mg',
      priceRaw: '13.550,00',
      stockRaw: '45',
    });
    expect(rows[2].sku).toBe('9931');
    expect(rows[2].name).toBe('Vitamina C 1000');
    expect(rows[2].priceRaw).toBe('4500');
  });

  it('applies title case to product names', () => {
    const csv = 'Código;Descrición;P.Venta\nXX1;CURITAS DE SPIDERMAN X 30;1500\n';
    const { rows } = parseImportCsv(csv);
    expect(rows[0].name).toBe('Curitas de Spiderman X 30');
  });

  it('handles headers without accent or with correct spelling', () => {
    const csv = 'Codigo;Descripcion;P.Venta\n1;Prod;1000\n';
    const { rows, missing } = parseImportCsv(csv);
    expect(missing).toEqual([]);
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe('Prod');
  });

  it('reports missing required columns', () => {
    const { rows, missing } = parseImportCsv('Codigo;Stock\n1;5\n');
    expect(rows).toEqual([]);
    expect(missing).toEqual(['Descrición', 'P.Venta']);
  });

  it('skips fully empty lines', () => {
    const csv = 'Código;Descrición;P.Venta\n\n1;A;100\n\n';
    const { rows } = parseImportCsv(csv);
    expect(rows).toHaveLength(1);
  });

  it('defaults stockRaw to empty when the column is absent', () => {
    const csv = 'Código;Descrición;P.Venta\n1;A;100\n';
    const { rows } = parseImportCsv(csv);
    expect(rows[0].stockRaw).toBe('');
  });
});

describe('parseNumber', () => {
  it('parses Argentine decimal format with thousands dots', () => {
    expect(parseNumber('13.550,00')).toBe(13550);
    expect(parseNumber('1.234.567')).toBe(1234567);
    expect(parseNumber('13.550')).toBe(13550);
  });

  it('parses plain and dot-decimal format', () => {
    expect(parseNumber('4500')).toBe(4500);
    expect(parseNumber('13550.00')).toBe(13550);
    expect(parseNumber('13550.50')).toBe(13550.5);
  });

  it('strips currency symbols and spaces', () => {
    expect(parseNumber('$ 1.000')).toBe(1000);
    expect(parseNumber(' 250 ')).toBe(250);
  });

  it('returns null for empty or invalid input', () => {
    expect(parseNumber('')).toBeNull();
    expect(parseNumber(null)).toBeNull();
    expect(parseNumber(undefined)).toBeNull();
    expect(parseNumber('abc')).toBeNull();
  });

  it('parses real values from the ERP export (dot decimals, no thousands)', () => {
    expect(parseNumber('2398.5')).toBe(2398.5);
    expect(parseNumber('4250.88')).toBe(4250.88);
    expect(parseNumber('11311.52')).toBe(11311.52);
    expect(parseNumber('1875')).toBe(1875);
    expect(parseNumber('105')).toBe(105);
    expect(parseNumber('0.08')).toBe(0.08);
  });
});

describe('getRowStatus', () => {
  const row: RawImportRow = { rowNum: 1, sku: '7754', name: 'P', priceRaw: '1000', stockRaw: '1' };

  it('marks rows without sku or price as invalid', () => {
    expect(getRowStatus({ ...row, sku: '' }, 1000)).toBe('invalid');
    expect(getRowStatus(row, null)).toBe('invalid');
  });

  it('marks rows without a matching product as new', () => {
    expect(getRowStatus(row, 1000, undefined)).toBe('new');
    expect(getRowStatus(row, 1000, null)).toBe('new');
  });

  it('marks rows with an equal price as unchanged', () => {
    expect(getRowStatus(row, 1000, 1000)).toBe('unchanged');
    expect(getRowStatus(row, 1000, '1000.00' as unknown as number)).toBe('unchanged');
  });

  it('marks rows with a different price as priceUpdate', () => {
    expect(getRowStatus(row, 1200, 1000)).toBe('priceUpdate');
  });
});

describe('findDuplicateSkus', () => {
  const makeRow = (sku: string): RawImportRow => ({
    rowNum: 1,
    sku,
    name: 'P',
    priceRaw: '1',
    stockRaw: '',
  });

  it('returns duplicated skus only', () => {
    const rows = [makeRow('a'), makeRow('b'), makeRow('a'), makeRow('c'), makeRow('b')];
    expect([...findDuplicateSkus(rows)].sort()).toEqual(['a', 'b']);
  });

  it('ignores empty skus', () => {
    expect(findDuplicateSkus([makeRow(''), makeRow('')]).size).toBe(0);
  });
});

describe('inStockFromRaw', () => {
  it('is false only when stock parses to zero or below', () => {
    expect(inStockFromRaw('0')).toBe(false);
    expect(inStockFromRaw('-1')).toBe(false);
    expect(inStockFromRaw('45')).toBe(true);
    expect(inStockFromRaw('')).toBe(true);
    expect(inStockFromRaw('abc')).toBe(true);
  });
});

describe('chunk', () => {
  it('splits into chunks of the given size', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(chunk([], 2)).toEqual([]);
    expect(chunk([1], 5)).toEqual([[1]]);
  });
});

const toBuf = (bytes: number[]): ArrayBuffer =>
  new Uint8Array(bytes).buffer as ArrayBuffer;

const utf8Buf = (s: string): ArrayBuffer =>
  new TextEncoder().encode(s).buffer as ArrayBuffer;

const win1252Buf = (s: string): ArrayBuffer => {
  const bytes: number[] = [];
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if (code <= 0xff) bytes.push(code);
    else bytes.push(0x3f);
  }
  return toBuf(bytes);
};

const utf16leBuf = (s: string): ArrayBuffer => {
  const bytes: number[] = [0xff, 0xfe];
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    bytes.push(c & 0xff, (c >> 8) & 0xff);
  }
  return toBuf(bytes);
};

describe('decodeCsvBuffer', () => {
  it('decodes UTF-8 with accents', () => {
    expect(decodeCsvBuffer(utf8Buf('Código;Descrición'))).toBe(
      'Código;Descrición',
    );
  });

  it('strips a UTF-8 BOM', () => {
    const buf = toBuf([0xef, 0xbb, 0xbf, 0x41, 0x42]);
    expect(decodeCsvBuffer(buf)).toBe('AB');
  });

  it('falls back to windows-1252 when bytes are not valid UTF-8', () => {
    const buf = win1252Buf('Código;Descrición;P.Venta');
    expect(decodeCsvBuffer(buf)).toBe('Código;Descrición;P.Venta');
  });

  it('decodes UTF-16LE with BOM', () => {
    expect(decodeCsvBuffer(utf16leBuf('Código;P.Venta'))).toBe(
      'Código;P.Venta',
    );
  });

  it('parses an ANSI-encoded ERP export end to end', () => {
    const csv =
      'Código;Descrición;C.Lab.;Stock;P.Venta;Rubro_Art\r\n' +
      'XX52861;ACEITE DE ALMENDRAS;MG01;1;2398.5;ACCESORIOS\r\n' +
      'XX53132;CREMA NIVEA;MG01;3;9900.5;ACCESORIOS\r\n';
    const parsed = parseImportCsv(decodeCsvBuffer(win1252Buf(csv)));
    expect(parsed.missing).toEqual([]);
    expect(parsed.rows).toHaveLength(2);
    expect(parsed.rows[0].sku).toBe('XX52861');
    expect(parsed.rows[0].name).toBe('Aceite de Almendras');
    expect(parsed.rows[0].priceRaw).toBe('2398.5');
    expect(parsed.rows[1].priceRaw).toBe('9900.5');
  });
});

describe('toTitleCase', () => {
  it('capitalizes each word and keeps short prepositions lowercase', () => {
    expect(toTitleCase('CURITAS DE SPIDERMAN X 30')).toBe(
      'Curitas de Spiderman X 30',
    );
    expect(toTitleCase('ACEITE DE ALMENDRAS TIPO X 40CC TABLADA')).toBe(
      'Aceite de Almendras Tipo X 40cc Tablada',
    );
    expect(toTitleCase('ACEITE PARA CUTICULA (AF 04301)')).toBe(
      'Aceite para Cuticula (Af 04301)',
    );
    expect(toTitleCase('DESPERTADOR PARA BEBES')).toBe(
      'Despertador para Bebes',
    );
  });

  it('keeps single-letter tokens uppercase, except y', () => {
    expect(toTitleCase('CURITAS X 30')).toBe('Curitas X 30');
    expect(toTitleCase('DISCOS X 80 U.')).toBe('Discos X 80 U.');
    expect(toTitleCase('SAL Y PIMIENTA')).toBe('Sal y Pimienta');
  });

  it('capitalizes after hyphens, slashes and parentheses', () => {
    expect(toTitleCase('BEBEFANTITOS-ASPIRADOR NASAL')).toBe(
      'Bebefantitos-Aspirador Nasal',
    );
    expect(toTitleCase('BOLSA P/CAMA C/GANCHO')).toBe(
      'Bolsa P/Cama C/Gancho',
    );
    expect(toTitleCase('APOSITO GASANA 10X10(X 8 UNID)')).toBe(
      'Aposito Gasana 10x10(X 8 Unid)',
    );
  });

  it('applies the uniform rule to units', () => {
    expect(toTitleCase('100ML SPRAY')).toBe('100ml Spray');
    expect(toTitleCase('10 VOL X 40CC')).toBe('10 Vol X 40cc');
  });

  it('handles accents and empty values', () => {
    expect(toTitleCase('CEPILLO DE UÑAS')).toBe('Cepillo de Uñas');
    expect(toTitleCase('')).toBe('');
  });

  it('is idempotent', () => {
    const once = toTitleCase('ACEITE DE ALMENDRAS TIPO X 40CC TABLADA');
    expect(toTitleCase(once)).toBe(once);
    expect(toTitleCase('Curitas de Spiderman X 30')).toBe(
      'Curitas de Spiderman X 30',
    );
  });
});
