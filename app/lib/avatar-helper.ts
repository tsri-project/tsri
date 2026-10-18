export interface MemberAvatarMeta {
  id: string;
  initials: string;
  bgStart: string;
  bgEnd: string;
  badgeBg: string;
  badgeIcon: 'crown' | 'sparkles' | 'target' | 'check' | 'scale' | 'award' | 'layers' | 'building' | 'users';
  symbol: string;
  avatarUrl: string;
}

export function createAvatarSvg(
  initials: string,
  bgStart: string = '#062B63',
  bgEnd: string = '#1E40AF',
  roleSymbol: string = '✦'
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <linearGradient id="g_${initials}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgStart}"/>
      <stop offset="100%" stop-color="${bgEnd}"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="36" fill="url(#g_${initials})"/>
  <circle cx="64" cy="64" r="54" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2"/>
  <text x="64" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Prompt', 'Noto Sans Thai', sans-serif" font-size="44" font-weight="700" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">
    ${initials}
  </text>
  <circle cx="102" cy="102" r="18" fill="${bgStart}" stroke="#ffffff" stroke-width="2.5"/>
  <text x="102" y="106" font-family="-apple-system, sans-serif" font-size="14" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">
    ${roleSymbol}
  </text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const TEAM_AVATAR_MAP: Record<string, MemberAvatarMeta> = {
  'pm-01': {
    id: 'pm-01',
    initials: 'อน',
    bgStart: '#062B63',
    bgEnd: '#1d4ed8',
    badgeBg: 'bg-amber-500',
    badgeIcon: 'crown',
    symbol: '👑',
    avatarUrl: createAvatarSvg('อน', '#062B63', '#1d4ed8', '👑'),
  },
  'pm-02': {
    id: 'pm-02',
    initials: 'หน',
    bgStart: '#6b21a8',
    bgEnd: '#9333ea',
    badgeBg: 'bg-purple-500',
    badgeIcon: 'sparkles',
    symbol: '✨',
    avatarUrl: createAvatarSvg('หน', '#6b21a8', '#9333ea', '✨'),
  },
  'pm-03': {
    id: 'pm-03',
    initials: 'กพ',
    bgStart: '#0369a1',
    bgEnd: '#0284c7',
    badgeBg: 'bg-sky-500',
    badgeIcon: 'target',
    symbol: '🎯',
    avatarUrl: createAvatarSvg('กพ', '#0369a1', '#0284c7', '🎯'),
  },
  'pm-04': {
    id: 'pm-04',
    initials: 'พพ',
    bgStart: '#0f766e',
    bgEnd: '#14b8a6',
    badgeBg: 'bg-teal-500',
    badgeIcon: 'check',
    symbol: '✓',
    avatarUrl: createAvatarSvg('พพ', '#0f766e', '#14b8a6', '✓'),
  },
  'adv-01': {
    id: 'adv-01',
    initials: 'นพ',
    bgStart: '#1e293b',
    bgEnd: '#334155',
    badgeBg: 'bg-indigo-600',
    badgeIcon: 'scale',
    symbol: '⚖',
    avatarUrl: createAvatarSvg('นพ', '#1e293b', '#334155', '⚖'),
  },
  'adv-02': {
    id: 'adv-02',
    initials: 'มร',
    bgStart: '#3730a3',
    bgEnd: '#4f46e5',
    badgeBg: 'bg-indigo-500',
    badgeIcon: 'award',
    symbol: '🎓',
    avatarUrl: createAvatarSvg('มร', '#3730a3', '#4f46e5', '🎓'),
  },
  'adv-03': {
    id: 'adv-03',
    initials: 'กบ',
    bgStart: '#047857',
    bgEnd: '#10b981',
    badgeBg: 'bg-emerald-500',
    badgeIcon: 'layers',
    symbol: '📑',
    avatarUrl: createAvatarSvg('กบ', '#047857', '#10b981', '📑'),
  },
  'adv-04': {
    id: 'adv-04',
    initials: 'กศ',
    bgStart: '#0e7490',
    bgEnd: '#06b6d4',
    badgeBg: 'bg-cyan-600',
    badgeIcon: 'building',
    symbol: '🏛',
    avatarUrl: createAvatarSvg('กศ', '#0e7490', '#06b6d4', '🏛'),
  },
  'adv-05': {
    id: 'adv-05',
    initials: 'บพ',
    bgStart: '#b45309',
    bgEnd: '#f59e0b',
    badgeBg: 'bg-amber-500',
    badgeIcon: 'sparkles',
    symbol: '💡',
    avatarUrl: createAvatarSvg('บพ', '#b45309', '#f59e0b', '💡'),
  },
  'adv-06': {
    id: 'adv-06',
    initials: 'อศ',
    bgStart: '#be123c',
    bgEnd: '#f43f5e',
    badgeBg: 'bg-rose-500',
    badgeIcon: 'users',
    symbol: '👥',
    avatarUrl: createAvatarSvg('อศ', '#be123c', '#f43f5e', '👥'),
  },
  'adv-07': {
    id: 'adv-07',
    initials: 'สป',
    bgStart: '#7c3aed',
    bgEnd: '#a855f7',
    badgeBg: 'bg-violet-500',
    badgeIcon: 'award',
    symbol: '🎨',
    avatarUrl: createAvatarSvg('สป', '#7c3aed', '#a855f7', '🎨'),
  },
};

export function getMemberAvatar(idOrEmail?: string): MemberAvatarMeta {
  if (!idOrEmail) {
    return TEAM_AVATAR_MAP['pm-01'];
  }
  if (TEAM_AVATAR_MAP[idOrEmail]) {
    return TEAM_AVATAR_MAP[idOrEmail];
  }
  // Search by email match
  const matchEmail = Object.values(TEAM_AVATAR_MAP).find(
    (m) => m.id.toLowerCase() === idOrEmail.toLowerCase()
  );
  if (matchEmail) return matchEmail;

  // Fallback avatar based on first 2 chars
  const fallbackInitials = idOrEmail.slice(0, 2).toUpperCase();
  return {
    id: idOrEmail,
    initials: fallbackInitials,
    bgStart: '#062B63',
    bgEnd: '#1E40AF',
    badgeBg: 'bg-blue-600',
    badgeIcon: 'crown',
    symbol: '✦',
    avatarUrl: createAvatarSvg(fallbackInitials, '#062B63', '#1E40AF', '✦'),
  };
}
