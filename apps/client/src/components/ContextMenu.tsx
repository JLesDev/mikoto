import { atom, useRecoilState, useSetRecoilState } from 'recoil';
import styled from 'styled-components';
import useEventListener from '@use-it/event-listener';
import { Modal } from '@mantine/core';
import React, { useRef } from 'react';

interface ContextMenuData {
  position: {
    top: number;
    left: number;
  };
  elem: React.ReactNode;
}

export const contextMenuState = atom<ContextMenuData | null>({
  key: 'contextComponent',
  default: null,
});

const StyledContextMenuOverlay = styled.div`
  position: fixed;
  pointer-events: none;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
`;

const ContextMenuBase = styled.div`
  color: white;
  width: 160px;
  padding: 8px;
  font-size: 14px;
  border-radius: 4px;
  background-color: ${(p) => p.theme.colors.N1100};
`;

const ContextMenuLink = styled.a`
  display: block;
  padding: 6px 8px;
  box-sizing: border-box;
  border-radius: 4px;
  width: 100%;
  &:hover {
    background-color: ${(p) => p.theme.colors.N800};
  }
`;

const StyledContextMenu = styled.div`
  pointer-events: all;
  position: absolute;
  &:focus {
    outline: none;
  }
`;

export function ContextMenuKit() {
  const [context, setContext] = useRecoilState(contextMenuState);

  const ref = useRef<HTMLDivElement>(null);
  useEventListener('mousedown', (ev) => {
    if (ref.current && !ref.current.contains(ev.target as any)) {
      setContext(null);
    }
  });

  useEventListener('keydown', (ev: KeyboardEvent) => {
    if (ev.code === 'Escape') {
      setContext(null);
    }
  });

  return (
    <StyledContextMenuOverlay tabIndex={0}>
      {context && (
        <StyledContextMenu ref={ref} style={{ ...context.position }}>
          {context.elem}
        </StyledContextMenu>
      )}
    </StyledContextMenuOverlay>
  );
}

interface ContextMenuFns {
  destroy(): void;
}

export const ContextMenu = Object.assign(ContextMenuBase, {
  Link: ContextMenuLink,
});

export function useContextMenu(fn: (fns: ContextMenuFns) => React.ReactNode) {
  const setContextMenu = useSetRecoilState(contextMenuState);
  return (ev: React.MouseEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    setContextMenu({
      position: { top: ev.clientY, left: ev.clientX },
      elem: fn({
        destroy() {
          setContextMenu(null);
        },
      }),
    });
  };
}

// modal stuff
interface ModalData {
  title: string;
  elem: React.ReactNode;
}

export const modalState = atom<ModalData | null>({
  key: 'modal',
  default: null,
});

export function ModalKit() {
  const [modal, setModal] = useRecoilState(modalState);

  return (
    <Modal
      opened={modal !== null}
      onClose={() => setModal(null)}
      title={modal?.title}
    >
      {modal?.elem}
    </Modal>
  );
}
