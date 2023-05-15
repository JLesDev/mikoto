// Generated by Sophon Schema. Do not edit manually!
import { SophonInstance, SenderCore } from '@sophon-js/server';

// extend as you need
export interface SophonContext {}

export interface Channel {
  id: string;
  spaceId: string;
  parentId: string | null;
  name: string;
  order: number;
  lastUpdated: string | null;
  type: string;
}

export interface Space {
  id: string;
  name: string;
  icon: string | null;
  channels: Channel[];
  roles: Role[];
}

export interface Role {
  id: string;
  name: string;
  color: string | null;
  permissions: string;
  position: number;
}

export interface Member {
  id: string;
  spaceId: string;
  user: User;
  roleIds: string[];
}

export interface User {
  id: string;
  name: string;
  avatar: string | null;
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  authorId: string | null;
  author: User | null;
  channelId: string;
}

export interface SpaceUpdateOptions {
  name: string | null;
  icon: string | null;
}

export interface MemberUpdateOptions {
  roleIds: string[];
}

export interface UserUpdateOptions {
  name: string | null;
  avatar: string | null;
}

export interface ChannelCreateOptions {
  name: string;
  type: string;
  parentId: string | null;
}

export interface TypingEvent {
  channelId: string;
  userId: string;
  member: Member | null;
}

export interface ListMessageOptions {
  cursor: string | null;
  limit: number;
}

export interface MessageDeleteEvent {
  messageId: string;
  channelId: string;
}

export interface VoiceToken {
  url: string;
  channelId: string;
  token: string;
}

// Services

export class MainServiceSender {
  constructor(private sender: SenderCore, private room: string) {}
  
}

export interface IMainService {
  spaces: ISpaceService;
  channels: IChannelService;
  members: IMemberService;
  users: IUserService;
  messages: IMessageService;
  roles: IRoleService;
  voice: IVoiceService;
  
}

function fnMainService(
  fn: (props: {
    $: (room: string) => MainServiceSender,
  }) => IMainService,
    meta: { senderFn: (room: string) => MainServiceSender },
) {
  const obj = fn({ $: meta.senderFn });
  return Object.assign(obj, { $: meta.senderFn });
}

export const MainService = Object.assign(fnMainService, {
  SENDER: MainServiceSender,
});


export class SpaceServiceSender {
  constructor(private sender: SenderCore, private room: string) {}
  onCreate(space: Space) {
    this.sender.emit(this.room, 'spaces/onCreate', space);
  }
  onUpdate(space: Space) {
    this.sender.emit(this.room, 'spaces/onUpdate', space);
  }
  onDelete(space: Space) {
    this.sender.emit(this.room, 'spaces/onDelete', space);
  }
}

export interface ISpaceService {
  
  get(ctx: SophonInstance<SophonContext>, id: string): Promise<Space>;
  list(ctx: SophonInstance<SophonContext>): Promise<Space[]>;
  create(ctx: SophonInstance<SophonContext>, name: string): Promise<Space>;
  update(ctx: SophonInstance<SophonContext>, id: string, options: SpaceUpdateOptions): Promise<Space>;
  delete(ctx: SophonInstance<SophonContext>, id: string): Promise<void>;
  join(ctx: SophonInstance<SophonContext>, id: string): Promise<void>;
  leave(ctx: SophonInstance<SophonContext>, id: string): Promise<void>;
}

function fnSpaceService(
  fn: (props: {
    $: (room: string) => SpaceServiceSender,
  }) => ISpaceService,
    meta: { senderFn: (room: string) => SpaceServiceSender },
) {
  const obj = fn({ $: meta.senderFn });
  return Object.assign(obj, { $: meta.senderFn });
}

export const SpaceService = Object.assign(fnSpaceService, {
  SENDER: SpaceServiceSender,
});


export class MemberServiceSender {
  constructor(private sender: SenderCore, private room: string) {}
  
}

export interface IMemberService {
  
  get(ctx: SophonInstance<SophonContext>, spaceId: string, userId: string): Promise<Member>;
  update(ctx: SophonInstance<SophonContext>, spaceId: string, userId: string, roleIds: MemberUpdateOptions): Promise<Member>;
}

function fnMemberService(
  fn: (props: {
    $: (room: string) => MemberServiceSender,
  }) => IMemberService,
    meta: { senderFn: (room: string) => MemberServiceSender },
) {
  const obj = fn({ $: meta.senderFn });
  return Object.assign(obj, { $: meta.senderFn });
}

export const MemberService = Object.assign(fnMemberService, {
  SENDER: MemberServiceSender,
});


export class UserServiceSender {
  constructor(private sender: SenderCore, private room: string) {}
  
}

export interface IUserService {
  
