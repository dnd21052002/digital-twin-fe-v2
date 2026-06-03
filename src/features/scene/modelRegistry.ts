import type { SceneVec3 } from './layout';

export type ModelEntry = {
  url: string;
  scale?: SceneVec3;
  offset?: SceneVec3;
  rotation?: SceneVec3;
};

export type CategoryModelConfig = {
  category: string;
  match: string[];
  model?: ModelEntry;
  procedural: {
    type: 'box' | 'sphere' | 'cylinder';
    size: SceneVec3;
    color: string;
    emissive?: string;
    details?: string[];
  };
};

export const CATEGORY_MODELS: CategoryModelConfig[] = [
  {
    category: 'rack',
    match: ['rack', 'cabinet', 'enclosure'],
    procedural: { type: 'box', size: [1.15, 3.2, 1], color: '#141516', details: ['ru-lines', 'status-strip'] },
  },
  {
    category: 'server',
    match: ['server', 'blade', 'compute', 'node'],
    procedural: { type: 'box', size: [1.35, 0.55, 0.8], color: '#1a1c1e', details: ['blades', 'status-strip'] },
  },
  {
    category: 'sensor',
    match: ['sensor', 'detector', 'probe', 'monitor'],
    procedural: { type: 'sphere', size: [0.45, 0.45, 0.45], color: '#5e6ad2', emissive: '#3a3f8a' },
  },
  {
    category: 'cooling',
    match: ['cool', 'crac', 'hvac', 'ahu', 'chiller', 'fan'],
    procedural: { type: 'box', size: [1.7, 1.5, 1.25], color: '#1a1c1e', details: ['vents', 'status-strip'] },
  },
  {
    category: 'ups',
    match: ['ups', 'battery', 'generator', 'backup'],
    procedural: { type: 'box', size: [1.4, 2.3, 1.2], color: '#1a1c1e', details: ['indicator', 'status-strip'] },
  },
  {
    category: 'pdu',
    match: ['pdu', 'power', 'distribution', 'breaker'],
    procedural: { type: 'box', size: [0.65, 2.4, 0.85], color: '#1a1c1e', details: ['status-strip'] },
  },
  {
    category: 'switch',
    match: ['switch', 'network', 'router', 'firewall'],
    procedural: { type: 'box', size: [1.3, 0.35, 0.8], color: '#1a1c1e', details: ['blades', 'status-strip'] },
  },
  {
    category: 'storage',
    match: ['storage', 'disk', 'nas', 'san', 'array'],
    procedural: { type: 'box', size: [1.2, 1.8, 1.0], color: '#141516', details: ['ru-lines', 'status-strip'] },
  },
];

const categoryCache = new Map<string, CategoryModelConfig>();

function resolveCategory(rawCategory: string): CategoryModelConfig {
  const cached = categoryCache.get(rawCategory);
  if (cached) return cached;

  const key = rawCategory.toLowerCase().trim();
  for (const config of CATEGORY_MODELS) {
    if (config.match.some((m) => key.includes(m))) {
      categoryCache.set(rawCategory, config);
      return config;
    }
  }

  const fallback = CATEGORY_MODELS[0]!;
  categoryCache.set(rawCategory, fallback);
  return fallback;
}

export type ResolvedAssetModel = {
  category: string;
  hasGltf: boolean;
  gltfUrl?: string | undefined;
  gltfScale?: SceneVec3 | undefined;
  gltfOffset?: SceneVec3 | undefined;
  gltfRotation?: SceneVec3 | undefined;
  proceduralType: 'box' | 'sphere' | 'cylinder';
  proceduralSize: SceneVec3;
  proceduralColor: string;
  proceduralEmissive?: string | undefined;
  details: string[];
};

export function resolveAssetModel(rawCategory: string, manifestModel?: string): ResolvedAssetModel {
  const config = resolveCategory(rawCategory);
  const hasGltf = Boolean(config.model?.url || manifestModel);

  return {
    category: config.category,
    hasGltf,
    gltfUrl: manifestModel ?? config.model?.url,
    gltfScale: config.model?.scale,
    gltfOffset: config.model?.offset,
    gltfRotation: config.model?.rotation,
    proceduralType: config.procedural.type,
    proceduralSize: config.procedural.size,
    proceduralColor: config.procedural.color,
    proceduralEmissive: config.procedural.emissive,
    details: config.procedural.details ?? [],
  };
}

export function registerCategoryModel(category: string, modelUrl: string, scale?: SceneVec3): void {
  const key = category.toLowerCase().trim();
  const existing = CATEGORY_MODELS.find((c) => c.match.includes(key));
  if (existing) {
    existing.model = { url: modelUrl, ...(scale ? { scale } : {}) };
    categoryCache.delete(category);
  }
}
