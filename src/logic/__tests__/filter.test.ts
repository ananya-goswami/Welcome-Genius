/**
 * Unit tests for the exact §3.4 gating contract. This is the single
 * function every content/quiz filter in the app relies on (CLAUDE.md rule 1)
 *, it needs to be bulletproof.
 */
import { describe, it, expect } from 'vitest';
import { visibleTo } from '../filter';
import type { AppliesTo } from '../../types';

const item = (appliesTo: AppliesTo) => ({ appliesTo });

describe('visibleTo (§3.4)', () => {
  it('rejects an item whose roles do not include the path role', () => {
    expect(visibleTo(item({ roles: ['central'] }), { role: 'state', gender: null })).toBe(false);
    expect(visibleTo(item({ roles: ['intern'] }), { role: 'central', gender: 'woman' })).toBe(false);
  });

  it('accepts a role-only item (no genders field) for any gender within that role', () => {
    const noGenderFilter = item({ roles: ['central', 'state'] });
    expect(visibleTo(noGenderFilter, { role: 'central', gender: 'woman' })).toBe(true);
    expect(visibleTo(noGenderFilter, { role: 'central', gender: 'man' })).toBe(true);
    expect(visibleTo(noGenderFilter, { role: 'state', gender: null })).toBe(true); // e.g. before Filter 2 answered
  });

  it('a gendered item matches only its listed gender', () => {
    const womanOnly = item({ roles: ['central', 'state'], genders: ['woman'] });
    expect(visibleTo(womanOnly, { role: 'central', gender: 'woman' })).toBe(true);
    expect(visibleTo(womanOnly, { role: 'central', gender: 'man' })).toBe(false);
  });

  it('a gendered item never matches when the path has no gender set (Intern)', () => {
    const womanOnly = item({ roles: ['central', 'state'], genders: ['woman'] });
    expect(visibleTo(womanOnly, { role: 'intern', gender: null })).toBe(false);
    // even in the pathological case of a gendered item wrongly tagged with
    // an intern role, the contract still refuses a null-gender path
    const badlyTagged = item({ roles: ['intern'], genders: ['woman'] });
    expect(visibleTo(badlyTagged, { role: 'intern', gender: null })).toBe(false);
  });

  it('an item applying to both genders (genders omitted) matches either', () => {
    const adoption = item({ roles: ['central', 'state'] });
    expect(visibleTo(adoption, { role: 'state', gender: 'woman' })).toBe(true);
    expect(visibleTo(adoption, { role: 'state', gender: 'man' })).toBe(true);
  });
});
