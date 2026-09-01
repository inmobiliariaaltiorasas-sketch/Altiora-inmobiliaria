import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CITIES_REPOSITORY,
  type CitiesRepository,
  type CreateCityInput,
} from '../domain/cities.repository';
import type { CityRecord } from '../domain/city-record';

@Injectable()
export class CitiesService {
  constructor(@Inject(CITIES_REPOSITORY) private readonly citiesRepository: CitiesRepository) {}

  findAllActive(): Promise<CityRecord[]> {
    return this.citiesRepository.findAllActive();
  }

  async findBySlugOrThrow(slug: string): Promise<CityRecord> {
    const city = await this.citiesRepository.findBySlug(slug);
    if (!city) throw new NotFoundException(`Ciudad no encontrada: ${slug}`);
    return city;
  }

  async findByIdOrThrow(id: string): Promise<CityRecord> {
    const city = await this.citiesRepository.findById(id);
    if (!city) throw new NotFoundException(`Ciudad no encontrada: ${id}`);
    return city;
  }

  async create(input: CreateCityInput): Promise<CityRecord> {
    const existing = await this.citiesRepository.findBySlug(input.slug);
    if (existing) throw new ConflictException(`Ya existe una ciudad con el slug: ${input.slug}`);
    return this.citiesRepository.create(input);
  }
}
