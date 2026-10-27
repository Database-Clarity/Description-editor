import { describe, expect, it } from 'vitest';
import type { Me } from '../../services/api';
import { canEditLanguage, canEditTooltipFields, canPushLive } from './permissions';

describe('role-aware UI permissions', () => {
  it.each(['maintainer', 'editor', 'trial', 'translator', null] as const)('gates %s', (role) => {
    const user: Me = { id: 1, login: 'user', role, languages: ['fr'] };
    expect(canEditTooltipFields(user)).toBe(
      role === 'maintainer' || role === 'editor' || role === 'trial',
    );
    expect(canEditLanguage(user, 'fr')).toBe(role !== null);
    expect(canEditLanguage(user, 'en')).toBe(role !== null && role !== 'translator');
    expect(canPushLive(user)).toBe(role === 'maintainer' || role === 'editor');
  });
  it('fails closed for missing users and translators without assigned languages', () => {
    expect(canEditLanguage(null, 'en')).toBe(false);
    expect(canPushLive(undefined)).toBe(false);
    expect(canEditLanguage({ id: 1, login: 'x', role: 'translator' }, 'en')).toBe(false);
  });
});
