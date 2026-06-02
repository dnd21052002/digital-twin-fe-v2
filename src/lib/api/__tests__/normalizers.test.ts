import { describe, expect, it } from 'vitest';

import {
  categoryToLabel,
  normalizeCategory,
  normalizeList,
  normalizeSceneManifest,
} from '../normalizers';

describe('normalizers', () => {
  it('normalizes list wrapper variants', () => {
    expect(normalizeList([1, 2])).toEqual([1, 2]);
    expect(normalizeList({ items: ['a'] })).toEqual(['a']);
    expect(normalizeList({ data: ['b'] })).toEqual(['b']);
    expect(normalizeList({ data: { items: ['c'] } })).toEqual(['c']);
    expect(normalizeList({ nope: true })).toEqual([]);
  });

  it('normalizes category strings and objects to safe keys and labels', () => {
    expect(normalizeCategory('hvac_unit')).toBe('hvac_unit');
    expect(normalizeCategory({ name: 'Fire Safety', id: 'fire' })).toBe('fire_safety');
    expect(categoryToLabel({ label: 'Critical Alarms' })).toBe('Critical Alarms');
    expect(categoryToLabel(null)).toBe('Unknown');
  });

  it('normalizes scene manifests from ideal assets or scene mesh texture shape', () => {
    expect(
      normalizeSceneManifest({
        id: 's1',
        name: 'Main scene',
        assets: [{ id: 'a1', type: 'mesh', url: '/mesh.glb', category: { name: 'HVAC' } }],
      }),
    ).toMatchObject({
      id: 's1',
      name: 'Main scene',
      assets: [{ id: 'a1', type: 'mesh', url: '/mesh.glb', category: 'hvac' }],
    });

    expect(
      normalizeSceneManifest({
        scene: { id: 's2', title: 'Fallback scene' },
        meshes: [{ id: 'm1', src: '/m.glb' }],
        textures: [{ id: 't1', url: '/t.png' }],
      }),
    ).toEqual({
      id: 's2',
      name: 'Fallback scene',
      assets: [
        { id: 'm1', type: 'mesh', url: '/m.glb', category: 'mesh', raw: { id: 'm1', src: '/m.glb' } },
        { id: 't1', type: 'texture', url: '/t.png', category: 'texture', raw: { id: 't1', url: '/t.png' } },
      ],
      raw: expect.any(Object),
    });

    expect(normalizeSceneManifest({ id: 'empty' }).assets).toEqual([]);
  });
});
