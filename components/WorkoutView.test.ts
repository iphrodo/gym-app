import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('WorkoutView exercise inputs', () => {
  it('sets an explicit dark text color on the zinc-50 inputs', () => {
    const source = readFileSync(join(__dirname, 'WorkoutView.tsx'), 'utf-8');
    const inputBlocks = source.split('<input').slice(1);
    const inputClassNames = inputBlocks
      .map(block => block.match(/className="([^"]*)"/)?.[1])
      .filter((className): className is string => !!className && className.includes('bg-zinc-50'));

    expect(inputClassNames.length).toBeGreaterThan(0);
    for (const className of inputClassNames) {
      expect(className).toContain('text-zinc-900');
    }
  });
});
