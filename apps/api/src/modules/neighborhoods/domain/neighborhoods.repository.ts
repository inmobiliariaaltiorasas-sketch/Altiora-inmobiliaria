import type { NeighborhoodRecord } from './neighborhood-record';

export const NEIGHBORHOODS_REPOSITORY = Symbol('NEIGHBORHOODS_REPOSITORY');

export interface CreateNeighborhoodInput {
  name: string;
  slug: string;
  cityId: string;
}

export interface NeighborhoodsRepository {
  findByCityId(cityId: string): Promise<NeighborhoodRecord[]>;
  findBySlugInCity(cityId: string, slug: string): Promise<NeighborhoodRecord | null>;
  findById(id: string): Promise<NeighborhoodRecord | null>;
  create(input: CreateNeighborhoodInput): Promise<NeighborhoodRecord>;
}
