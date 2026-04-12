import { DataExport } from './export.js';

describe('DataExport', () => {
  let exporter;

  beforeEach(() => {
    exporter = new DataExport({ version: 1 });
  });

  describe('toJSON()', () => {
    it('serializes state with meta and data sections', () => {
      const state = {
        contractorName: 'Acme Co',
        title: 'Alpha',
        date: '2026-04-12',
        approved: 10,
        underReview: 5,
        total: 20,
        sections: [{ items: [{ count: 5 }] }],
        selectedColor: 'blue',
        isReadonly: false,
      };

      const json = exporter.toJSON(state);
      const parsed = JSON.parse(json);

      expect(parsed).toHaveProperty('meta');
      expect(parsed.meta).toHaveProperty('version', 1);
      expect(parsed).toHaveProperty('data');
      expect(parsed.data).toMatchObject({
        contractorName: 'Acme Co',
        title: 'Alpha',
        date: '2026-04-12',
        approved: 10,
        underReview: 5,
        total: 20,
        sections: [{ items: [{ count: 5 }] }],
      });
    });
  });

  describe('fromJSON()', () => {
    it('parses valid export JSON into normalized state', () => {
      const payload = {
        meta: { version: 1, exportedAt: '2026-04-12T12:00:00Z' },
        data: {
          contractorName: 'Test Co',
          title: 'Project',
          date: '2026-04-12',
          total: '100',
          approved: '40',
          underReview: '20',
          sections: [{ items: [{ count: 40 }] }],
          selectedColor: 'red',
          isReadonly: true,
        },
      };

      const result = exporter.fromJSON(JSON.stringify(payload));

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toMatchObject({
        contractorName: 'Test Co',
        title: 'Project',
        date: '2026-04-12',
        total: 100,
        approved: 40,
        underReview: 20,
        sections: [{ items: [{ count: 40 }] }],
        selectedColor: 'red',
        isReadonly: true,
      });
    });

    it('returns an error for invalid JSON', () => {
      const result = exporter.fromJSON('{invalid json');

      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_JSON');
    });

    it('returns an error when required fields are missing', () => {
      const payload = { data: { approved: 10, underReview: 5, sections: [] } };
      const result = exporter.fromJSON(JSON.stringify(payload));

      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('MISSING_FIELDS');
      expect(result.errors[0].meta.missing).toContain('total');
    });

    it('returns an error when sections is not an array', () => {
      const payload = {
        data: {
          total: 100,
          approved: 50,
          underReview: 20,
          sections: {},
        },
      };
      const result = exporter.fromJSON(JSON.stringify(payload));

      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_SECTIONS');
    });
  });
});