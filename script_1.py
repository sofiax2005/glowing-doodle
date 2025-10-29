
# Generate comprehensive code for the NormalDB project
# Starting with core backend normalization algorithms

# 1. Functional Dependency Detection Algorithm
functional_dependency_code = """
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
"""

# 2. Candidate Key Finder
candidate_key_code = """
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
"""

# Save all code files
with open('FunctionalDependency.js', 'w') as f:
    f.write(functional_dependency_code)

with open('CandidateKeyFinder.js', 'w') as f:
    f.write(candidate_key_code)

print("✅ Core normalization algorithms generated:")
print("   - FunctionalDependency.js")
print("   - CandidateKeyFinder.js")
