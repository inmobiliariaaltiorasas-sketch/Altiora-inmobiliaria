export type PropertySchemaType = 'House' | 'Apartment' | 'Place';

/**
 * Maps the API property-type slug to a schema.org type that exists. Houses and apartments are
 * accommodations; land, farms, commercial premises and any unknown type use the generic `Place`
 * so they never claim to be a dwelling.
 */
export function propertyTypeToSchemaType(propertyTypeSlug: string): PropertySchemaType {
  const slug = propertyTypeSlug.trim().toLowerCase();
  if (slug === 'casa' || slug === 'casas') return 'House';
  if (slug === 'apartamento' || slug === 'apartamentos') return 'Apartment';
  return 'Place';
}

/** Only accommodations carry bedrooms, bathrooms and floor size in schema.org. */
export function isAccommodationType(type: PropertySchemaType): boolean {
  return type === 'House' || type === 'Apartment';
}
