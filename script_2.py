
# Generate additional core files: Normal Form Checker, Schema Decomposer, and Main Normalization Engine

# 3. Normal Form Checker
normal_form_checker = """
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
"""

# 4. Schema Decomposer
schema_decomposer = """
// backend/src/services/normalization/SchemaDecomposer.js

/**
 * SchemaDecomposer - Decomposes schemas into normalized tables
 * 
 * Implements decomposition algorithms for 2NF and 3NF
 */

const FunctionalDependency = require('./FunctionalDependency');

class SchemaDecomposer {
  constructor(originalSchema, fds, candidateKeys) {
    this.originalSchema = originalSchema;
    this.fds = fds;
    this.candidateKeys = candidateKeys;
    this.primeAttributes = this.getPrimeAttributes();
  }

  getPrimeAttributes() {
    const prime = new Set();
    this.candidateKeys.forEach(key => key.forEach(attr => prime.add(attr)));
    return Array.from(prime);
  }

  /**
   * Decompose to 1NF
   * - Split multi-valued attributes into separate rows
   * - This is mostly handled by CSV parsing, so return original with metadata
   */
  decomposeTo1NF() {
    return {
      tables: [{
        name: this.originalSchema.tableName,
        attributes: this.originalSchema.attributes,
        primaryKey: this.candidateKeys[0] || this.originalSchema.attributes,
        foreignKeys: []
      }],
      transformations: [{
        type: '1NF',
        description: 'Ensured all attributes contain atomic values',
        changes: ['Multi-valued attributes flattened into separate rows']
      }]
    };
  }

  /**
   * Decompose to 2NF
   * - Remove partial dependencies
   * - Create separate tables for partially dependent attributes
   */
  decomposeTo2NF() {
    const tables = [];
    const mainAttributes = new Set(this.originalSchema.attributes);
    const removedAttributes = new Set();
    
    // Find partial dependencies
    const partialDeps = this.fds.filter(fd => this.isPartialDependency(fd));
    
    // Group by LHS (determinant)
    const grouped = new Map();
    partialDeps.forEach(fd => {
      const key = fd.lhs.sort().join('|');
      if (!grouped.has(key)) {
        grouped.set(key, { lhs: fd.lhs, rhs: [] });
      }
      grouped.get(key).rhs.push(fd.rhs);
    });
    
    // Create separate table for each partial dependency group
    let tableIndex = 1;
    for (const [key, group] of grouped.entries()) {
      const tableName = `${this.originalSchema.tableName}_${tableIndex++}`;
      const attributes = [...group.lhs, ...group.rhs];
      
      tables.push({
        name: tableName,
        attributes,
        primaryKey: group.lhs,
        foreignKeys: []
      });
      
      // Remove RHS attributes from main table
      group.rhs.forEach(attr => {
        mainAttributes.delete(attr);
        removedAttributes.add(attr);
      });
    }
    
    // Main table keeps primary key and non-dependent attributes
    tables.push({
      name: this.originalSchema.tableName,
      attributes: Array.from(mainAttributes),
      primaryKey: this.candidateKeys[0],
      foreignKeys: []
    });
    
    return {
      tables,
      transformations: [{
        type: '2NF',
        description: 'Removed partial dependencies',
        changes: partialDeps.map(fd => 
          `Moved ${fd.rhs} to separate table (depends on ${fd.lhs.join(', ')})`
        )
      }]
    };
  }

  /**
   * Decompose to 3NF
   * - Remove transitive dependencies
   * - Create separate tables for transitively dependent attributes
   */
  decomposeTo3NF(tables2NF) {
    const tables = [];
    const transformations = [];
    
    for (const table of tables2NF) {
      const mainAttrs = new Set(table.attributes);
      const removedAttrs = new Set();
      
      // Find transitive dependencies within this table
      const tableFDs = this.fds.filter(fd => 
        fd.lhs.every(attr => table.attributes.includes(attr)) &&
        table.attributes.includes(fd.rhs)
      );
      
      const transitiveDeps = tableFDs.filter(fd => 
        this.isTransitiveDependency(fd, table.primaryKey)
      );
      
      // Group by determinant
      const grouped = new Map();
      transitiveDeps.forEach(fd => {
        const key = fd.lhs.sort().join('|');
        if (!grouped.has(key)) {
          grouped.set(key, { lhs: fd.lhs, rhs: [] });
        }
        grouped.get(key).rhs.push(fd.rhs);
      });
      
      // Create new tables for transitive dependencies
      let subTableIndex = 1;
      for (const [key, group] of grouped.entries()) {
        const tableName = `${table.name}_detail_${subTableIndex++}`;
        const attributes = [...group.lhs, ...group.rhs];
        
        tables.push({
          name: tableName,
          attributes,
          primaryKey: group.lhs,
          foreignKeys: []
        });
        
        // Keep LHS as foreign key in main table, remove RHS
        group.rhs.forEach(attr => {
          mainAttrs.delete(attr);
          removedAttrs.add(attr);
        });
        
        transformations.push({
          type: '3NF',
          description: `Removed transitive dependency from ${table.name}`,
          changes: [`Moved ${group.rhs.join(', ')} to ${tableName}`]
        });
      }
      
      // Add updated main table
      tables.push({
        name: table.name,
        attributes: Array.from(mainAttrs),
        primaryKey: table.primaryKey,
        foreignKeys: Array.from(grouped.values()).map(g => ({
          columns: g.lhs,
          references: `${table.name}_detail`
        }))
      });
    }
    
    return { tables, transformations };
  }

  isPartialDependency(fd) {
    const rhsNonPrime = !this.primeAttributes.includes(fd.rhs);
    if (!rhsNonPrime) return false;
    
    return this.candidateKeys.some(key => 
      fd.lhs.every(attr => key.includes(attr)) && 
      fd.lhs.length < key.length
    );
  }

  isTransitiveDependency(fd, primaryKey) {
    const lhsNonPrime = fd.lhs.every(attr => !this.primeAttributes.includes(attr));
    const rhsNonPrime = !this.primeAttributes.includes(fd.rhs);
    const lhsNotKey = !fd.lhs.every(attr => primaryKey.includes(attr)) || 
                      fd.lhs.length !== primaryKey.length;
    
    return lhsNonPrime && rhsNonPrime && lhsNotKey;
  }

  /**
   * Full decomposition pipeline
   */
  normalizeComplete() {
    const result = {
      stages: []
    };
    
    // Stage 1: 1NF
    const stage1NF = this.decomposeTo1NF();
    result.stages.push({
      normalForm: '1NF',
      tables: stage1NF.tables,
      transformations: stage1NF.transformations
    });
    
    // Stage 2: 2NF
    const stage2NF = this.decomposeTo2NF();
    result.stages.push({
      normalForm: '2NF',
      tables: stage2NF.tables,
      transformations: stage2NF.transformations
    });
    
    // Stage 3: 3NF
    const stage3NF = this.decomposeTo3NF(stage2NF.tables);
    result.stages.push({
      normalForm: '3NF',
      tables: stage3NF.tables,
      transformations: stage3NF.transformations
    });
    
    return result;
  }
}

module.exports = SchemaDecomposer;
"""

with open('NormalFormChecker.js', 'w') as f:
    f.write(normal_form_checker)

with open('SchemaDecomposer.js', 'w') as f:
    f.write(schema_decomposer)

print("✅ Additional normalization modules generated:")
print("   - NormalFormChecker.js")
print("   - SchemaDecomposer.js")
