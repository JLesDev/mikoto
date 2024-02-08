import { hostHyperRPC } from '@hyperschema/core';
import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { z } from 'zod';

import { env } from '../env';
import { h } from './core';
import {
  ChannelService,
  DocumentService,
  MemberService,
  MessageService,
  RelationService,
  RoleService,
  SpaceService,
  UserService,
  VoiceService,
} from './services';

export * from './models';
export * from './services';

export const MainService = h
  .service({
    channels: ChannelService,
    documents: DocumentService,
    spaces: SpaceService,
    members: MemberService,
    users: UserService,
    messages: MessageService,
    roles: RoleService,
    voice: VoiceService,
    relations: RelationService,

    ping: h.fn({}, z.string()).do(async () => 'pong'),
  })
  .root();

export function boot(cb: () => void) {
  const healthCheckApp = express();
  healthCheckApp.use(cors());
  healthCheckApp.get('/', (req, res) => {
    res.json({ name: 'Mikoto', protocol: 'hyperschema' });
  });
  const httpServer = createServer(healthCheckApp);

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  });

  hostHyperRPC(io, MainService);

  httpServer.listen(env.SERVER_PORT, cb);
}
