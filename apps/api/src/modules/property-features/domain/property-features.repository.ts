import type { PropertyFeatureRecord } from './property-feature-record';

export const PROPERTY_FEATURES_REPOSITORY = Symbol('PROPERTY_FEATURES_REPOSITORY');

export interface PropertyFeaturesRepository {
  findAll(): Promise<PropertyFeatureRecord[]>;
  findByIds(ids: string[]): Promise<PropertyFeatureRecord[]>;
  create(input: { name: string; slug: string }): Promise<PropertyFeatureRecord>;
}
