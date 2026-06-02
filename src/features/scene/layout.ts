import { displayText } from '../../lib/display';
import type { AssetSummary, FacilityNode, SceneManifest } from '../../lib/api/types';

export type SceneVec3 = [number, number, number];
export type SceneNode = { assetId: string; label: string; category: string; status?: string | undefined; position: SceneVec3; rotation?: SceneVec3 | undefined; scale?: SceneVec3 | undefined; zoneLabel: string; rowLabel: string; aisleLabel?: string | undefined };
export type SceneZone = { label: string; position: SceneVec3; size: SceneVec3; aisleA?: string | undefined; aisleB?: string | undefined };
export type SceneRow = { label: string; zoneLabel: string; position: SceneVec3; assetIds: string[]; aisleLabel?: string | undefined };
export type SceneBounds = { min: SceneVec3; max: SceneVec3; center: SceneVec3; size: SceneVec3 };
export type SceneLayout = { nodes: SceneNode[]; zones: SceneZone[]; rows: SceneRow[]; bounds: SceneBounds; thermalGrid: SceneThermalCell[] };
export type SceneThermalCell = { x: number; z: number; heat: number; zoneLabel: string };
export type BuildSceneLayoutInput = { manifest?: SceneManifest | null | undefined; assets: AssetSummary[]; facilityTree?: FacilityNode[] | undefined };
type Recordish = Record<string, unknown>;
const SEP = '::row::';
const AISLE_LABELS = ['Cold', 'Hot'];
const DEFAULT_BOUNDS: SceneBounds = { min: [-8, 0, -8], max: [8, 0, 8], center: [0, 0, 0], size: [16, 0, 16] };
function isRecord(value: unknown): value is Recordish { return typeof value === 'object' && value !== null; }
function stringField(record: Recordish, keys: string[]): string { for (const key of keys) { const value = record[key]; if (typeof value === 'string' && value.trim()) return value.trim(); if (typeof value === 'number') return String(value); if (isRecord(value)) { const nested = stringField(value, ['label', 'name', 'title', 'id', 'code']); if (nested) return nested; } } return ''; }
function vec3(value: unknown): SceneVec3 | undefined { if (Array.isArray(value) && value.length >= 3) { const parsed = value.slice(0, 3).map(Number); if (parsed.every(Number.isFinite)) return parsed as SceneVec3; } if (isRecord(value)) { const parsed = [Number(value.x), Number(value.y), Number(value.z)]; if (parsed.every(Number.isFinite)) return parsed as SceneVec3; } return undefined; }
function manifestRawPosition(raw: unknown): SceneVec3 | undefined { if (!isRecord(raw)) return undefined; return vec3(raw.position) ?? vec3(raw.coordinates) ?? vec3(raw.translation) ?? vec3(raw.transform); }
function manifestRawRotation(raw: unknown): SceneVec3 | undefined { return isRecord(raw) ? vec3(raw.rotation) : undefined; }
function manifestRawScale(raw: unknown): SceneVec3 | undefined { return isRecord(raw) ? vec3(raw.scale) : undefined; }
function assetRaw(asset: AssetSummary): Recordish { return isRecord(asset.raw) ? asset.raw : {}; }
function locationFromAsset(asset: AssetSummary): { zoneLabel: string; rowLabel: string; hasLocation: boolean } { const raw = assetRaw(asset); const rack = stringField(raw, ['rackPosition', 'rack_position', 'rackSlot', 'rack_slot']); const row = stringField(raw, ['row', 'rowLabel', 'row_label', 'aisle']); const rackName = stringField(raw, ['rack']); const location = stringField(raw, ['location', 'site', 'area', 'zone', 'room']); if (rack || rackName || row) return { zoneLabel: location || 'Data Hall', rowLabel: row || rackName || rack.split('-')[0] || 'Rack Row', hasLocation: true }; if (location) return { zoneLabel: location, rowLabel: location, hasLocation: true }; return { zoneLabel: 'Unplaced', rowLabel: 'Unplaced', hasLocation: false }; }
function zoneSort(label: string): string { return label === 'Unplaced' ? 'zzzzzz-unplaced' : label.toLowerCase(); }
function buildBounds(nodes: SceneNode[]): SceneBounds { if (nodes.length === 0) return DEFAULT_BOUNDS; const min: SceneVec3 = [Infinity, 0, Infinity]; const max: SceneVec3 = [-Infinity, 0, -Infinity]; for (const node of nodes) { min[0] = Math.min(min[0], node.position[0] - 1.5); min[2] = Math.min(min[2], node.position[2] - 1.5); max[0] = Math.max(max[0], node.position[0] + 1.5); max[2] = Math.max(max[2], node.position[2] + 1.5); } const size: SceneVec3 = [Math.max(12, max[0] - min[0]), 0, Math.max(12, max[2] - min[2])]; const center: SceneVec3 = [(min[0] + max[0]) / 2, 0, (min[2] + max[2]) / 2]; return { min, max, center, size }; }
function splitKey(key: string): [string, string] { const parts = key.split(SEP); return [parts[0] ?? 'Data Hall', parts[1] ?? 'Row']; }
/** Extract facility-derived zone/row names from facility tree */
function facilityRows(facilityTree?: FacilityNode[]): Map<string, string[]> {
  const result = new Map<string, string[]>();
  if (!facilityTree) return result;
  const walk = (nodes: FacilityNode[], zone: string) => {
    for (const node of nodes) {
      const t = (node.type ?? node.category ?? '').toLowerCase();
      if (t.includes('row') || t.includes('aisle')) {
        const existing = result.get(zone) ?? [];
        existing.push(node.name);
        result.set(zone, existing);
      } else if (t.includes('hall') || t.includes('zone') || t.includes('room') || t.includes('floor') || t.includes('site')) {
        walk(node.children ?? [], node.name);
      } else {
        walk(node.children ?? [], zone || node.name);
      }
    }
  };
  walk(facilityTree, 'Data Hall');
  return result;
}
/** Build synthetic thermal grid from zone bounds */
function buildThermalGrid(zones: SceneZone[]): SceneThermalCell[] {
  const cells: SceneThermalCell[] = [];
  for (const zone of zones) {
    if (zone.label === 'Unplaced') continue;
    const halfX = zone.size[0] / 2;
    const halfZ = zone.size[2] / 2;
    const step = 2.5;
    for (let x = -halfX + 1; x < halfX - 1; x += step) {
      for (let z = -halfZ + 1; z < halfZ - 1; z += step) {
        cells.push({
          x: zone.position[0] + x,
          z: zone.position[2] + z,
          heat: Math.random() * 0.35 + 0.1,
          zoneLabel: zone.label,
        });
      }
    }
  }
  return cells;
}
export function buildSceneLayout({ manifest, assets, facilityTree }: BuildSceneLayoutInput): SceneLayout {
  const assetById = new Map(assets.map((asset) => [asset.id, asset])); const nodes: SceneNode[] = []; const placedIds = new Set<string>();
  // Phase 1: manifest-placed assets
  for (const manifestAsset of manifest?.assets ?? []) { const position = manifestRawPosition(manifestAsset.raw); if (!position) continue; const asset = assetById.get(manifestAsset.id); const loc = asset ? locationFromAsset(asset) : { zoneLabel: 'Manifest', rowLabel: 'Manifest', hasLocation: true }; const node: SceneNode = { assetId: manifestAsset.id, label: displayText(asset?.name ?? manifestAsset.raw, manifestAsset.id), category: asset?.category ?? manifestAsset.category ?? manifestAsset.type ?? 'unknown', status: asset?.status, position, zoneLabel: loc.zoneLabel, rowLabel: loc.rowLabel }; const rotation = manifestRawRotation(manifestAsset.raw); const scale = manifestRawScale(manifestAsset.raw); if (rotation) node.rotation = rotation; if (scale) node.scale = scale; nodes.push(node); placedIds.add(manifestAsset.id); }
  // Phase 2: facility-driven grouping for unplaced assets
  const facilityRowMap = facilityRows(facilityTree);
  const groups = new Map<string, AssetSummary[]>();
  for (const asset of assets.filter((a) => !placedIds.has(a.id)).sort((a, b) => a.id.localeCompare(b.id))) {
    const loc = locationFromAsset(asset);
    let zoneLabel = loc.zoneLabel;
    let rowLabel = loc.rowLabel;
    if (!loc.hasLocation && facilityRowMap.size > 0) {
      const firstEntry = [...facilityRowMap.entries()][0];
      if (firstEntry) {
        zoneLabel = firstEntry[0];
        rowLabel = firstEntry[1][0] ?? 'Row A';
      }
    }
    const key = `${zoneLabel}${SEP}${rowLabel}`;
    groups.set(key, [...(groups.get(key) ?? []), asset]);
  }
  // Merge facility-derived rows that have no assets yet
  for (const [zone, rows] of facilityRowMap) {
    for (const row of rows) {
      const key = `${zone}${SEP}${row}`;
      if (!groups.has(key)) groups.set(key, []);
    }
  }
  const groupKeys = [...groups.keys()].sort((a, b) => { const [az, ar] = splitKey(a); const [bz, br] = splitKey(b); return zoneSort(az).localeCompare(zoneSort(bz)) || ar.localeCompare(br); });
  groupKeys.forEach((key, groupIndex) => { const [zoneLabel, rowLabel] = splitKey(key); const rowZ = groupIndex * 4 - Math.max(0, groupKeys.length - 1) * 2; const sorted = (groups.get(key) ?? []).sort((a, b) => { const ar = stringField(assetRaw(a), ['rackPosition', 'rack_position', 'rack', 'location']) || a.id; const br = stringField(assetRaw(b), ['rackPosition', 'rack_position', 'rack', 'location']) || b.id; return ar.localeCompare(br, undefined, { numeric: true }) || a.id.localeCompare(b.id); }); sorted.forEach((asset, index) => nodes.push({ assetId: asset.id, label: displayText(asset.name, asset.id), category: asset.category ?? 'unknown', status: asset.status, position: [(index - (sorted.length - 1) / 2) * 2.4, 0, rowZ], zoneLabel, rowLabel })); });
  // Build rows with aisle labels (alternating cold/hot)
  const rows: SceneRow[] = []; const rowZoneIndex = new Map<string, number>();
  for (const key of groupKeys) {
    const [zoneLabel, rowLabel] = splitKey(key);
    const rowNodes = nodes.filter((node) => node.zoneLabel === zoneLabel && node.rowLabel === rowLabel);
    const zoneKey = zoneLabel;
    const idx = rowZoneIndex.get(zoneKey) ?? 0;
    rowZoneIndex.set(zoneKey, idx + 1);
    const aisleLabel = AISLE_LABELS[idx % 2];
    rows.push({ label: rowLabel, zoneLabel, position: rowNodes[0]?.position ?? [0, 0, 0], assetIds: rowNodes.map((node) => node.assetId), aisleLabel });
    for (const node of rowNodes) node.aisleLabel = aisleLabel;
  }
  for (const node of nodes) if (!rows.some((row) => row.label === node.rowLabel && row.zoneLabel === node.zoneLabel)) { const aisleLabel = AISLE_LABELS[0]; rows.push({ label: node.rowLabel, zoneLabel: node.zoneLabel, position: node.position, assetIds: [node.assetId], aisleLabel }); node.aisleLabel = aisleLabel; }
  rows.sort((a, b) => zoneSort(a.zoneLabel).localeCompare(zoneSort(b.zoneLabel)) || a.label.localeCompare(b.label));
  const zones = [...new Set(nodes.map((node) => node.zoneLabel))].sort((a, b) => zoneSort(a).localeCompare(zoneSort(b))).map<SceneZone>((label) => { const bounds = buildBounds(nodes.filter((node) => node.zoneLabel === label)); const zoneRows = rows.filter((r) => r.zoneLabel === label); const aisleA = zoneRows.find((r) => r.aisleLabel === 'Cold')?.label; const aisleB = zoneRows.find((r) => r.aisleLabel === 'Hot')?.label; return { label, position: bounds.center, size: [bounds.size[0] + 2, 0, bounds.size[2] + 2], aisleA, aisleB }; });
  const thermalGrid = buildThermalGrid(zones);
  return { nodes, zones, rows, bounds: buildBounds(nodes), thermalGrid };
}
