import { ConflictException, Inject, Injectable } from '@nestjs/common';
import {
  NEIGHBORHOODS_REPOSITORY,
  type CreateNeighborhoodInput,
  type NeighborhoodsRepository,
} from '../domain/neighborhoods.repository';
import type { NeighborhoodRecord } from '../domain/neighborhood-record';

@Injectable()
export class NeighborhoodsService {
  constructor(
    @Inject(NEIGHBORHOODS_REPOSITORY)
    private readonly neighborhoodsRepository: NeighborhoodsRepository,
  ) {}

  findByCityId(cityId: string): Promise<NeighborhoodRecord[]> {
    return this.neighborhoodsRepository.findByCityId(cityId);
  }

  async create(input: CreateNeighborhoodInput): Promise<NeighborhoodRecord> {
    const existing = await this.neighborhoodsRepository.findBySlugInCity(input.cityId, input.slug);
    if (existing) {
      throw new ConflictException(`Ya existe un barrio con ese slug en esta ciudad: ${input.slug}`);
    }
    return this.neighborhoodsRepository.create(input);
  }
}
