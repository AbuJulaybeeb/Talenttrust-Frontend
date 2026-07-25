import {
  isValidUuid,
  isSpamComment,
  validateReviewerId,
  validateContextId,
  validateRating,
  validateComment,
  validateReputationRatingForm,
  MAX_COMMENT_LENGTH,
  MIN_RATING,
  MAX_RATING,
} from '../reputationValidation';

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

describe('isValidUuid', () => {
  it('accepts a well-formed v4 UUID', () => {
    expect(isValidUuid(VALID_UUID)).toBe(true);
  });

  it('accepts an uppercase UUID', () => {
    expect(isValidUuid(VALID_UUID.toUpperCase())).toBe(true);
  });

  it('rejects a non-UUID string', () => {
    expect(isValidUuid('not-a-uuid')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isValidUuid('')).toBe(false);
  });

  it('rejects a UUID missing a segment', () => {
    expect(isValidUuid('550e8400-e29b-41d4-a716')).toBe(false);
  });
});

describe('isSpamComment', () => {
  it('accepts an empty comment', () => {
    expect(isSpamComment('')).toBe(false);
  });

  it('accepts normal prose', () => {
    expect(isSpamComment('Excellent freelancer, highly recommended!')).toBe(false);
  });

  it('rejects a comment where one character exceeds half the content', () => {
    expect(isSpamComment('aaaaaaaaaa')).toBe(true);
  });

  it('accepts a comment right at the 50% repetition boundary', () => {
    // 5 of 10 chars identical => ratio exactly 0.5, and the check is "> 0.5".
    expect(isSpamComment('aaaaabbbbb')).toBe(false);
  });
});

describe('validateReviewerId', () => {
  it('rejects an empty string', () => {
    expect(validateReviewerId('')).toBe('Reviewer ID is required');
  });

  it('rejects a whitespace-only string', () => {
    expect(validateReviewerId('   ')).toBe('Reviewer ID is required');
  });

  it('accepts a non-empty value', () => {
    expect(validateReviewerId('user-123')).toBeUndefined();
  });
});

describe('validateContextId', () => {
  it('rejects an empty string', () => {
    expect(validateContextId('')).toBe('Context ID is required');
  });

  it('rejects a non-UUID value', () => {
    expect(validateContextId('not-a-uuid')).toBe('Context ID must be a valid UUID');
  });

  it('accepts a valid UUID', () => {
    expect(validateContextId(VALID_UUID)).toBeUndefined();
  });

  it('accepts a valid UUID with surrounding whitespace', () => {
    expect(validateContextId(`  ${VALID_UUID}  `)).toBeUndefined();
  });
});

describe('validateRating', () => {
  it('rejects an empty string', () => {
    expect(validateRating('')).toBe('Rating is required');
  });

  it('rejects a non-numeric string', () => {
    expect(validateRating('abc')).toBe('Rating must be a finite number');
  });

  it('rejects Infinity', () => {
    expect(validateRating('Infinity')).toBe('Rating must be a finite number');
  });

  it('rejects a decimal value', () => {
    expect(validateRating('3.5')).toBe('Rating must be an integer');
  });

  it('rejects a value below the minimum', () => {
    expect(validateRating('0')).toBe(`Rating must be at least ${MIN_RATING}`);
  });

  it('rejects a negative value', () => {
    expect(validateRating('-1')).toBe(`Rating must be at least ${MIN_RATING}`);
  });

  it('rejects a value above the maximum', () => {
    expect(validateRating('6')).toBe(`Rating must be at most ${MAX_RATING}`);
  });

  it('accepts the minimum boundary value', () => {
    expect(validateRating('1')).toBeUndefined();
  });

  it('accepts the maximum boundary value', () => {
    expect(validateRating('5')).toBeUndefined();
  });

  it('accepts a mid-range integer', () => {
    expect(validateRating('3')).toBeUndefined();
  });
});

describe('validateComment', () => {
  it('accepts an empty comment (optional field)', () => {
    expect(validateComment('')).toBeUndefined();
  });

  it('accepts a normal comment', () => {
    expect(validateComment('Great work, on time and on budget.')).toBeUndefined();
  });

  it('rejects a comment over the max length', () => {
    expect(validateComment('a'.repeat(MAX_COMMENT_LENGTH + 1))).toBe(
      `Comment must not exceed ${MAX_COMMENT_LENGTH} characters`,
    );
  });

  it('accepts a comment exactly at the max length', () => {
    // Use varied characters so it doesn't also trip the spam check.
    const comment = 'ab'.repeat(MAX_COMMENT_LENGTH / 2);
    expect(validateComment(comment)).toBeUndefined();
  });

  it('rejects a spam comment', () => {
    expect(validateComment('a'.repeat(20))).toBe(
      'Comment contains excessive repetitive content',
    );
  });
});

describe('validateReputationRatingForm', () => {
  it('returns no errors for a fully valid submission', () => {
    expect(
      validateReputationRatingForm({
        reviewerId: 'user-123',
        contextId: VALID_UUID,
        rating: '5',
        comment: 'Great to work with.',
      }),
    ).toEqual([]);
  });

  it('returns an error per invalid field for an empty submission', () => {
    const errors = validateReputationRatingForm({
      reviewerId: '',
      contextId: '',
      rating: '',
      comment: '',
    });

    expect(errors.map((e) => e.fieldId).sort()).toEqual(['contextId', 'rating', 'reviewerId']);
  });

  it('reports only the rating error when other fields are valid', () => {
    const errors = validateReputationRatingForm({
      reviewerId: 'user-123',
      contextId: VALID_UUID,
      rating: '10',
      comment: '',
    });

    expect(errors).toEqual([
      { fieldId: 'rating', message: `Rating must be at most ${MAX_RATING}` },
    ]);
  });

  it('reports the comment error alongside other invalid fields', () => {
    const errors = validateReputationRatingForm({
      reviewerId: '',
      contextId: VALID_UUID,
      rating: '5',
      comment: 'x'.repeat(MAX_COMMENT_LENGTH + 1),
    });

    expect(errors.map((e) => e.fieldId).sort()).toEqual(['comment', 'reviewerId']);
  });
});
