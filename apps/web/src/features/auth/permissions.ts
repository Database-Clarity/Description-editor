import type { Lang } from '@clarity/core';
import type { User } from '../../services/api';

export function canEditTooltipFields(user: User | null | undefined): boolean {
  return user?.role === 'maintainer' || user?.role === 'editor' || user?.role === 'trial';
}

export function canEditLanguage(user: User | null | undefined, lang: Lang): boolean {
  return (
    canEditTooltipFields(user) ||
    (user?.role === 'translator' && user.languages?.includes(lang) === true)
  );
}

export function canPushLive(user: User | null | undefined): boolean {
  return user?.role === 'maintainer' || user?.role === 'editor';
}
