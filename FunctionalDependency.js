
// backend/src/services/normalization/FunctionalDependency.js

/**
 * FunctionalDependency - Detects functional dependencies from data
 * 
 * Algorithm: Value-pattern heuristics with uniqueness checks
 * Complexity: O(n²·m) where n = rows, m = columns
 * 
 * Limitations:
 * - False positives possible with small datasets
 * - Cannot detect dependencies that hold with >95% confidence
 * - Sensitive to NULL values and data quality
 */

class FunctionalDependency {
  constructor(data, threshold = 0.98) {
    this.data = data; // Array of row objects
    this.attributes = Object.keys(data[0] || {});
    this.threshold = threshold; // FD confidence threshold
    this.dependencies = new Map(); // X -> Y mappings
  }

  /**
   * Detect all functional dependencies in the dataset
   * Returns: Array of { lhs: string[], rhs: string, confidence: number }
   */
  detectAll() {
    const fds = [];

    // For each attribute as potential RHS
    for (const rhs of this.attributes) {
      // Try single attributes as LHS
      for (const lhs of this.attributes) {
        if (lhs !== rhs) {
          const fd = this.testFD([lhs], rhs);
          if (fd.holds) {
            fds.push({ lhs: [lhs], rhs, confidence: fd.confidence });
          }
        }
      }

      // Try pairs of attributes as LHS (limit combinatorial explosion)
      if (this.attributes.length <= 15) {
        for (let i = 0; i < this.attributes.length; i++) {
          for (let j = i + 1; j < this.attributes.length; j++) {
            const lhs = [this.attributes[i], this.attributes[j]];
            if (!lhs.includes(rhs)) {
              const fd = this.testFD(lhs, rhs);
              if (fd.holds) {
                fds.push({ lhs, rhs, confidence: fd.confidence });
              }
            }
          }
        }
      }
    }

    return this.removeRedundant(fds);
  }

  /**
   * Test if X -> Y holds (X functionally determines Y)
   */
  testFD(lhs, rhs) {
    const groups = new Map();
    let violations = 0;

    // Group rows by LHS values
    for (const row of this.data) {
      const lhsKey = lhs.map(attr => row[attr]).join('|');
      const rhsValue = row[rhs];

      if (!groups.has(lhsKey)) {
        groups.set(lhsKey, new Set());
      }
      groups.get(lhsKey).add(rhsValue);
    }

    // Count violations (where LHS maps to multiple RHS values)
    for (const rhsValues of groups.values()) {
      if (rhsValues.size > 1) {
        violations += rhsValues.size - 1;
      }
    }

    const totalPairs = this.data.length;
    const confidence = 1 - (violations / totalPairs);

    return {
      holds: confidence >= this.threshold,
      confidence,
      violations
    };
  }

  /**
   * Remove redundant FDs (if X->Y and X⊂Z->Y, remove Z->Y)
   */
  removeRedundant(fds) {
    const result = [];

    for (const fd of fds) {
      let isRedundant = false;

      for (const other of fds) {
        if (fd === other) continue;

        // Check if other.lhs ⊂ fd.lhs and same RHS
        if (other.rhs === fd.rhs && 
            other.lhs.every(attr => fd.lhs.includes(attr)) &&
            other.lhs.length < fd.lhs.length) {
          isRedundant = true;
          break;
        }
      }

      if (!isRedundant) {
        result.push(fd);
      }
    }

    return result;
  }

  /**
   * Compute attribute closure (X+) under a set of FDs
   * Used for candidate key detection
   */
  static computeClosure(attributes, allAttributes, fds) {
    let closure = new Set(attributes);
    let changed = true;

    while (changed) {
      changed = false;

      for (const fd of fds) {
        // If LHS ⊆ closure, add RHS to closure
        if (fd.lhs.every(attr => closure.has(attr)) && !closure.has(fd.rhs)) {
          closure.add(fd.rhs);
          changed = true;
        }
      }
    }

    return Array.from(closure);
  }
}

module.exports = FunctionalDependency;
