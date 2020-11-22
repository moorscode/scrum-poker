import { Injectable } from '@nestjs/common';

@Injectable()
export class PointsService {
  public static getPoints() {
    return [0, 0.5, 1, 2, 3, 5, 8, 13, 21, 100, 'coffee'];
  }
}
