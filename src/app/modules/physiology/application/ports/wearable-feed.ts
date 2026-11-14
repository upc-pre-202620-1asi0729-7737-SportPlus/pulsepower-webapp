import { SimulatedDay } from '../../domain/model/wearable-simulation';
/** Delivers a day of wearable readings to the records that use them. */
export abstract class WearableFeed {
  abstract sync(day: SimulatedDay): Promise<void>;
}
