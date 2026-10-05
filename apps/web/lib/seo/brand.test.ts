import { describe, expect, it } from 'vitest';
import { BRAND_NAME, LEGAL_NAME, fullTitle, titleForTemplate } from './brand';

describe('brand constants', () => {
  it('uses the agreed brand and keeps the legal name separate', () => {
    expect(BRAND_NAME).toBe('ALTiora Inmobiliaria');
    expect(LEGAL_NAME).toBe('Altiora Construcciones e Inmobiliaria S.A.S.');
  });
});

describe('titleForTemplate', () => {
  it('returns a plain title untouched so the layout template adds the brand once', () => {
    expect(titleForTemplate('Propiedades en Cartago')).toBe('Propiedades en Cartago');
  });

  it('strips a hand-written short brand suffix', () => {
    expect(titleForTemplate('Contacto | ALTiora')).toBe('Contacto');
    expect(titleForTemplate('Propiedades en Cartago, Valle | Altiora')).toBe(
      'Propiedades en Cartago, Valle',
    );
    expect(titleForTemplate('Nosotros - ALTIORA')).toBe('Nosotros');
  });

  it('strips the full brand suffix typed by an admin in a seoTitle', () => {
    expect(titleForTemplate('Casa en venta | ALTiora Inmobiliaria')).toBe('Casa en venta');
  });

  it('keeps inner separators of the title', () => {
    expect(titleForTemplate('Inmobiliaria en Cartago | Casas y lotes | Altiora')).toBe(
      'Inmobiliaria en Cartago | Casas y lotes',
    );
  });

  it('uses an absolute title when the brand appears elsewhere in the title', () => {
    expect(titleForTemplate('ALTiora Inmobiliaria en Cartago')).toEqual({
      absolute: 'ALTiora Inmobiliaria en Cartago',
    });
  });

  it('falls back to the bare brand when nothing is left after stripping', () => {
    expect(titleForTemplate('| ALTiora')).toEqual({ absolute: BRAND_NAME });
    expect(titleForTemplate('   ')).toEqual({ absolute: BRAND_NAME });
  });
});

describe('fullTitle', () => {
  it('appends the brand exactly once', () => {
    expect(fullTitle('Contacto')).toBe('Contacto | ALTiora Inmobiliaria');
    expect(fullTitle('Contacto | ALTiora')).toBe('Contacto | ALTiora Inmobiliaria');
    expect(fullTitle('Contacto | ALTiora Inmobiliaria')).toBe('Contacto | ALTiora Inmobiliaria');
  });

  it('does not suffix a title that already contains the brand', () => {
    expect(fullTitle('ALTiora Inmobiliaria en Cartago')).toBe('ALTiora Inmobiliaria en Cartago');
  });

  it('returns the bare brand for an empty title', () => {
    expect(fullTitle('')).toBe(BRAND_NAME);
  });
});
