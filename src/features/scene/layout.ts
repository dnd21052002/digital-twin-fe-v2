import { displayText } from '../../lib/display';
import type { AssetSummary, FacilityNode, SceneManifest } from '../../lib/api/types';

export type SceneVec3 = [number, number, number];
export type SceneNode = { assetId: string; label: string; category: string; status?: string | undefined; position: SceneVec3; rotation?: SceneVec3 | undefined; scale?: SceneVec3 | undefined; zoneLabel: string; rowLabel: string; aisleLabel?: string | undefined; parentRackId?: string | undefined; ruPosition?: number | undefined };
export type SceneZone = { label: string; position: SceneVec3; size: SceneVec3; aisleA?: string | undefined; aisleB?: string | undefined };
export type SceneRow = { label: string; zoneLabel: string; position: SceneVec3; assetIds: string[]; aisleLabel?: string | undefined };
export type SceneBounds = { min: SceneVec3; max: SceneVec3; center: SceneVec3; size: SceneVec3 };
export type SceneLayout = { nodes: SceneNode[]; zones: SceneZone[]; rows: SceneRow[]; bounds: SceneBounds; thermalGrid: SceneThermalCell[] };
export type SceneThermalCell = { x: number; z: number; heat: number; zoneLabel: string };
export type BuildSceneLayoutInput = { manifest?: SceneManifest | null | undefined; assets: AssetSummary[]; facilityTree?: FacilityNode[] | undefined };
type Recordish = Record<string, unknown>;

const RACK_WIDTH = 1.15;
const AISLE_WIDTH = 2.4;
const RACK_GAP = 0.3;
const RACKS_PER_ROW = 8;
const RU_HEIGHT = 0.28;

function isRecord(value: unknown): value is Recordish { return typeof value === 'object' && value !== null; }
function stringField(record: Recordish, keys: string[]): string { for (const key of keys) { const value = record[key]; if (typeof value === 'string' && value.trim()) return value.trim(); if (typeof value === 'number') return String(value); if (isRecord(value)) { const nested = stringField(value, ['label', 'name', 'title', 'id', 'code']); if (nested) return nested; } } return ''; }
function vec3(value: unknown): SceneVec3 | undefined { if (Array.isArray(value) && value.length >= 3) { const parsed = value.slice(0, 3).map(Number); if (parsed.every(Number.isFinite)) return parsed as SceneVec3; } if (isRecord(value)) { const parsed = [Number(value.x), Number(value.y), Number(value.z)]; if (parsed.every(Number.isFinite)) return parsed as SceneVec3; } return undefined; }
function manifestRawPosition(raw: unknown): SceneVec3 | undefined { if (!isRecord(raw)) return undefined; return vec3(raw.position) ?? vec3(raw.coordinates) ?? vec3(raw.translation) ?? vec3(raw.transform); }
function manifestRawRotation(raw: unknown): SceneVec3 | undefined { return isRecord(raw) ? vec3(raw.rotation) : undefined; }
function manifestRawScale(raw: unknown): SceneVec3 | undefined { return isRecord(raw) ? vec3(raw.scale) : undefined; }
function assetRaw(asset: AssetSummary): Recordish { return isRecord(asset.raw) ? asset.raw : {}; }

/** Extract parent rack id from child asset name (e.g. RACK-050-SRV-02 → RACK-050) */
function parentRackId(asset: AssetSummary): string | undefined {
  const raw = assetRaw(asset);
  const explicit = stringField(raw, ['parentRack', 'parent_rack', 'parentId', 'parent_id', 'rackId', 'rack_id']);
  if (explicit) return explicit;
  const candidates = [asset.tag, asset.id, asset.name];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const match = candidate.match(/^(RACK[-_]?\d+)/i);
    if (match?.[1]) return match[1].toUpperCase().replace(/[-_]/g, '-');
  }
  return undefined;
}

function isRackCategory(category: string): boolean {
  const key = category.toLowerCase();
  return key.includes('rack') || key.includes('cabinet') || key.includes('enclosure');
}

/** Parse RU number from asset name (e.g. SRV-02, SRV-19) */
function parseRuPosition(asset: AssetSummary): number {
  const raw = assetRaw(asset);
  const explicit = Number(stringField(raw, ['ru', 'ruPosition', 'ru_position', 'slot', 'position']));
  if (Number.isFinite(explicit) && explicit > 0) return explicit;
  const candidates = [asset.id, asset.tag, asset.name];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const match = candidate.match(/(?:SRV|BLADE|SERVER|UNIT|U)[-_ ]?(\d+)/i);
    if (match?.[1]) {
      const n = Number(match[1]);
      if (Number.isFinite(n) && n > 0) return n;
    }
  }
  return 1;
}

function locationFromAsset(asset: AssetSummary): { zoneLabel: string; rowLabel: string; hasLocation: boolean } {
  const raw = assetRaw(asset);
  const row = stringField(raw, ['row', 'rowLabel', 'row_label', 'aisle']);
  const location = stringField(raw, ['location', 'site', 'area', 'zone', 'room']);
  if (row) return { zoneLabel: location || 'Data Hall', rowLabel: row, hasLocation: true };
  if (location) return { zoneLabel: location, rowLabel: location, hasLocation: true };
  return { zoneLabel: 'Unplaced', rowLabel: 'Unplaced', hasLocation: false };
}

