import type { TranslationKey } from "./i18n";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  glyphForCategory,
  isAllowedCategory,
  isAllowedSkill,
} from "./taxonomy";

/* Category metadata is derived from the taxonomy module so there is a single
   source of truth. Re-exported under the original names for existing callers. */
export const CATEGORY_OPTIONS: string[] = CATEGORY_LABELS;

export const CATEGORY_GLYPHS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((category) => [category.label, category.glyph]),
);

export const CATEGORY_LABEL_KEYS: Record<string, TranslationKey> = Object.fromEntries(
  CATEGORIES.map((category) => [category.label, category.translationKey]),
);

export function glyphFor(category: string): string {
  return glyphForCategory(category);
}

export function isCategory(value: string): boolean {
  return isAllowedCategory(value);
}

export { isAllowedSkill };
