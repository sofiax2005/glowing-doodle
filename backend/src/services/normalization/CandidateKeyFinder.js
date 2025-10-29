
// backend/src/services/normalization/CandidateKeyFinder.js

/**
 * CandidateKeyFinder - Discovers minimal candidate keys
 * 
 * Algorithm: Bottom-up closure computation with pruning
 * Complexity: O(2^m · m²) worst case, but heuristics reduce practical cost
 * 
 * Heuristics to limit exponential blowup:
 * 1. Start with attributes that appear only on LHS of FDs
 * 2. Use closure test to prune non-superkeys early
 * 3. Limit search to combinations of size ≤ 4
 */

const FunctionalDependency = require('./FunctionalDependency');

class CandidateKeyFinder {
  constructor(attributes, functionalDependencies) {
    this.attributes = attributes;
    this.fds = functionalDependencies;
    this.candidateKeys = [];
  }

  /**
   * Find all candidate keys using bottom-up approach
   */
  findCandidateKeys() {
    const allAttrs = new Set(this.attributes);
    const candidateKeys = [];

    // Step 1: Find attributes that MUST be in every key
    // (attributes that never appear on RHS of any FD)
    const mustInclude = this.findMustIncludeAttributes();

    // Step 2: Try combinations starting from mustInclude
    const otherAttrs = this.attributes.filter(a => !mustInclude.includes(a));

    // Check if mustInclude alone is a superkey
    if (this.isSuperkey(mustInclude)) {
      candidateKeys.push([...mustInclude]);
      return candidateKeys;
    }

    // Step 3: Add other attributes incrementally
    const maxSize = Math.min(this.attributes.length, 4); // Limit search

    for (let size = mustInclude.length + 1; size <= maxSize; size++) {
      const combinations = this.generateCombinations(otherAttrs, size - mustInclude.length);

      for (const combo of combinations) {
        const candidateSet = [...mustInclude, ...combo];

        if (this.isSuperkey(candidateSet) && this.isMinimal(candidateSet)) {
          candidateKeys.push(candidateSet);
        }
      }

      // Early termination if we found keys of current size
      if (candidateKeys.length > 0) {
        break;
      }
    }

    // Fallback: if no keys found, use all attributes
    if (candidateKeys.length === 0) {
      candidateKeys.push(this.attributes);
    }

    this.candidateKeys = candidateKeys;
    return candidateKeys;
  }

  /**
   * Check if attribute set is a superkey (closure = all attributes)
   */
  isSuperkey(attributeSet) {
    const closure = FunctionalDependency.computeClosure(
      attributeSet, 
      this.attributes, 
      this.fds
    );
    return closure.length === this.attributes.length;
  }

  /**
   * Check if superkey is minimal (removing any attribute breaks superkey property)
   */
  isMinimal(superkey) {
    for (const attr of superkey) {
      const subset = superkey.filter(a => a !== attr);
      if (this.isSuperkey(subset)) {
        return false; // Not minimal
      }
    }
    return true;
  }

  /**
   * Find attributes that must be in every candidate key
   */
  findMustIncludeAttributes() {
    const rhsAttributes = new Set(this.fds.map(fd => fd.rhs));
    return this.attributes.filter(attr => !rhsAttributes.has(attr));
  }

  /**
   * Generate all combinations of size k from array
   */
  generateCombinations(arr, k) {
    if (k === 0) return [[]];
    if (k > arr.length) return [];

    const results = [];

    function backtrack(start, current) {
      if (current.length === k) {
        results.push([...current]);
        return;
      }

      for (let i = start; i < arr.length; i++) {
        current.push(arr[i]);
        backtrack(i + 1, current);
        current.pop();
      }
    }

    backtrack(0, []);
    return results;
  }
}

module.exports = CandidateKeyFinder;
