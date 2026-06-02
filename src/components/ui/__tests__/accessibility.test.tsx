import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { Drawer, Tabs, type TabItem } from '..';

function ManagedDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Open drawer</button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Asset details">
        <button type="button">First action</button>
        <button type="button">Last action</button>
      </Drawer>
    </>
  );
}

function ManagedTabs() {
  const [selectedId, setSelectedId] = useState('overview');
  const tabs: TabItem[] = [
    { id: 'overview', label: 'Overview', content: 'Overview content' },
    { id: 'telemetry', label: 'Telemetry', content: 'Telemetry content' },
    { id: 'history', label: 'History', content: 'History content' },
  ];

  return <Tabs tabs={tabs} selectedId={selectedId} onChange={setSelectedId} />;
}

describe('ui primitive accessibility', () => {
  it('moves focus into the drawer on open and restores opener focus on close', () => {
    render(<ManagedDrawer />);

    const opener = screen.getByRole('button', { name: 'Open drawer' });
    opener.focus();
    fireEvent.click(opener);

    const dialog = screen.getByRole('dialog', { name: 'Asset details' });
    expect(dialog).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(opener).toHaveFocus();
  });

  it('traps tab navigation inside the open drawer', () => {
    render(<ManagedDrawer />);

    fireEvent.click(screen.getByRole('button', { name: 'Open drawer' }));
    const close = screen.getByRole('button', { name: 'Close drawer' });
    const first = screen.getByRole('button', { name: 'First action' });
    const last = screen.getByRole('button', { name: 'Last action' });

    close.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(last).toHaveFocus();

    last.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(close).toHaveFocus();

    first.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(last).not.toHaveFocus();
  });

  it('keeps focus on the selected tab after keyboard navigation', () => {
    render(<ManagedTabs />);

    const overview = screen.getByRole('tab', { name: 'Overview' });
    overview.focus();
    fireEvent.keyDown(overview, { key: 'ArrowRight' });

    const telemetry = screen.getByRole('tab', { name: 'Telemetry' });
    expect(telemetry).toHaveAttribute('aria-selected', 'true');
    expect(telemetry).toHaveFocus();
  });
});
