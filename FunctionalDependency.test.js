// backend/src/__tests__/unit/FunctionalDependency.test.js

import FunctionalDependency from '../../services/normalization/FunctionalDependency.js';

describe('FunctionalDependency', () => {
  const sampleData = [
    { id: 1, name: 'Alice', dept: 'CS' },
    { id: 2, name: 'Bob', dept: 'EE' },
    { id: 3, name: 'Carol', dept: 'ME' },
    { id: 4, name: 'Alice', dept: 'CS' }, // duplicate, intentional
  ];

  test('detects simple functional dependency - id -> name', () => {
    const fd = new FunctionalDependency(sampleData);
    const result = fd.testFD(['id'], 'name');
    expect(result.holds).toBe(true);
    expect(result.confidence).toBeCloseTo(1.0);
  });

  test('detects redundancy in FD detection', () => {
    const fd = new FunctionalDependency(sampleData);
    const fds = fd.detectAll();
    // id -> name and id -> dept should be detected, but not name -> id
    const found = fds.filter(d => d.lhs.includes('id') && d.rhs === 'name');
    expect(found.length).toBeGreaterThan(0);
    const foundDept = fds.filter(d => d.lhs.includes('id') && d.rhs === 'dept');
    expect(foundDept.length).toBeGreaterThan(0);
  });

  test('computes attribute closure', () => {
    const allFds = [
      { lhs: ['A'], rhs: 'B' },
      { lhs: ['B'], rhs: 'C' }
    ];
    const closure = FunctionalDependency.computeClosure(['A'], ['A', 'B', 'C'], allFds);
    expect(closure).toContain('A');
    expect(closure).toContain('B');
    expect(closure).toContain('C');
  });
});
