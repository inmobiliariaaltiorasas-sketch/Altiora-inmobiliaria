import { IsString, MinLength } from 'class-validator';

export class SimulateInboundDto {
  @IsString()
  @MinLength(5)
  phoneNumber!: string;

  @IsString()
  @MinLength(1)
  text!: string;
}
