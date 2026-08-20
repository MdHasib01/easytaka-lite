export type LinkKind = 'profile' | 'group' | 'page' | 'post' | 'video' | 'link';

export interface LinkMeta {
  kind: LinkKind;
  label: string;
  identifier?: string;
  hostname: string;
  isFacebook: boolean;
}

const FACEBOOK_HOST = /(^|\.)(facebook\.com|fb\.com|fb\.watch)$/i;

export function parseLinkMeta(rawUrl: string): LinkMeta | null {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  const hostname = url.hostname.replace(/^www\./i, '');
  const isFacebook = FACEBOOK_HOST.test(hostname);

  if (!isFacebook) {
    return { kind: 'link', label: 'External Link', hostname, isFacebook: false };
  }

  const segments = url.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
  const first = segments[0]?.toLowerCase();

  if (first === 'profile.php') {
    const id = url.searchParams.get('id');
    return { kind: 'profile', label: 'Facebook Profile', identifier: id ? `ID: ${id}` : undefined, hostname, isFacebook: true };
  }

  if (first === 'groups') {
    const groupRef = segments[1];
    return { kind: 'group', label: 'Facebook Group', identifier: groupRef ? `/${groupRef}` : undefined, hostname, isFacebook: true };
  }

  if (first === 'watch' || hostname === 'fb.watch') {
    return { kind: 'video', label: 'Facebook Video', hostname, isFacebook: true };
  }

  if (first === 'story.php' || first === 'stories') {
    return { kind: 'post', label: 'Facebook Story', hostname, isFacebook: true };
  }

  if (segments.includes('posts') || segments.includes('permalink.php') || segments.includes('photo') || segments.includes('photo.php') || segments.includes('videos')) {
    return { kind: 'post', label: 'Facebook Post', identifier: first ? `@${first}` : undefined, hostname, isFacebook: true };
  }

  if (segments.length === 1) {
    return { kind: 'profile', label: 'Facebook Profile / Page', identifier: `@${first}`, hostname, isFacebook: true };
  }

  return { kind: 'page', label: 'Facebook Page', identifier: first ? `@${first}` : undefined, hostname, isFacebook: true };
}
