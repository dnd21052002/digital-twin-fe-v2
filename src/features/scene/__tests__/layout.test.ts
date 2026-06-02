import { describe, expect, it } from 'vitest';

import { buildSceneLayout } from '../layout';
import type { AssetSummary, SceneManifest } from '../../../lib/api/types';

const manifest = (assets: SceneManifest['assets']): SceneManifest => ({
  id: 'scene-1',
  name: 'Command Hall',
  assets,
});

const asset = (id: string, raw: Record<string, unknown> = {}, category = 'rack'): AssetSummary => ({
  id,
  name: id.toUpperCase(),
  category,
  status: 'online',
  raw: { id, ...raw },
});

describe('buildSceneLayout', () => {
  it('preserves valid manifest asset positions', () => {
    const layout = buildSceneLayout({
      manifest: manifest([
        { id: 'rack-1', type: 'rack', url: '', category: 'rack', raw: { position: [4, 0, -2], rotation: [0, 1.57, 0], scale: [1, 2, 1] } },
      ]),
      assets: [asset('rack-1', {}, 'rack')],
    });

    expect(layout.nodes).toHaveLength(1);
    expect(layout.nodes[0]).toMatchObject({
      assetId: 'rack-1',
      label: 'RACK-1',
      category: 'rack',
      status: 'online',
      position: [4, 0, -2],
      rotation: [0, 1.57, 0],
      scale: [1, 2, 1],
    });
  });

  it('groups rackPosition assets into deterministic rows', () => {
    const layout = buildSceneLayout({
      manifest: manifest([]),
      assets: [
        asset('a2', { rackPosition: 'R2-U01', row: 'R2' }),
        asset('a1', { rackPosition: 'R1-U01', row: 'R1' }),
        asset('a3', { rackPosition: 'R1-U02', row: 'R1' }),
      ],
    });

    expect(layout.rows.map((row) => row.label)).toEqual(['R1', 'R2']);
    expect(layout.nodes.map((node) => [node.assetId, node.rowLabel])).toEqual([
      ['a1', 'R1'],
      ['a3', 'R1'],
      ['a2', 'R2'],
    ]);
    expect(layout.nodes.find((node) => node.assetId === 'a3')?.position[0]).toBeGreaterThan(
      layout.nodes.find((node) => node.assetId === 'a1')?.position[0] ?? 0,
    );
  });

  it('places assets without location in the Unplaced zone', () => {
    const layout = buildSceneLayout({
      manifest: manifest([]),
      assets: [asset('loose-1', {}, 'sensor')],
    });

    expect(layout.zones.map((zone) => zone.label)).toContain('Unplaced');
    expect(layout.nodes[0]).toMatchObject({ assetId: 'loose-1', zoneLabel: 'Unplaced', rowLabel: 'Unplaced' });
  });
});
