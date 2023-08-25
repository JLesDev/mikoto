import { runInAction } from 'mobx';

import { ChannelEmitter, MessageEmitter, SpaceEmitter } from './emitters';
import { createClient, MainServiceClient } from './schema';
import {
  ChannelStore,
  ClientChannel,
  ClientMember,
  ClientRole,
  ClientSpace,
  ClientUser,
  MemberStore,
  RoleStore,
  SpaceStore,
} from './store';

interface MikotoClientOptions {
  onReady?: (client: MikotoClient) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export class MikotoClient {
  // spaces: SpaceEngine = new SpaceEngine(this);
  client!: MainServiceClient;

  // screw all of the above, we're rewriting the entire thing
  messageEmitter = new MessageEmitter();
  channelEmitter = new ChannelEmitter();
  spaceEmitter = new SpaceEmitter();

  spaces = new SpaceStore(this, ClientSpace);
  channels = new ChannelStore(this, ClientChannel);
  members = new MemberStore(this, ClientMember);
  roles = new RoleStore(this, ClientRole);
  me!: ClientUser;

  constructor(
    sophonUrl: string,
    accessToken: string,
    { onReady, onConnect, onDisconnect }: MikotoClientOptions,
  ) {
    createClient({
      url: sophonUrl,
      params: {
        accessToken,
      },
      onReady: (client) => {
        this.client = client;
        this.setupClient();
        onReady?.(this);
      },
      onConnect,
      onDisconnect,
    });
  }

  setupClient() {
    this.spaces.subscribe(this.client.spaces);
    this.channels.subscribe(this.client.channels);
    this.members.subscribe(this.client.members);
    this.roles.subscribe(this.client.roles);

    // rewrite io to use sophon
    this.client.messages.onCreate((message) => {
      this.messageEmitter.emit(`create/${message.channelId}`, message);
    });

    this.client.messages.onDelete(({ messageId, channelId }) => {
      this.messageEmitter.emit(`delete/${channelId}`, messageId);
    });

    this.client.channels.onCreate((channel) => {
      this.channelEmitter.emit(`create/${channel.spaceId}`, channel);
    });

    this.client.channels.onUpdate((channel) => {
      this.channelEmitter.emit(`update/${channel.spaceId}`, channel);
    });

    this.client.channels.onDelete((channel) => {
      this.channelEmitter.emit(`delete/${channel.spaceId}`, channel.id);
    });

    this.client.spaces.onCreate((space) => {
      this.spaceEmitter.emit('create/@', space);
    });

    this.client.spaces.onUpdate((space) => {
      this.spaceEmitter.emit('update/@', space);
    });

    this.client.spaces.onDelete((space) => {
      this.spaceEmitter.emit('delete/@', space.id);
    });

    this.client.users.onUpdate((user) => {
      if (this.me && user.id === this.me.id) {
        runInAction(() => {
          Object.assign(this.me, user);
        });
      }
    });
  }

  async getMe() {
    if (this.me) return this.me;
    this.me = new ClientUser(this, await this.client.users.me());
    return this.me;
  }
}
