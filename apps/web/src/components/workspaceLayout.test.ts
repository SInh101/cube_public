import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const styles = readFileSync(
  fileURLToPath(new URL('./face-controls.css', import.meta.url)),
  'utf8',
);

describe('desktop workspace layout', () => {
  it('Cube View側を維持し、操作カラムだけをscrollする', () => {
    expect(styles).toMatch(/\.cube-workspace\s*\{[^}]*overflow:\s*hidden/su);
    expect(styles).toMatch(/\.cube-controls\s*\{[^}]*overflow-y:\s*auto/su);
  });

  it('狭い画面では一列のpage scrollへ戻す', () => {
    expect(styles).toMatch(
      /@media \(max-width:\s*70rem\)[\s\S]*\.cube-controls\s*\{[^}]*overflow-y:\s*visible/u,
    );
  });
});
