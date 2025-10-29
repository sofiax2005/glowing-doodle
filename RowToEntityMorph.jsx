
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
