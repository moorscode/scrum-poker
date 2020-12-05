import { Injectable } from '@nestjs/common';

export type PointValue = 0 | 0.5 | 1 | 2 | 3 | 5 | 8 | 13 | 21 | 100 | 'coffee';

@Injectable()
export class PointsService {
  public static getPoints(): PointValue[] {
    return [0, 0.5, 1, 2, 3, 5, 8, 13, 21, 100, 'coffee'];
  }

  public static getNumericPoints(): number[] {
    return this.getPoints().filter(
      (x: PointValue) => parseFloat(x as string) === x,
    ) as number[];
  }
}
