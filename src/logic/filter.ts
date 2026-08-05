/**
 * The golden-rule gating function — implemented exactly per the contract in
 * docs/GAME_SPEC.md §3.4. Use this to filter both storyCards and quizBank;
 * never write a second, parallel filtering rule anywhere else in the app
 * (CLAUDE.md rule 1).
 */
import type { AppliesTo, UserPath } from '../types';

export function visibleTo<T extends { appliesTo: AppliesTo }>(
  item: T,
  path: UserPath
): boolean {
  if (!item.appliesTo.roles.includes(path.role)) return false;
  if (item.appliesTo.genders && path.gender) {
    return item.appliesTo.genders.includes(path.gender);
  }
  // if the item specifies genders but the user has none set (interns),
  // it should never match, since gendered items never list role 'intern'
  if (item.appliesTo.genders && !path.gender) return false;
  return true;
}