function zoneSort(label: string): string { return label === 'Unplaced' ? 'zzzzzz-unplaced' : label.toLowerCase(); }

function buildBounds(nodes: SceneNode[]): SceneBounds {
  if (nodes.length === 0) return { min: [-8, 0, -8], max: [8, 0, 8], center: [0, 0, 0], size: [16, 0, 16] };
  const min: SceneVec3 = [Infinity, 0, Infinity];
  const max: SceneVec3 = [-Infinity, 0, -Infinity];
  for (const node of nodes) {
    min[0] = Math.min(min[0], node.position[0] - 1.5);
    min[2] = Math.min(min[2], node.position[2] - 1.5);
    max[0] = Math.max(max[0], node.position[0] + 1.5);
    max[2] = Math.max(max[2], node.position[2] + 1.5);
  }
  const size: SceneVec3 = [Math.max(12, max[0] - min[0]), 0, Math.max(12, max[2] - min[2])];
  const center: SceneVec3 = [(min[0] + max[0]) / 2, 0, (min[2] + max[2]) / 2];
  return { min, max, center, size };
}

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
  const assetById = new Map(assets.map((asset) => [asset.id, asset]));
  const nodes: SceneNode[] = [];
  const placedIds = new Set<string>();
  const rackPositions = new Map<string, SceneVec3>();

  // Phase 1: manifest-placed assets (use positions directly)
  for (const manifestAsset of manifest?.assets ?? []) {
    const position = manifestRawPosition(manifestAsset.raw);
    if (!position) continue;
    const asset = assetById.get(manifestAsset.id);
    const loc = asset ? locationFromAsset(asset) : { zoneLabel: 'Manifest', rowLabel: 'Manifest', hasLocation: true };
    const node: SceneNode = {
      assetId: manifestAsset.id,
      label: displayText(asset?.name ?? manifestAsset.raw, manifestAsset.id),
      category: asset?.category ?? manifestAsset.category ?? manifestAsset.type ?? 'unknown',
      status: asset?.status,
      position,
      zoneLabel: loc.zoneLabel,
      rowLabel: loc.rowLabel,
    };
    const rotation = manifestRawRotation(manifestAsset.raw);
    const scale = manifestRawScale(manifestAsset.raw);
    if (rotation) node.rotation = rotation;
    if (scale) node.scale = scale;
    nodes.push(node);
    placedIds.add(manifestAsset.id);
    if (asset && isRackCategory(asset.category ?? '')) {
      rackPositions.set(manifestAsset.id, position);
    }
  }

  // Phase 2: separate racks from non-rack assets
  const unplacedAssets = assets.filter((a) => !placedIds.has(a.id));
  const rackAssets = unplacedAssets.filter((a) => isRackCategory(a.category ?? ''));
  const nonRackAssets = unplacedAssets.filter((a) => !isRackCategory(a.category ?? ''));

  // Group racks by zone
  const facilityRowMap = facilityRows(facilityTree);
  const racksByZone = new Map<string, AssetSummary[]>();
  for (const rack of rackAssets) {
    const loc = locationFromAsset(rack);
    let zone = loc.zoneLabel;
    if (!loc.hasLocation && facilityRowMap.size > 0) {
      const firstEntry = [...facilityRowMap.entries()][0];
      if (firstEntry) zone = firstEntry[0];
    }
    if (zone === 'Unplaced' && facilityRowMap.size > 0) {
      const firstEntry = [...facilityRowMap.entries()][0];
      if (firstEntry) zone = firstEntry[0];
    }
    if (zone === 'Unplaced') zone = 'Data Hall';
    const list = racksByZone.get(zone) ?? [];
    list.push(rack);
    racksByZone.set(zone, list);
  }

  // Place racks in grid: 2 rows per zone, separated by aisle, racks side-by-side
  for (const [zoneLabel, zoneRacks] of racksByZone) {
    const sorted = [...zoneRacks].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
    const rackCount = sorted.length;
    const totalRackRowWidth = rackCount * (RACK_WIDTH + RACK_GAP);
    const startX = -totalRackRowWidth / 2 + RACK_WIDTH / 2;

    // Split racks into 2 rows (cold/hot aisle pair)
    for (const [i, rack] of sorted.entries()) {
      const isColdRow = Math.floor(i / RACKS_PER_ROW) % 2 === 0;
      const rowPos = Math.floor(i / RACKS_PER_ROW);
      const indexInRow = i % RACKS_PER_ROW;
      const x = startX + indexInRow * (RACK_WIDTH + RACK_GAP);
      const z = isColdRow ? -AISLE_WIDTH / 2 : AISLE_WIDTH / 2;
      const position: SceneVec3 = [x, 0, z];
      const rowLabel = `Row ${String.fromCharCode(65 + rowPos)}`;
      const aisleLabel = isColdRow ? 'Cold' : 'Hot';

      nodes.push({
        assetId: rack.id,
        label: displayText(rack.name, rack.id),
        category: rack.category ?? 'rack',
        status: rack.status,
        position,
        zoneLabel,
        rowLabel,
        aisleLabel,
      });
      rackPositions.set(rack.id, position);
      placedIds.add(rack.id);
    }
  }

  // Place non-rack assets:
  // - If has parentRackId AND parent is placed → nest inside rack at RU position
  // - Otherwise → place in last unplaced row
  const standaloneAssets: AssetSummary[] = [];
  for (const asset of nonRackAssets) {
    const parent = parentRackId(asset);
    if (parent && rackPositions.has(parent)) {
      const rackPos = rackPositions.get(parent)!;
      const ru = parseRuPosition(asset);
      const yOffset = 0.3 + (ru - 1) * RU_HEIGHT + RU_HEIGHT / 2;
      // Find parent rack's row/zone
      const parentNode = nodes.find((n) => n.assetId === parent);
      nodes.push({
        assetId: asset.id,
        label: displayText(asset.name, asset.id),
        category: asset.category ?? 'unknown',
        status: asset.status,
        position: [rackPos[0], yOffset, rackPos[2] + 0.52],
        zoneLabel: parentNode?.zoneLabel ?? 'Data Hall',
        rowLabel: parentNode?.rowLabel ?? 'Rack',
        aisleLabel: parentNode?.aisleLabel,
        parentRackId: parent,
        ruPosition: ru,
      });
      placedIds.add(asset.id);
    } else {
      standaloneAssets.push(asset);
    }
  }

  // Place standalone (cooling, UPS, sensors, etc.) in dedicated rows
  if (standaloneAssets.length > 0) {
    const grouped = new Map<string, AssetSummary[]>();
    for (const asset of standaloneAssets) {
      const loc = locationFromAsset(asset);
      let zone = loc.zoneLabel;
      if (zone === 'Unplaced') zone = 'Data Hall';
      const key = `${zone}::${asset.category ?? 'other'}`;
      const list = grouped.get(key) ?? [];
      list.push(asset);
      grouped.set(key, list);
    }
    let standaloneZ = 8;
    for (const [key, items] of grouped) {
      const [zoneLabel = 'Data Hall', category = 'other'] = key.split('::');
      const sorted = [...items].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
      const totalWidth = sorted.length * (RACK_WIDTH + RACK_GAP);
      const startX = -totalWidth / 2 + RACK_WIDTH / 2;
      sorted.forEach((asset, i) => {
        nodes.push({
          assetId: asset.id,
          label: displayText(asset.name, asset.id),
          category: asset.category ?? category,
          status: asset.status,
          position: [startX + i * (RACK_WIDTH + RACK_GAP), 0, standaloneZ],
          zoneLabel,
          rowLabel: `${category} row`,
          aisleLabel: 'Perimeter',
        });
        placedIds.add(asset.id);
      });
      standaloneZ += AISLE_WIDTH;
    }
  }

  // Build rows from nodes
  const rowGroups = new Map<string, SceneNode[]>();
  for (const node of nodes) {
    const key = `${node.zoneLabel}::${node.rowLabel}`;
    const list = rowGroups.get(key) ?? [];
    list.push(node);
    rowGroups.set(key, list);
  }
  const rows: SceneRow[] = [];
  for (const [key, rowNodes] of rowGroups) {
    const [zoneLabel = 'Data Hall', rowLabel = 'Row'] = key.split('::');
    const positions = rowNodes.map((n) => n.position);
    const centerX = positions.reduce((s, p) => s + p[0], 0) / positions.length;
    const centerZ = positions.reduce((s, p) => s + p[2], 0) / positions.length;
    const aisleLabel = rowNodes[0]?.aisleLabel ?? 'Cold';
    rows.push({
      label: rowLabel,
      zoneLabel,
      position: [centerX, 0, centerZ],
      assetIds: rowNodes.map((n) => n.assetId),
      aisleLabel,
    });
  }
  rows.sort((a, b) => zoneSort(a.zoneLabel).localeCompare(zoneSort(b.zoneLabel)) || a.label.localeCompare(b.label));

  // Build zones
  const zoneLabels = [...new Set(nodes.map((n) => n.zoneLabel))].sort((a, b) => zoneSort(a).localeCompare(zoneSort(b)));
  const zones = zoneLabels.map<SceneZone>((label) => {
    const bounds = buildBounds(nodes.filter((n) => n.zoneLabel === label));
    const zoneRows = rows.filter((r) => r.zoneLabel === label);
    const aisleA = zoneRows.find((r) => r.aisleLabel === 'Cold')?.label;
    const aisleB = zoneRows.find((r) => r.aisleLabel === 'Hot')?.label;
    return { label, position: bounds.center, size: [bounds.size[0] + 4, 0, bounds.size[2] + 4], aisleA, aisleB };
  });

  const thermalGrid = buildThermalGrid(zones);
  return { nodes, zones, rows, bounds: buildBounds(nodes), thermalGrid };
}
