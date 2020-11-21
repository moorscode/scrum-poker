import { PartialType } from '@nestjs/mapped-types';
import { CreateRefinementDto } from './create-refinement.dto';

export class UpdateRefinementDto extends PartialType(CreateRefinementDto) {
  id: number;
}
