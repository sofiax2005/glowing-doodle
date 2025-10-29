// backend/src/__tests__/unit/CandidateKeyFinder.test.js

import CandidateKeyFinder from '../../services/normalization/CandidateKeyFinder.js';

describe('CandidateKeyFinder', () => {
  test('finds candidate keys for simple schema and FDs', () => {
    // Example attributes and FDs:
    const attributes = ['A', 'B', 'C'];
    const fds = [
      { lhs: ['A'], rhs: 'B' },    // A -> B
      { lhs: ['B'], rhs: 'C' },    // B -> C
      { lhs: ['A'], rhs: 'C' }     // A -> C (redundant)
    ];
    const finder = new CandidateKeyFinder(attributes, fds);
    const keys = finder.findCandidateKeys();
    expect(keys.length).toBeGreaterThan(0);
    // Minimal key is A
    expect(keys).toContainEqual(['A']);
  });

  test('does not find incorrect keys', () => {
    // Here, nothing functionally determines everything
    const attributes = ['A', 'B', 'C'];
    const fds = [{ lhs: ['A'], rhs: 'B' }];
    const finder = new CandidateKeyFinder(attributes, fds);
    const keys = finder.findCandidateKeys();
    // The only superkey is actually all attributes
    expect(keys).toContainEqual(['A', 'B', 'C']);
  });

  test('mustInclude attributes work for non-RHS columns', () => {
    const attributes = ['id', 'name', 'dept'];
    const fds = [
      { lhs: ['id'], rhs: 'name' },
      { lhs: ['id'], rhs: 'dept' },
    ]; // id -> name, id -> dept
    const finder = new CandidateKeyFinder(attributes, fds);
    const mustInclude = finder.findMustIncludeAttributes();
    expect(mustInclude).toContain('id');
    expect(mustInclude.length).toBe(1);
  });
});
