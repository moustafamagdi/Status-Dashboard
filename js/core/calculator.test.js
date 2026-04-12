import { Calculator } from '../calculator.js';

describe('Calculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new Calculator();
  });

  describe('remaining()', () => {
    it('should calculate remaining as total - approved', () => {
      expect(calculator.remaining(100, 60)).toBe(40);
    });

    it('should return 0 when approved equals total', () => {
      expect(calculator.remaining(100, 100)).toBe(0);
    });

    it('should return total when approved is 0', () => {
      expect(calculator.remaining(100, 0)).toBe(100);
    });

    it('should handle negative results gracefully', () => {
      const result = calculator.remaining(100, 150);
      expect(result).toBe(-50);
    });

    it('should handle zero total', () => {
      expect(calculator.remaining(0, 0)).toBe(0);
    });
  });

  describe('approvalRate()', () => {
    it('should calculate approval percentage correctly', () => {
      expect(calculator.approvalRate(100, 75)).toBe(75);
    });

    it('should return 0 when total is 0', () => {
      expect(calculator.approvalRate(0, 0)).toBe(0);
    });

    it('should handle decimal rates', () => {
      const rate = calculator.approvalRate(3, 1);
      expect(rate).toBeCloseTo(33.33, 1);
    });

    it('should return 100 when all approved', () => {
      expect(calculator.approvalRate(50, 50)).toBe(100);
    });
  });

  describe('sectionsSum()', () => {
    it('should sum all section item counts', () => {
      const sections = [
        { items: [{ count: 10 }, { count: 20 }] },
        { items: [{ count: 15 }] },
      ];
      expect(calculator.sectionsSum(sections)).toBe(45);
    });

    it('should return 0 for empty sections', () => {
      expect(calculator.sectionsSum([])).toBe(0);
    });

    it('should return 0 for sections with no items', () => {
      const sections = [{ items: [] }, { items: [] }];
      expect(calculator.sectionsSum(sections)).toBe(0);
    });

    it('should handle sections with mixed item counts', () => {
      const sections = [
        { items: [{ count: 5 }, { count: 0 }, { count: 10 }] },
        { items: [{ count: 7 }] },
      ];
      expect(calculator.sectionsSum(sections)).toBe(22);
    });
  });
});
