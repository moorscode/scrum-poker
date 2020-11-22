import { Injectable } from '@nestjs/common';

@Injectable()
export class PointsService {
  public static getPoints() {
    return {
      0: 0,
      1: 1,
      2: 2,
      3: 3,
      5: 5,
      8: 8,
      13: 13,
      21: 21,
      100: 100,
      coffee: -1,
    };
  }
}
