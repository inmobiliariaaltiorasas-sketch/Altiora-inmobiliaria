import type { PropertyTypeRecord } from './property-type-record';

export const PROPERTY_TYPES_REPOSITORY = Symbol('PROPERTY_TYPES_REPOSITORY');

export interface PropertyTypesRepository {
  findAll(): Promise<PropertyTypeRecord[]>;
  findBySlug(slug: string): Promise<PropertyTypeRecord | null>;
  findById(id: string): Promise<PropertyTypeRecord | null>;
  create(input: { name: string; slug: string }): Promise<PropertyTypeRecord>;
}
