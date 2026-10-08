import { asRecord, textField } from '../../../shared/infrastructure/browser-storage';
import { SharedProgress, sharedProgress } from '../domain/model/shared-progress.entity';
import { SharedProgressDto } from './shared-progress.dto';
export const CommunityAssembler = {
  toDomain(value: unknown): SharedProgress {
    const row = asRecord(value);
    return sharedProgress({
      id: textField(row, 'id'),
      title: textField(row, 'title'),
      content: textField(row, 'content'),
      visibility: 'Private',
      createdAt: textField(row, 'created_at'),
    });
  },
  toDto(value: SharedProgress): SharedProgressDto {
    return {
      id: value.id,
      title: value.title,
      content: value.content,
      visibility: 'Private',
      created_at: value.createdAt,
    };
  },
};
