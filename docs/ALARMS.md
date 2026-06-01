# Alarms UX

## Goal

Make alarms first-class operational objects, not secondary details inside an asset panel.

## APIs

```http
GET /api/v1/alarms?limit=50
GET /api/v1/alarms?assetId=<assetId>&limit=50
GET /api/v1/alarms/{alarmId}
```

Summary shape:

```ts
type AlarmSummary = {
  id: string;
  raisedAt: string;
  severity: 'info' | 'warning' | 'critical';
  state: 'new' | 'acknowledged' | 'resolved';
  title: string;
  message: string;
  currentValue: number | null;
  thresholdValue: number | null;
  asset?: { id: string; assetTag: string; name: string; category: unknown };
};
```

## Global Alarm Center

Alarm Center should be available from primary nav.

Features:

- severity tabs: All / Critical / Warning / Info
- state filter: New / Acknowledged / Resolved
- search by title/asset/rule
- sort critical first, newest first
- count badge in nav
- retry/error state

Alarm row:

```text
[Critical] High Temperature Detected
Asset: TEMP-HALL-A-COLD1 · Current 35.1°C / Threshold 28°C
Raised: 2026-06-01 14:32 · State: New
```

## Alarm Detail

Sections:

- header: severity, state, title
- affected asset card
- current/threshold/forecast values
- rule info
- location
- timeline
- SOP/camera hints later

Selection behavior:

```text
select alarm -> set selectedAlarmId -> set selectedAssetId if asset exists -> focus 3D asset -> open detail
```

## Related Alarms

Asset inspector shows filtered alarms:

```http
GET /alarms?assetId=<assetId>&limit=50
```

If no related alarms:

```text
No active alarms for this asset.
```

## 3D Alarm Overlay

Show alarm beacons above affected assets:

- critical: red pulsing ring/beacon
- warning: amber marker
- acknowledged: less intense marker

Do not animate excessively. Respect reduced motion.

## Future Actions

Later backend actions may add:

- acknowledge
- assign
- resolve
- add note
- open SOP
- open nearest camera

These actions should be visually separated from navigation and require confirmation where destructive/irreversible.
