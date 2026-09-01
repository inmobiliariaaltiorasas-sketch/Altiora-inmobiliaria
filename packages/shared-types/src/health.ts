export interface HealthStatusDto {
  status: 'ok' | 'error';
  database: 'up' | 'down';
  timestamp: string;
}
