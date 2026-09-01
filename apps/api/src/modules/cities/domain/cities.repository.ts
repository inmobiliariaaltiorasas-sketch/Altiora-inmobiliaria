import type { CityRecord } from './city-record';

export const CITIES_REPOSITORY = Symbol('CITIES_REPOSITORY');

export interface CreateCityInput {
  name: string;
  slug: string;
  department: string;
  country?: string;
}

export interface CitiesRepository {
  findAllActive(): Promise<CityRecord[]>;
  findBySlug(slug: string): Promise<CityRecord | null>;
  findById(id: string): Promise<CityRecord | null>;
  create(input: CreateCityInput): Promise<CityRecord>;
}
