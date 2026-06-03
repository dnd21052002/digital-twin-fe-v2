import { describe, expect, it } from 'vitest';

import { buildSceneLayout } from '../layout';
import type { AssetSummary, SceneManifest } from '../../../lib/api/types';

const manifest = (assets: SceneManifest['assets']): SceneManifest => ({
  id: 'scene-1',
  name: 'Command Hall',
  assets,
});

const asset = (id: string, raw: Record<string, unknown> = {}, category = 'rack', name?: string): AssetSummary => ({
  id,
  name: name ?? id.toUpperCase(),
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

  it('nests server assets inside their parent rack at RU positions', () => {
    const layout = buildSceneLayout({
      manifest: manifest([]),
      assets: [
        asset('RACK-050', { row: 'A' }, 'rack', 'RACK-050'),
        asset('RACK-050-SRV-02', {}, 'server', 'Server 2 in RACK-050'),
        asset('RACK-050-SRV-19', {}, 'server', 'Server 19 in RACK-050'),
      ],
    });

    const rack = layout.nodes.find((n) => n.assetId === 'RACK-050');
    const srv02 = layout.nodes.find((n) => n.assetId === 'RACK-050-SRV-02');
    const srv19 = layout.nodes.find((n) => n.assetId === 'RACK-050-SRV-19');

    expect(rack).toBeDefined();
    expect(srv02?.parentRackId).toBe('RACK-050');
    expect(srv19?.parentRackId).toBe('RACK-050');
    expect(srv02?.position[1]).toBeGreaterThan(0);
    expect(srv19?.position[1]).toBeGreaterThan(srv02!.position[1]);
    expect(srv02?.ruPosition).toBe(2);
    expect(srv19?.ruPosition).toBe(19);
  });

  it('places multiple racks in a 2-row cold/hot aisle pattern', () => {
    const racks = Array.from({ length: 10 }, (_, i) =>
      asset(`RACK-${String(i + 1).padStart(3, '0')}`, { row: 'A' }, 'rack', `RACK-${String(i + 1).padStart(3, '0')}`),
    );
    const layout = buildSceneLayout({
      manifest: manifest([]),
      assets: racks,
    });

    const placedRacks = layout.nodes.filter((n) => n.category === 'rack');
    expect(placedRacks).toHaveLength(10);

    const coldRacks = placedRacks.filter((r) => r.aisleLabel === 'Cold');
    const hotRacks = placedRacks.filter((r) => r.aisleLabel === 'Hot');
    expect(coldRacks.length).toBeGreaterThan(0);
    expect(hotRacks.length).toBeGreaterThan(0);

    const coldZ = coldRacks[0]!.position[2];
    const hotZ = hotRacks[0]!.position[2];
    expect(Math.abs(coldZ - hotZ)).toBeGreaterThan(1);
  });

  it('places standalone cooling/UPS assets in their own category rows', () => {
    const layout = buildSceneLayout({
      manifest: manifest([]),
      assets: [
        asset('RACK-001', {}, 'rack'),
        asset('COOL-01', {}, 'cooling', 'CRAC 01'),
        asset('UPS-01', {}, 'ups', 'Battery Bank'),
      ],
    });

    const cool = layout.nodes.find((n) => n.assetId === 'COOL-01');
    const ups = layout.nodes.find((n) => n.assetId === 'UPS-01');
    expect(cool?.category).toBe('cooling');
    expect(ups?.category).toBe('ups');
    expect(cool?.position[2]).not.toBe(ups?.position[2]);
  });

  it('places standalone assets in a dedicated category row', () => {
    const layout = buildSceneLayout({
      manifest: manifest([]),
      assets: [asset('loose-1', {}, 'sensor')],
    });

    const looseNode = layout.nodes.find((n) => n.assetId === 'loose-1');
    expect(looseNode).toBeDefined();
    expect(looseNode?.category).toBe('sensor');
    expect(looseNode?.rowLabel).toContain('sensor');
  });
});
