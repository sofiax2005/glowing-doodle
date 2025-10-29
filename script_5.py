
# Generate React D3 visualization components and database initialization

# React visualization component - UNF to 1NF animation
unf_to_1nf_viz = """
// frontend/src/visualizations/RowToEntityMorph.jsx
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { gsap } from 'gsap';

/**
 * RowToEntityMorph - Animates UNF → 1NF transformation
 * Shows rows with nested/multi-valued attributes "exploding" into atomic rows
 */
const RowToEntityMorph = ({ data, isActive }) => {
  const svgRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    if (!data || !isActive) return;

    const container = d3.select(containerRef.current);
    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 600;

    svg.attr('width', width).attr('height', height);

    // Clear previous visualization
    svg.selectAll('*').remove();

    // Create main group
    const g = svg.append('g').attr('transform', 'translate(50, 50)');

    // Sample UNF data (rows with multi-valued attributes)
    const unfData = [
      { id: 1, student: 'Alice', courses: ['CS101', 'CS102', 'MATH201'] },
      { id: 2, student: 'Bob', courses: ['CS101', 'PHYS101'] },
      { id: 3, student: 'Carol', courses: ['MATH201'] }
    ];

    // Flatten to 1NF (one course per row)
    const nfData = unfData.flatMap(row => 
      row.courses.map(course => ({
        id: row.id,
        student: row.student,
        course
      }))
    );

    // Draw UNF rows (grouped with nested courses)
    const rowHeight = 80;
    const unfRows = g.selectAll('.unf-row')
      .data(unfData)
      .enter()
      .append('g')
      .attr('class', 'unf-row')
      .attr('transform', (d, i) => `translate(0, ${i * rowHeight})`);

    // Student names
    unfRows.append('rect')
      .attr('width', 100)
      .attr('height', 60)
      .attr('fill', '#4A90E2')
      .attr('stroke', '#2E5C8A')
      .attr('stroke-width', 2)
      .attr('rx', 5);

    unfRows.append('text')
      .attr('x', 50)
      .attr('y', 35)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', 14)
      .attr('font-weight', 'bold')
      .text(d => d.student);

    // Multi-valued courses (nested bubble)
    unfRows.selectAll('.course-bubble')
      .data(d => d.courses.map(c => ({ student: d.student, course: c })))
      .enter()
      .append('g')
      .attr('class', 'course-bubble')
      .each(function(d, i) {
        const bubble = d3.select(this);
        
        bubble.append('circle')
          .attr('cx', 150 + i * 60)
          .attr('cy', 30)
          .attr('r', 25)
          .attr('fill', '#FF6B6B')
          .attr('stroke', '#C92A2A')
          .attr('stroke-width', 2)
          .attr('opacity', 0.8);

        bubble.append('text')
          .attr('x', 150 + i * 60)
          .attr('y', 35)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', 10)
          .text(d.course);
      });

    // Animate transformation to 1NF after 2 seconds
    setTimeout(() => {
      // Calculate new positions for flattened rows
      const flattenedRows = g.selectAll('.flattened-row')
        .data(nfData)
        .enter()
        .append('g')
        .attr('class', 'flattened-row')
        .attr('transform', (d, i) => `translate(450, ${i * 50})`)
        .attr('opacity', 0);

      // Student cell
      flattenedRows.append('rect')
        .attr('width', 80)
        .attr('height', 40)
        .attr('fill', '#4A90E2')
        .attr('stroke', '#2E5C8A')
        .attr('stroke-width', 1)
        .attr('rx', 3);

      flattenedRows.append('text')
        .attr('x', 40)
        .attr('y', 25)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', 12)
        .text(d => d.student);

      // Course cell
      flattenedRows.append('rect')
        .attr('x', 85)
        .attr('width', 80)
        .attr('height', 40)
        .attr('fill', '#51CF66')
        .attr('stroke', '#2B8A3E')
        .attr('stroke-width', 1)
        .attr('rx', 3);

      flattenedRows.append('text')
        .attr('x', 125)
        .attr('y', 25)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', 12)
        .text(d => d.course);

      // GSAP animation: fade out UNF, fade in 1NF
      const tl = gsap.timeline();
      
      tl.to('.unf-row', {
        opacity: 0.3,
        duration: 1,
        stagger: 0.1
      })
      .to('.course-bubble', {
        scale: 0,
        duration: 0.5,
        stagger: 0.05
      }, '-=0.5')
      .to('.flattened-row', {
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'back.out(1.7)'
      });

      // Add arrow showing transformation
      g.append('path')
        .attr('d', 'M 380 150 L 430 150')
        .attr('stroke', '#333')
        .attr('stroke-width', 3)
        .attr('marker-end', 'url(#arrowhead)')
        .attr('opacity', 0)
        .transition()
        .delay(1000)
        .duration(500)
        .attr('opacity', 1);

      // Define arrowhead marker
      svg.append('defs')
        .append('marker')
        .attr('id', 'arrowhead')
        .attr('markerWidth', 10)
        .attr('markerHeight', 10)
        .attr('refX', 9)
        .attr('refY', 3)
        .attr('orient', 'auto')
        .append('polygon')
        .attr('points', '0 0, 10 3, 0 6')
        .attr('fill', '#333');

    }, 2000);

  }, [data, isActive]);

  return (
    <div ref={containerRef} className="visualization-container">
      <svg ref={svgRef}></svg>
      <div className="viz-caption">
        <h3>UNF → 1NF: Atomicity</h3>
        <p>Multi-valued attributes (courses) split into separate rows. Each cell now contains a single atomic value.</p>
      </div>
    </div>
  );
};

export default RowToEntityMorph;
"""

