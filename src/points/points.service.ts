import { Injectable } from '@nestjs/common';

interface points {
  [index: number]: number | string;
}

@Injectable()
export class PointsService {
  public static getPoints(): any[] {
    return [0, 0.5, 1, 2, 3, 5, 8, 13, 21, 100, 'coffee'];
  }
}
