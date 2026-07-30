# Progress Stats Specification

## Purpose
Give a user visibility into how the weight they lift for each exercise has progressed over time within a training cycle.

## Requirements

### Requirement: Per-Exercise Weight History
The statistics view SHALL aggregate, for every exercise that appears either in the selected cycle's day templates or in its logged history with a recorded weight, the chronological list of dated weight entries.

#### Scenario: Exercise with logged weights
- **WHEN** a cycle has one or more workout sessions with a non-empty weight recorded for an exercise
- **THEN** that exercise appears in statistics with its weight entries ordered oldest to newest

#### Scenario: Exercise never logged
- **WHEN** an exercise exists in a day template but has never had a weight recorded
- **THEN** it is excluded from the statistics view

#### Scenario: No data at all
- **WHEN** the cycle has no sessions with any recorded weights
- **THEN** the statistics view shows a "No results recorded for statistics yet" message instead of any chart

### Requirement: Progress Chart Per Exercise
For each exercise with logged data, the statistics view SHALL render a line chart of weight over time plus its all-time maximum weight.

#### Scenario: Multiple data points
- **WHEN** an exercise has two or more weight entries
- **THEN** the chart plots one point per entry connected by lines, in chronological (left-to-right) order, and displays the maximum recorded weight as a badge

#### Scenario: Single data point
- **WHEN** an exercise has exactly one weight entry
- **THEN** a single point is plotted centered on the chart with no connecting line

#### Scenario: Hover for exact value
- **WHEN** the user hovers over a plotted point
- **THEN** a tooltip shows that entry's exact weight in kg

### Requirement: Recent Entries Table
Each exercise's statistics card SHALL list its most recent logged entries in a compact table with an edit shortcut back to the originating session.

#### Scenario: Viewing recent entries
- **WHEN** an exercise has one or more logged weight entries
- **THEN** the card lists up to the 3 most recent entries (newest first) with date and weight, each with an edit action that opens the workout view for that session