  me(ctx: SophonInstance<SophonContext>): Promise<User>;
  update(ctx: SophonInstance<SophonContext>, options: UserUpdateOptions): Promise<User>;
}

function fnUserService(
  fn: (props: {
    $: (room: string) => UserServiceSender,
  }) => IUserService,
    meta: { senderFn: (room: string) => UserServiceSender },
) {
  const obj = fn({ $: meta.senderFn });
  return Object.assign(obj, { $: meta.senderFn });
}

export const UserService = Object.assign(fnUserService, {
  SENDER: UserServiceSender,
});


export class ChannelServiceSender {
  constructor(private sender: SenderCore, private room: string) {}
  onCreate(channel: Channel) {
    this.sender.emit(this.room, 'channels/onCreate', channel);
  }
  onUpdate(channel: Channel) {
    this.sender.emit(this.room, 'channels/onUpdate', channel);
  }
  onDelete(channel: Channel) {
    this.sender.emit(this.room, 'channels/onDelete', channel);
  }
  onTypingStart(event: TypingEvent) {
    this.sender.emit(this.room, 'channels/onTypingStart', event);
  }
  onTypingStop(event: TypingEvent) {
    this.sender.emit(this.room, 'channels/onTypingStop', event);
  }
}

export interface IChannelService {
  
  get(ctx: SophonInstance<SophonContext>, id: string): Promise<Channel>;
  list(ctx: SophonInstance<SophonContext>, spaceId: string): Promise<Channel[]>;
  create(ctx: SophonInstance<SophonContext>, spaceId: string, options: ChannelCreateOptions): Promise<Channel>;
  delete(ctx: SophonInstance<SophonContext>, id: string): Promise<void>;
  move(ctx: SophonInstance<SophonContext>, id: string, order: number): Promise<void>;
  startTyping(ctx: SophonInstance<SophonContext>, channelId: string, duration: number): Promise<void>;
  stopTyping(ctx: SophonInstance<SophonContext>, channelId: string): Promise<void>;
}

function fnChannelService(
  fn: (props: {
    $: (room: string) => ChannelServiceSender,
  }) => IChannelService,
    meta: { senderFn: (room: string) => ChannelServiceSender },
) {
  const obj = fn({ $: meta.senderFn });
  return Object.assign(obj, { $: meta.senderFn });
}

export const ChannelService = Object.assign(fnChannelService, {
  SENDER: ChannelServiceSender,
});


export class MessageServiceSender {
  constructor(private sender: SenderCore, private room: string) {}
  onCreate(message: Message) {
    this.sender.emit(this.room, 'messages/onCreate', message);
  }
  onUpdate(message: Message) {
    this.sender.emit(this.room, 'messages/onUpdate', message);
  }
  onDelete(event: MessageDeleteEvent) {
    this.sender.emit(this.room, 'messages/onDelete', event);
  }
}

export interface IMessageService {
  
  list(ctx: SophonInstance<SophonContext>, channelId: string, options: ListMessageOptions): Promise<Message[]>;
  send(ctx: SophonInstance<SophonContext>, channelId: string, content: string): Promise<Message>;
  delete(ctx: SophonInstance<SophonContext>, channelId: string, messageId: string): Promise<void>;
}

function fnMessageService(
  fn: (props: {
    $: (room: string) => MessageServiceSender,
  }) => IMessageService,
    meta: { senderFn: (room: string) => MessageServiceSender },
) {
  const obj = fn({ $: meta.senderFn });
  return Object.assign(obj, { $: meta.senderFn });
}

export const MessageService = Object.assign(fnMessageService, {
  SENDER: MessageServiceSender,
});


export class RoleServiceSender {
  constructor(private sender: SenderCore, private room: string) {}
  
}

export interface IRoleService {
  
  
}

function fnRoleService(
  fn: (props: {
    $: (room: string) => RoleServiceSender,
  }) => IRoleService,
    meta: { senderFn: (room: string) => RoleServiceSender },
) {
  const obj = fn({ $: meta.senderFn });
  return Object.assign(obj, { $: meta.senderFn });
}

export const RoleService = Object.assign(fnRoleService, {
  SENDER: RoleServiceSender,
});


export class VoiceServiceSender {
  constructor(private sender: SenderCore, private room: string) {}
  
}

export interface IVoiceService {
  
  join(ctx: SophonInstance<SophonContext>, channelId: string): Promise<VoiceToken>;
}

function fnVoiceService(
  fn: (props: {
    $: (room: string) => VoiceServiceSender,
  }) => IVoiceService,
    meta: { senderFn: (room: string) => VoiceServiceSender },
) {
  const obj = fn({ $: meta.senderFn });
  return Object.assign(obj, { $: meta.senderFn });
}

export const VoiceService = Object.assign(fnVoiceService, {
  SENDER: VoiceServiceSender,
});

