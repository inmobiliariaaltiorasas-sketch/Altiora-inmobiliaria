import { Inject, Injectable } from '@nestjs/common';
import {
  PROPERTY_TYPES_REPOSITORY,
  type PropertyTypesRepository,
} from '../domain/property-types.repository';
import type { PropertyTypeRecord } from '../domain/property-type-record';

@Injectable()
export class PropertyTypesService {
  constructor(
    @Inject(PROPERTY_TYPES_REPOSITORY) private readonly repository: PropertyTypesRepository,
  ) {}

  findAll(): Promise<PropertyTypeRecord[]> {
    return this.repository.findAll();
  }

  create(input: { name: string; slug: string }): Promise<PropertyTypeRecord> {
    return this.repository.create(input);
  }
}
