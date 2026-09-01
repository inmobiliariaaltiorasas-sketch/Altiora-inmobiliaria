import { Inject, Injectable } from '@nestjs/common';
import {
  PROPERTY_FEATURES_REPOSITORY,
  type PropertyFeaturesRepository,
} from '../domain/property-features.repository';
import type { PropertyFeatureRecord } from '../domain/property-feature-record';

@Injectable()
export class PropertyFeaturesService {
  constructor(
    @Inject(PROPERTY_FEATURES_REPOSITORY) private readonly repository: PropertyFeaturesRepository,
  ) {}

  findAll(): Promise<PropertyFeatureRecord[]> {
    return this.repository.findAll();
  }

  findByIds(ids: string[]): Promise<PropertyFeatureRecord[]> {
    return this.repository.findByIds(ids);
  }

  create(input: { name: string; slug: string }): Promise<PropertyFeatureRecord> {
    return this.repository.create(input);
  }
}
