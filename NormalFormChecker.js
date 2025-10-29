
// backend/src/services/normalization/NormalFormChecker.js

/**
 * NormalFormChecker - Validates which normal forms are satisfied
 * 
 * Checks compliance with 1NF, 2NF, 3NF, and BCNF
 */

class NormalFormChecker {
  constructor(schema, fds, candidateKeys) {
    this.schema = schema; // { tableName, attributes }
    this.fds = fds;
    this.candidateKeys = candidateKeys;
    this.primeAttributes = this.findPrimeAttributes();
  }

  /**
   * Prime attributes = attributes that appear in any candidate key
   */
  findPrimeAttributes() {
    const prime = new Set();
    for (const key of this.candidateKeys) {
      key.forEach(attr => prime.add(attr));
    }
    return Array.from(prime);
  }

  /**
   * Check First Normal Form (1NF)
   * Requirements: 
   * - All attributes contain atomic values (no arrays, no nested structures)
   * - Each cell contains single value
   * 
   * Note: We assume CSV data is already in 1NF by structure
   */
  check1NF(sampleData) {
    for (const row of sampleData) {
      for (const [key, value] of Object.entries(row)) {
        // Check if value is array or object
        if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
          return {
            satisfied: false,
            violations: [`Attribute ${key} contains non-atomic value`]
          };
        }
      }
    }

    return { satisfied: true, violations: [] };
  }

  /**
   * Check Second Normal Form (2NF)
   * Requirements:
   * - Must be in 1NF
   * - No partial dependencies (non-prime attributes fully depend on entire candidate key)
   */
  check2NF() {
    const violations = [];

    for (const fd of this.fds) {
      const isPartialDep = this.isPartialDependency(fd);

      if (isPartialDep) {
        violations.push({
          lhs: fd.lhs,
          rhs: fd.rhs,
          reason: `${fd.rhs} partially depends on ${fd.lhs.join(', ')}`
        });
      }
    }

    return {
      satisfied: violations.length === 0,
      violations
    };
  }

  /**
   * Detect partial dependency:
   * X -> Y is partial if:
   * 1. Y is non-prime
   * 2. X is proper subset of some candidate key
   * 3. Y is not in X
   */
  isPartialDependency(fd) {
    const { lhs, rhs } = fd;

    // Check if RHS is non-prime
    if (this.primeAttributes.includes(rhs)) {
      return false;
    }

    // Check if LHS is proper subset of any candidate key
    for (const key of this.candidateKeys) {
      const isProperSubset = lhs.every(attr => key.includes(attr)) && 
                            lhs.length < key.length;

      if (isProperSubset) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check Third Normal Form (3NF)
   * Requirements:
   * - Must be in 2NF
   * - No transitive dependencies (non-prime attrs don't depend on other non-prime attrs)
   */
  check3NF() {
    const violations = [];

    for (const fd of this.fds) {
      const isTransitive = this.isTransitiveDependency(fd);

      if (isTransitive) {
        violations.push({
          lhs: fd.lhs,
          rhs: fd.rhs,
          reason: `${fd.rhs} transitively depends on ${fd.lhs.join(', ')}`
        });
      }
    }

    return {
      satisfied: violations.length === 0,
      violations
    };
  }

  /**
   * Detect transitive dependency:
   * X -> Y is transitive if:
   * 1. X is non-prime
   * 2. Y is non-prime
   * 3. X is not a superkey
   */
  isTransitiveDependency(fd) {
    const { lhs, rhs } = fd;

    // Both LHS and RHS must be non-prime
    const lhsNonPrime = lhs.every(attr => !this.primeAttributes.includes(attr));
    const rhsNonPrime = !this.primeAttributes.includes(rhs);

    if (!lhsNonPrime || !rhsNonPrime) {
      return false;
    }

    // LHS must not be a superkey
    const isSuperkey = this.candidateKeys.some(key => 
      key.length === lhs.length && key.every(attr => lhs.includes(attr))
    );

    return !isSuperkey;
  }

  /**
   * Run all checks and return complete analysis
   */
  analyzeAllForms(sampleData) {
    const result = {
      '1NF': this.check1NF(sampleData),
      '2NF': this.check2NF(),
      '3NF': this.check3NF(),
      currentForm: 'UNF'
    };

    // Determine highest normal form satisfied
    if (result['1NF'].satisfied) {
      result.currentForm = '1NF';
      if (result['2NF'].satisfied) {
        result.currentForm = '2NF';
        if (result['3NF'].satisfied) {
          result.currentForm = '3NF';
        }
      }
    }

    return result;
  }
}

module.exports = NormalFormChecker;
