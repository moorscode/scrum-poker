import { PartialType } from '@nestjs/mapped-types';
import { CreateScrumteamDto } from './create-scrumteam.dto';

export class UpdateScrumteamDto extends PartialType(CreateScrumteamDto) {
  id: number;
}
