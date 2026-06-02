import { useRef, type KeyboardEvent, type ReactNode } from 'react';

export type TabItem = {
  id: string;
  label: ReactNode;
  content: ReactNode;
};

export type TabsProps = {
  tabs: TabItem[];
  selectedId: string;
  onChange: (id: string) => void;
};

export function Tabs({ tabs, selectedId, onChange }: TabsProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selected = tabs.find((tab) => tab.id === selectedId) ?? tabs[0];

  if (!selected) return null;

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? tabs.length - 1
        : event.key === 'ArrowRight'
          ? (index + 1) % tabs.length
          : (index - 1 + tabs.length) % tabs.length;
    const nextTab = tabs[nextIndex];
    if (!nextTab) return;

    onChange(nextTab.id);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <div>
      <div role="tablist" className="flex gap-2 border-b border-border-subtle">
        {tabs.map((tab, index) => {
          const isSelected = tab.id === selected.id;
          return (
            <button
              ref={(element) => { tabRefs.current[index] = element; }}
              key={tab.id}
              id={`tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isSelected ? 0 : -1}
              className={`border-b-2 px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isSelected ? 'border-primary text-text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
              onClick={() => onChange(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {selected && <div id={`panel-${selected.id}`} role="tabpanel" aria-labelledby={`tab-${selected.id}`} className="pt-4">{selected.content}</div>}
    </div>
  );
}
