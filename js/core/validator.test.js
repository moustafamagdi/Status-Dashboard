import { Validator } from './validator.js';
import { Calculator } from './calculator.js';

describe('Validator', () => {
  let validator;
  let calculator;

  beforeEach(() => {
    calculator = new Calculator();
    validator = new Validator(calculator);
  });

  describe('validate() - Basic State', () => {
    it('should validate a well-formed state', () => {
      const state = {
        total: 100,
        approved: 60,
        underReview: 20,
        sections: [{ items: [{ count: 20 }] }],
      };
      const result = validator.validate(state);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject negative total', () => {
      const state = {
        total: -10,
        approved: 0,
        underReview: 0,
        sections: [],
      };
      const result = validator.validate(state);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'TOTAL_NEGATIVE')).toBe(true);
    });

    it('should reject approved > total', () => {
      const state = {
        total: 100,
        approved: 150,
        underReview: 0,
        sections: [],
      };
      const result = validator.validate(state);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'APPROVED_EXCEEDS_TOTAL')).toBe(true);
    });
  });

  describe('validate() - Total Mismatch', () => {
    it('should reject when total !== approved + remaining', () => {
      const state = {
        total: 100,
        approved: 60,
        underReview: 30,
        sections: [],
      };
      const result = validator.validate(state);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'TOTAL_MISMATCH')).toBe(true);
    });

    it('should accept when total === approved + under review + sections', () => {
      const state = {
        total: 100,
        approved: 60,
        underReview: 20,
        sections: [{ items: [{ count: 20 }] }],
      };
      const result = validator.validate(state);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validate() - Allocations Exceed Remaining', () => {
    it('should reject when underReview + sections > remaining', () => {
      const state = {
        total: 100,
        approved: 60,
        underReview: 30,
        sections: [{ items: [{ count: 20 }] }],
      };
      const result = validator.validate(state);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e) => e.code === 'ALLOCATIONS_EXCEED_REMAINING'),
      ).toBe(true);
    });

    it('should accept when allocations fit in remaining', () => {
      const state = {
        total: 100,
        approved: 60,
        underReview: 20,
        sections: [{ items: [{ count: 20 }] }],
      };
      const result = validator.validate(state);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validate() - Empty/Missing State', () => {
    it('should treat undefined state as all zeros', () => {
      const result = validator.validate(undefined);
      expect(result.isValid).toBe(true);
    });

    it('should treat empty state as all zeros', () => {
      const result = validator.validate({});
      expect(result.isValid).toBe(true);
    });

    it('should handle missing sections array', () => {
      const state = {
        total: 100,
        approved: 60,
        underReview: 40,
      };
      const result = validator.validate(state);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Error Structure', () => {
    it('should include detailed error metadata', () => {
      const state = {
        total: 100,
        approved: 60,
        underReview: 30,
        sections: [],
      };
      const result = validator.validate(state);
      const error = result.errors.find((e) => e.code === 'TOTAL_MISMATCH');

      expect(error).toHaveProperty('field');
      expect(error).toHaveProperty('code');
      expect(error).toHaveProperty('message');
      expect(error).toHaveProperty('meta');
      expect(error.meta).toHaveProperty('total');
      expect(error.meta).toHaveProperty('expectedTotal');
    });
  });
});
