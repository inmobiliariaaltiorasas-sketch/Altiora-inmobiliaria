export interface CityDto {
  id: string;
  name: string;
  slug: string;
  department: string;
  country: string;
}

export interface NeighborhoodDto {
  id: string;
  name: string;
  slug: string;
  cityId: string;
}

export interface LocationsTreeEntryDto extends CityDto {
  neighborhoods: NeighborhoodDto[];
}

export interface PropertyTypeDto {
  id: string;
  name: string;
  slug: string;
}

export interface PropertyFeatureDto {
  id: string;
  name: string;
  slug: string;
}

export interface CreateCityDto {
  name: string;
  slug: string;
  department: string;
  country?: string;
}

export interface CreateNeighborhoodDto {
  name: string;
  slug: string;
  cityId: string;
}
