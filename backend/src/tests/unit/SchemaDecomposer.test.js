// backend/src/__tests__/unit/SchemaDecomposer.test.js

import SchemaDecomposer from '../../services/normalization/SchemaDecomposer.js';

describe('SchemaDecomposer', () => {
  // Realistic denormalized TV channel table
  const tvSchema = {
    tableName: 'tv_channel_data',
    attributes: [
      'NetworkID', 'NetworkName', 'NetworkDesc',
      'ChannelID', 'ChannelName', 'ChannelFreq', 'ChannelLogo',
      'ProgramID', 'ProgramTitle', 'ProgramGenre', 'ProgramRating',
      'ScheduleID', 'ScheduleStart', 'ScheduleEnd',
      'AdID', 'AdName', 'AdFreq', 'AdStart', 'AdEnd',
      'StreamID', 'StreamType', 'StreamURL',
      'TRPReportID', 'TRPDate', 'TRPTimeSlot', 'TRPValue', 'TRPTarget',
      'DeviceID', 'HouseholdID', 'HouseholdAddress', 'HouseholdRegion', 'HouseholdSampleType',
      'DemographicID', 'AgeGroup', 'Gender', 'IncomeLevel'
    ]
  };

  // Example functional dependencies for news TV schema (simplified for testing)
  const tvFds = [
    { lhs: ['NetworkID'], rhs: 'NetworkName' },
    { lhs: ['NetworkID'], rhs: 'NetworkDesc' },
    { lhs: ['ChannelID'], rhs: 'ChannelName' },
    { lhs: ['ChannelID'], rhs: 'ChannelFreq' },
    { lhs: ['ChannelID'], rhs: 'ChannelLogo' },
    { lhs: ['ProgramID'], rhs: 'ProgramTitle' },
    { lhs: ['ProgramID'], rhs: 'ProgramGenre' },
    { lhs: ['ProgramID'], rhs: 'ProgramRating' },
    { lhs: ['ScheduleID'], rhs: 'ScheduleStart' },
    { lhs: ['ScheduleID'], rhs: 'ScheduleEnd' },
    { lhs: ['AdID'], rhs: 'AdName' },
    { lhs: ['AdID'], rhs: 'AdFreq' },
    { lhs: ['AdID'], rhs: 'AdStart' },
    { lhs: ['AdID'], rhs: 'AdEnd' },
    { lhs: ['StreamID'], rhs: 'StreamType' },
    { lhs: ['StreamID'], rhs: 'StreamURL' },
    { lhs: ['TRPReportID'], rhs: 'TRPDate' },
    { lhs: ['TRPReportID'], rhs: 'TRPTimeSlot' },
    { lhs: ['TRPReportID'], rhs: 'TRPValue' },
    { lhs: ['TRPReportID'], rhs: 'TRPTarget' },
    { lhs: ['DeviceID'], rhs: 'HouseholdID' },
    { lhs: ['HouseholdID'], rhs: 'HouseholdAddress' },
    { lhs: ['HouseholdID'], rhs: 'HouseholdRegion' },
    { lhs: ['HouseholdID'], rhs: 'HouseholdSampleType' },
    { lhs: ['DemographicID'], rhs: 'AgeGroup' },
    { lhs: ['DemographicID'], rhs: 'Gender' },
    { lhs: ['DemographicID'], rhs: 'IncomeLevel' }
  ];

  // Candidate key: composite of all unique IDs (this is typical of denormalized data)
  const tvCandidateKeys = [[
    'NetworkID', 'ChannelID', 'ProgramID', 'ScheduleID', 'AdID',
    'StreamID', 'TRPReportID', 'DeviceID', 'HouseholdID', 'DemographicID'
  ]];

  test('decomposeTo1NF returns initial denormalized table', () => {
    const decomposer = new SchemaDecomposer(tvSchema, tvFds, tvCandidateKeys);
    const res = decomposer.decomposeTo1NF();
    expect(res.tables.length).toBe(1);
    expect(res.tables[0].name).toBe('tv_channel_data');
    expect(res.tables[0].attributes).toContain('NetworkID');
    expect(res.tables[0].primaryKey).toEqual(tvCandidateKeys[0]);
  });

  test('decomposeTo2NF splits partial dependencies into new tables', () => {
    const decomposer = new SchemaDecomposer(tvSchema, tvFds, tvCandidateKeys);
    const res = decomposer.decomposeTo2NF();
    // Expect table with NetworkID, NetworkName, NetworkDesc
    const networkTable = res.tables.find(
      t => t.attributes.includes('NetworkID') && t.attributes.includes('NetworkName') && t.attributes.includes('NetworkDesc')
    );
    expect(networkTable).toBeDefined();

    // Also verify Ad table separated
    const adTable = res.tables.find(t => t.attributes.includes('AdID'));
    expect(adTable).toBeDefined();
    expect(adTable.attributes).toContain('AdName');
    expect(adTable.attributes).toContain('AdFreq');
  });

  test('normalizeComplete generates all normalization stages for TV schema', () => {
    const decomposer = new SchemaDecomposer(tvSchema, tvFds, tvCandidateKeys);
    const result = decomposer.normalizeComplete();
    expect(result.stages.length).toBe(3); // 1NF, 2NF, 3NF
    expect(result.stages[0].normalForm).toBe('1NF');
    expect(result.stages[1].normalForm).toBe('2NF');
    expect(result.stages[2].normalForm).toBe('3NF');
    // 3NF should yield more granular tables for Households, Demographics, etc.
    const demoTable = result.stages[2].tables.find(
      t => t.attributes.includes('DemographicID') && t.attributes.includes('AgeGroup')
    );
    expect(demoTable).toBeDefined();
    expect(demoTable.attributes).toContain('Gender');
    expect(demoTable.attributes).toContain('IncomeLevel');
  });
});