# TV Channel Database Schema with Seed Data
tv_channel_schema = """
-- database/init-scripts/03-seed-tv-channel-data.sql
-- TV Channel Management System - Denormalized UNF Schema with Sample Data

-- Drop existing tables if any
DROP TABLE IF EXISTS tv_channel_data CASCADE;

-- Create denormalized table (UNF - Unnormalized Form)
-- This intentionally has redundancy to demonstrate normalization
CREATE TABLE tv_channel_data (
    -- Network information (repeated for every program)
    network_id INTEGER,
    network_name VARCHAR(100),
    network_description TEXT,
    
    -- Channel information (repeated for every program)
    channel_id INTEGER,
    channel_name VARCHAR(100),
    channel_frequency INTEGER,
    channel_logo VARCHAR(255),
    
    -- Program information
    program_id INTEGER,
    program_title VARCHAR(200),
    program_description TEXT,
    program_genre VARCHAR(50),
    program_rating VARCHAR(10),
    
    -- Episode information (can be NULL for live programs)
    episode_id INTEGER,
    episode_title VARCHAR(200),
    episode_synopsis TEXT,
    episode_air_date DATE,
    episode_duration INTEGER,
    
    -- Schedule information
    schedule_id INTEGER,
    schedule_start_time TIMESTAMP,
    schedule_end_time TIMESTAMP,
    
    -- Advertisement information (repeated, causing massive redundancy)
    ad_id INTEGER,
    ad_name VARCHAR(200),
    ad_frequency INTEGER,
    ad_start_date DATE,
    ad_end_date DATE,
    
    -- Stream information
    stream_id INTEGER,
    stream_type VARCHAR(20),
    stream_url VARCHAR(255),
    
    -- TRP (Television Rating Points) information
    trp_report_id INTEGER,
    trp_date DATE,
    trp_time_slot VARCHAR(50),
    trp_value DECIMAL(5,2),
    trp_target_audience VARCHAR(100),
    
    -- Device and Household information for TRP
    device_id INTEGER,
    household_id INTEGER,
    household_address TEXT,
    household_region VARCHAR(100),
    household_sample_type VARCHAR(20),
    
    -- Demographics
    demographic_id INTEGER,
    age_group VARCHAR(20),
    gender VARCHAR(10),
    income_level VARCHAR(50)
);

-- Insert sample data with intentional redundancy

-- Network: NewsFirst (ID: 1)
-- Channel: NewsFirst HD (ID: 101)
-- Program: Morning Brief (ID: 1001)
INSERT INTO tv_channel_data VALUES
(1, 'NewsFirst Network', 'Leading news broadcasting network', 
 101, 'NewsFirst HD', 501, 'https://cdn.example.com/newsfirst_logo.png',
 1001, 'Morning Brief', 'Daily morning news roundup', 'News', 'TV-G',
 NULL, NULL, NULL, NULL, NULL,
 5001, '2024-01-15 06:00:00', '2024-01-15 08:00:00',
 2001, 'AutoMax Commercial', 5, '2024-01-01', '2024-03-31',
 3001, 'HD', 'https://stream.example.com/newsfirst_hd',
 4001, '2024-01-15', 'Morning', 4.5, 'Adults 25-54',
 6001, 7001, '123 Main St, Mumbai', 'Mumbai Metro', 'Urban',
 8001, '25-34', 'Male', 'Middle'),
 
(1, 'NewsFirst Network', 'Leading news broadcasting network',
 101, 'NewsFirst HD', 501, 'https://cdn.example.com/newsfirst_logo.png',
 1001, 'Morning Brief', 'Daily morning news roundup', 'News', 'TV-G',
 NULL, NULL, NULL, NULL, NULL,
 5002, '2024-01-16 06:00:00', '2024-01-16 08:00:00',
 2001, 'AutoMax Commercial', 5, '2024-01-01', '2024-03-31',
 3001, 'HD', 'https://stream.example.com/newsfirst_hd',
 4002, '2024-01-16', 'Morning', 4.7, 'Adults 25-54',
 6002, 7002, '456 Oak Ave, Delhi', 'Delhi NCR', 'Urban',
 8002, '35-44', 'Female', 'Upper Middle');

-- Program: Prime Time News (ID: 1002)
INSERT INTO tv_channel_data VALUES
(1, 'NewsFirst Network', 'Leading news broadcasting network',
 101, 'NewsFirst HD', 501, 'https://cdn.example.com/newsfirst_logo.png',
 1002, 'Prime Time News', 'Evening news analysis', 'News', 'TV-PG',
 NULL, NULL, NULL, NULL, NULL,
 5003, '2024-01-15 20:00:00', '2024-01-15 21:00:00',
 2002, 'TechGadgets Ad', 3, '2024-01-01', '2024-06-30',
 3001, 'HD', 'https://stream.example.com/newsfirst_hd',
 4003, '2024-01-15', 'Prime Time', 8.2, 'Adults 25-54',
 6003, 7003, '789 Park Rd, Bangalore', 'Bangalore', 'Urban',
 8003, '45-54', 'Male', 'High');

-- Network: EntertainMax (ID: 2)
-- Channel: EntertainMax Gold (ID: 201)
-- Program: Drama Series - "The Family" (ID: 2001) with Episodes
INSERT INTO tv_channel_data VALUES
(2, 'EntertainMax', 'Premium entertainment channel network',
 201, 'EntertainMax Gold', 601, 'https://cdn.example.com/entertainmax_logo.png',
 2001, 'The Family', 'Drama series about a business family', 'Drama', 'TV-14',
 10001, 'Pilot Episode', 'The family business faces a crisis', '2024-01-10', 45,
 5004, '2024-01-10 21:00:00', '2024-01-10 21:45:00',
 2003, 'Fashion Brand X', 4, '2024-01-01', '2024-12-31',
 3002, 'HD', 'https://stream.example.com/entertainmax_hd',
 4004, '2024-01-10', 'Prime Time', 6.8, 'Adults 18-49',
 6004, 7004, '321 Lake View, Hyderabad', 'Hyderabad', 'Urban',
 8004, '18-24', 'Female', 'Middle'),

(2, 'EntertainMax', 'Premium entertainment channel network',
 201, 'EntertainMax Gold', 601, 'https://cdn.example.com/entertainmax_logo.png',
 2001, 'The Family', 'Drama series about a business family', 'Drama', 'TV-14',
 10002, 'Episode 2: The Deal', 'A major business deal is negotiated', '2024-01-17', 45,
 5005, '2024-01-17 21:00:00', '2024-01-17 21:45:00',
 2003, 'Fashion Brand X', 4, '2024-01-01', '2024-12-31',
 3002, 'HD', 'https://stream.example.com/entertainmax_hd',
 4005, '2024-01-17', 'Prime Time', 7.1, 'Adults 18-49',
 6005, 7005, '555 River St, Chennai', 'Chennai', 'Urban',
 8005, '25-34', 'Male', 'Middle');

-- Program: Comedy Show - "Laugh Out Loud" (ID: 2002)
INSERT INTO tv_channel_data VALUES
(2, 'EntertainMax', 'Premium entertainment channel network',
 201, 'EntertainMax Gold', 601, 'https://cdn.example.com/entertainmax_logo.png',
 2002, 'Laugh Out Loud', 'Stand-up comedy show', 'Comedy', 'TV-MA',
 NULL, NULL, NULL, NULL, NULL,
 5006, '2024-01-12 22:00:00', '2024-01-12 23:00:00',
 2004, 'Beverage Co Ad', 6, '2024-01-01', '2024-02-29',
 3002, 'HD', 'https://stream.example.com/entertainmax_hd',
 4006, '2024-01-12', 'Late Night', 5.3, 'Adults 18-34',
 6006, 7006, '888 Hill Top, Pune', 'Pune', 'Urban',
 8006, '18-24', 'Male', 'Lower Middle');

-- Network: SportsZone (ID: 3)
-- Channel: SportsZone Live (ID: 301)
-- Program: Cricket Match Live (ID: 3001)
INSERT INTO tv_channel_data VALUES
(3, 'SportsZone', 'Sports broadcasting network',
 301, 'SportsZone Live', 701, 'https://cdn.example.com/sportszone_logo.png',
 3001, 'IPL Cricket Live', 'Live cricket match coverage', 'Sports', 'TV-G',
 NULL, NULL, NULL, NULL, NULL,
 5007, '2024-01-14 19:00:00', '2024-01-14 23:00:00',
 2005, 'Sports Shoes Ad', 8, '2024-01-01', '2024-04-30',
 3003, 'HD', 'https://stream.example.com/sportszone_hd',
 4007, '2024-01-14', 'Prime Time', 12.5, 'All Adults',
 6007, 7007, '999 Stadium Rd, Kolkata', 'Kolkata', 'Urban',
 8007, '25-34', 'Male', 'Middle'),

(3, 'SportsZone', 'Sports broadcasting network',
 301, 'SportsZone Live', 701, 'https://cdn.example.com/sportszone_logo.png',
 3001, 'IPL Cricket Live', 'Live cricket match coverage', 'Sports', 'TV-G',
 NULL, NULL, NULL, NULL, NULL,
 5007, '2024-01-14 19:00:00', '2024-01-14 23:00:00',
 2005, 'Sports Shoes Ad', 8, '2024-01-01', '2024-04-30',
 3004, 'SD', 'https://stream.example.com/sportszone_sd',
 4008, '2024-01-14', 'Prime Time', 12.5, 'All Adults',
 6008, 7008, '111 Village Square, Jaipur', 'Jaipur', 'Rural',
 8008, '35-44', 'Male', 'Lower Middle');

-- Additional redundant entries to show normalization benefits
INSERT INTO tv_channel_data VALUES
(1, 'NewsFirst Network', 'Leading news broadcasting network',
 102, 'NewsFirst SD', 502, 'https://cdn.example.com/newsfirst_logo_sd.png',
 1003, 'Weather Update', 'Hourly weather forecast', 'News', 'TV-G',
 NULL, NULL, NULL, NULL, NULL,
 5008, '2024-01-15 07:00:00', '2024-01-15 07:15:00',
 2006, 'Home Appliances', 2, '2024-01-15', '2024-02-15',
 3005, 'SD', 'https://stream.example.com/newsfirst_sd',
 4009, '2024-01-15', 'Morning', 2.1, 'All Adults',
 6009, 7009, '222 Market St, Ahmedabad', 'Ahmedabad', 'Urban',
 8009, '55+', 'Female', 'Middle');

-- Create indexes for query performance
CREATE INDEX idx_network_id ON tv_channel_data(network_id);
CREATE INDEX idx_channel_id ON tv_channel_data(channel_id);
CREATE INDEX idx_program_id ON tv_channel_data(program_id);
CREATE INDEX idx_trp_date ON tv_channel_data(trp_date);

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE tv_channel_data TO normaldb;

-- Add comment explaining the denormalization
COMMENT ON TABLE tv_channel_data IS 
'Denormalized TV channel data (UNF) for demonstration purposes. 
Contains massive redundancy: network and channel info repeated for every program,
TRP data duplicated, advertisements repeated. Perfect for teaching normalization!';
"""

with open('RowToEntityMorph.jsx', 'w') as f:
    f.write(unf_to_1nf_viz)

with open('tv-channel-schema.sql', 'w') as f:
    f.write(tv_channel_schema)

print("✅ React D3 visualization and database schema generated!")
print("   - RowToEntityMorph.jsx (UNF→1NF animation)")
print("   - tv-channel-schema.sql (Denormalized TV channel data)")
