import { DeltaInstance } from './DeltaInstance';
import type MikotoClient from '../index';

export class ChannelUnreadInstance extends DeltaInstance<{
  [channelId: string]: Date;
}> {
  constructor(private mikoto: MikotoClient, private spaceId: string) {
    super();
  }
  async fetch(): Promise<{ [p: string]: Date }> {
    const unreads = await this.mikoto.unreads(this.spaceId);
    return Object.fromEntries(
      Object.entries(unreads).map(([key, val]) => [key, new Date(val)]),
    );
  }
}
