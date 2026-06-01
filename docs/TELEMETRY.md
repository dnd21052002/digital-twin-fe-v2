# Telemetry UX

## Goal

Make asset metrics understandable and actionable. Operators should see latest values, trend, thresholds, and alarm context.

## APIs

```http
GET /api/v1/assets/{assetId}/metrics/latest
GET /api/v1/assets/{assetId}/metrics/timeseries?metric=<metricKey>&from=<iso>&to=<iso>&limit=1000
```

Latest response:

```ts
type LatestMetricsResponse = {
  assetId: string;
  items: {
    metricKey: string;
    name: string;
    unit: string;
    value: number;
    quality: number;
    timestamp: string;
  }[];
};
```

Timeseries response:

```ts
type TimeseriesResponse = {
  assetId: string;
  metricKey: string;
  unit: string;
  from: string;
  to: string;
  interval: string | null;
  points: { timestamp: string; value: number; quality: number }[];
};
```

## Asset Telemetry Panel

For selected asset:

```text
Latest Metrics
- Temperature 35.1°C Critical
- Power 8.2 kW Warning
- Humidity 46% Normal

Trend
[metric selector] [1h / 6h / 24h]
chart with threshold line and alarm markers
```

## Global Telemetry Center

Accessible from primary nav.

States:

- no selected asset: prompt user to select an asset
- selected asset: show latest metrics and trend
- no metrics: explain selected asset has no telemetry
- failed query: retry button

## Chart Rules

- trend data -> line chart
- show unit on axis/tooltip
- readable time labels
- show empty state instead of blank chart
- do not rely on color alone
- threshold line when rule data available
- alarm markers when alarm timestamps match metric range

## Metric Quality

Map quality to visual state:

| Quality | Meaning | Visual |
| --- | --- | --- |
| 0 | good | success |
| 1 | warning/suspect | warning |
| 2+ | bad/unknown | muted or critical depending backend semantics |

## Time Ranges

Default:

- last 1 hour

Future:

- 6 hours
- 24 hours
- custom range

## Future Enhancements

- compare selected asset with nearby assets
- overlay alarms on chart
- threshold/reference bands
- anomaly markers
- export CSV
- realtime polling/SSE/WebSocket
