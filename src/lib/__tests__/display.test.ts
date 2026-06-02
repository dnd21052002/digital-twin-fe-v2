import { describe, expect, it } from 'vitest';

import { displayText } from '../display';

describe('displayText', () => {
  it('uses the fallback for nullish and empty string values', () => {
    expect(displayText(null)).toBe('—');
    expect(displayText(undefined)).toBe('—');
    expect(displayText('')).toBe('—');
    expect(displayText('', 'n/a')).toBe('n/a');
  });

  it('renders primitive values as safe text', () => {
    expect(displayText('Pump A')).toBe('Pump A');
    expect(displayText(42)).toBe('42');
    expect(displayText(false)).toBe('false');
  });

  it('prefers primitive object display fields without rendering raw JSON', () => {
    expect(displayText({ name: 'Boiler 1', id: 'b-1' })).toBe('Boiler 1');
    expect(displayText({ label: 'Line A' })).toBe('Line A');
    expect(displayText({ title: 'Alarm' })).toBe('Alarm');
    expect(displayText({ code: 'ALM-7' })).toBe('ALM-7');
    expect(displayText({ id: 99 })).toBe('99');
    expect(displayText({ name: { nested: true }, id: '' }, 'missing')).toBe('missing');
  });

  it('does not render raw arrays or object JSON', () => {
    expect(displayText([{ name: 'Hidden' }])).toBe('—');
    expect(displayText({ nested: { name: 'Hidden' } })).toBe('—');
  });
});
