import { requireText } from '../../../../shared/domain/validation';

export interface SharedProgress {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly visibility: 'Private';
  readonly createdAt: string;
}

export function sharedProgress(value: SharedProgress): SharedProgress {
  return Object.freeze({
    ...value,
    title: requireText(value.title, 'Title', 100),
    content: requireText(value.content, 'Progress note', 2000),
    visibility: 'Private',
  });
}
