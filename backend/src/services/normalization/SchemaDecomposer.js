
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
