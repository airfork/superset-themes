import { type KeyboardEvent, useId, useRef } from "react";

export interface TabOption<TValue extends string> {
  label: string;
  value: TValue;
}

export interface TabsProps<TValue extends string> {
  ariaLabel: string;
  className?: string;
  getPanelId?: (value: TValue) => string;
  getTabId?: (value: TValue) => string;
  onValueChange: (value: TValue) => void;
  tabs: readonly TabOption<TValue>[];
  value: TValue;
}

function getNextIndex(currentIndex: number, key: string, total: number) {
  if (key === "ArrowRight" || key === "ArrowDown") {
    return (currentIndex + 1) % total;
  }

  if (key === "ArrowLeft" || key === "ArrowUp") {
    return (currentIndex - 1 + total) % total;
  }

  if (key === "Home") {
    return 0;
  }

  if (key === "End") {
    return total - 1;
  }

  return currentIndex;
}

export function Tabs<TValue extends string>({
  ariaLabel,
  className,
  getPanelId,
  getTabId,
  onValueChange,
  tabs,
  value,
}: TabsProps<TValue>) {
  const idPrefix = useId();
  const tabRefs = useRef(new Map<TValue, HTMLButtonElement>());
  const classes = ["ui-tabs", className].filter(Boolean).join(" ");

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentValue: TValue) => {
    if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const currentIndex = tabs.findIndex((tab) => tab.value === currentValue);
    const nextIndex = getNextIndex(currentIndex, event.key, tabs.length);
    const nextValue = tabs[nextIndex]?.value;

    if (!nextValue) {
      return;
    }

    onValueChange(nextValue);
    tabRefs.current.get(nextValue)?.focus();
  };

  return (
    <div aria-label={ariaLabel} className={classes} role="tablist">
      {tabs.map((tab) => {
        const selected = tab.value === value;
        const tabId = getTabId?.(tab.value) ?? `${idPrefix}-${tab.value}-tab`;
        const panelId = getPanelId?.(tab.value) ?? `${idPrefix}-${tab.value}-panel`;

        return (
          <button
            aria-controls={panelId}
            aria-selected={selected}
            className="ui-tabs__tab"
            id={tabId}
            key={tab.value}
            onClick={() => onValueChange(tab.value)}
            onKeyDown={(event) => handleKeyDown(event, tab.value)}
            ref={(element) => {
              if (element) {
                tabRefs.current.set(tab.value, element);
              } else {
                tabRefs.current.delete(tab.value);
              }
            }}
            role="tab"
            tabIndex={selected ? 0 : -1}
            type="button"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
