import { describe, expect, it } from 'vitest';
import { isAccommodationType, propertyTypeToSchemaType } from './property-schema-type';

describe('propertyTypeToSchemaType', () => {
  it('maps houses to House', () => {
    expect(propertyTypeToSchemaType('casa')).toBe('House');
    expect(propertyTypeToSchemaType('Casa')).toBe('House');
    expect(propertyTypeToSchemaType(' casas ')).toBe('House');
  });

  it('maps apartments to Apartment', () => {
    expect(propertyTypeToSchemaType('apartamento')).toBe('Apartment');
    expect(propertyTypeToSchemaType('apartamentos')).toBe('Apartment');
  });

  it('maps land and other non-accommodation types to the generic Place', () => {
    expect(propertyTypeToSchemaType('lote')).toBe('Place');
    expect(propertyTypeToSchemaType('finca')).toBe('Place');
    expect(propertyTypeToSchemaType('local-comercial')).toBe('Place');
  });

  it('maps unknown or empty slugs to the generic Place', () => {
    expect(propertyTypeToSchemaType('bodega-industrial')).toBe('Place');
    expect(propertyTypeToSchemaType('')).toBe('Place');
  });

  it('never maps a house to Apartment', () => {
    expect(propertyTypeToSchemaType('casa')).not.toBe('Apartment');
  });
});

describe('isAccommodationType', () => {
  it('is true only for House and Apartment', () => {
    expect(isAccommodationType('House')).toBe(true);
    expect(isAccommodationType('Apartment')).toBe(true);
    expect(isAccommodationType('Place')).toBe(false);
  });
});
