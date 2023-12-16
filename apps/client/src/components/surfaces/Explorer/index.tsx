import { ClientChannel, ClientSpace } from 'mikotojs';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import { useFetchMember, useMikoto } from '../../../hooks';
import { useTabkit } from '../../../store/surface';
import { ContextMenu, modalState, useContextMenuX } from '../../ContextMenu';
import { ChannelContextMenu, CreateChannelModal } from './ChannelContextMenu';
import { ChannelTree } from './ChannelTree';
import { channelToTab, getIconFromChannelType } from './channelToTab';
import { channelToStructuredTree } from './explorerNode';

const StyledTree = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  height: 100%;
`;

function TreebarContextMenu({ space }: { space: ClientSpace }) {
  const setModal = useSetRecoilState(modalState);
  const tabkit = useTabkit();
  return (
    <ContextMenu>
      <ContextMenu.Link
        onClick={() => {
          setModal({ elem: <CreateChannelModal space={space} /> });
        }}
      >
        Create Channel
      </ContextMenu.Link>
      <ContextMenu.Link>Invite People</ContextMenu.Link>
      <ContextMenu.Link
        onClick={() => {
          tabkit.openTab(
            {
              kind: 'search',
              key: 'search',
              spaceId: space.id,
            },
            true,
          );
        }}
      >
        Search
      </ContextMenu.Link>
    </ContextMenu>
  );
}

const TreeHead = styled.div`
  padding: 4px 16px;

  h1 {
    padding-top: 8px;
    font-size: 16px;
  }
`;

function isUnread(lastUpdate: Date | null, ack: Date | null) {
  if (lastUpdate === null || ack === null) return false;
  return lastUpdate.getTime() > ack.getTime();
}

function useAcks(space: ClientSpace) {
  const mikoto = useMikoto();
  const [acks, setAcks] = useState<Record<string, Date>>({});

  useEffect(() => {
    mikoto.client.messages.listUnread({ spaceId: space.id }).then((ur) => {
      setAcks(
        Object.fromEntries(ur.map((u) => [u.channelId, new Date(u.timestamp)])),
      );
    });
  }, [space.id]);

  useEffect(() => {
    const destroy = mikoto.client.messages.onCreate((msg) => {
      const ch = mikoto.channels.get(msg.channelId);
      if (ch?.spaceId !== space.id) return;
      if (msg.author?.id === mikoto.me.id) return;

      ch.lastUpdated = msg.timestamp;
    });
    return () => {
      destroy();
    };
  }, [space.id]);

  return {
    acks,
    ackChannel(channel: ClientChannel) {
      const now = new Date();
      mikoto.client.messages
        .ack({
          channelId: channel.id,
          timestamp: now.toISOString(),
        })
        .then(() => {
          setAcks((xs) => ({ ...xs, [channel.id]: now }));
        });
    },
  };
}

export const Explorer = observer(({ space }: { space: ClientSpace }) => {
  useFetchMember(space);
  const tabkit = useTabkit();
  const { acks, ackChannel } = useAcks(space);
  const nodeContextMenu = useContextMenuX();

  const channelTree = channelToStructuredTree(space.channels, (channel) => ({
    icon: getIconFromChannelType(channel.type),
    id: channel.id,
    text: channel.name,
    unread: isUnread(channel.lastUpdatedDate, acks[channel.id] ?? null),
    onClick(ev) {
      tabkit.openTab(channelToTab(channel), ev.ctrlKey);
      ackChannel(channel);
    },
    onContextMenu: nodeContextMenu(() => (
      <ChannelContextMenu channel={channel} />
    )),
  }));

  // TODO: return loading indicator
  if (space === null) return null;

  return (
    <StyledTree
      onContextMenu={nodeContextMenu(<TreebarContextMenu space={space} />)}
    >
      <TreeHead>
        <h1>{space.name}</h1>
      </TreeHead>
      {/* <TreeBanner /> */}
      <ChannelTree nodes={channelTree.descendant ?? []} />
    </StyledTree>
  );
});
