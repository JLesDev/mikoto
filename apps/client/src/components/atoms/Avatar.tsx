import styled from 'styled-components';

import { env } from '../../env';

function isUrl(string: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const url = new URL(string);
  } catch (__) {
    return false;
  }
  return true;
}

export function normalizeMediaUrl(url?: string, fallback = '') {
  if (!url) {
    return fallback;
  }
  return isUrl(url) ? url : `${env.PUBLIC_MEDIASERVER_URL}/${url}`;
}

export const Avatar = styled.img.attrs<{ size?: number | string }>((p) => ({
  src: normalizeMediaUrl(p.src, '/images/default_avatar.png'),
  size: p.size ?? 40,
}))`
  user-select: none;
  width: ${(p) => (typeof p.size === 'number' ? `${p.size}px` : p.size)};
  height: ${(p) => (typeof p.size === 'number' ? `${p.size}px` : p.size)};
  border-radius: 8px;
`;
