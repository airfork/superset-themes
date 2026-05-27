export interface SegmentedControlOption<TValue extends string> {
  label: string;
  value: TValue;
}

export interface SegmentedControlProps<TValue extends string> {
  ariaLabel: string;
  disabled?: boolean;
  onValueChange?: (value: TValue) => void;
  options: readonly SegmentedControlOption<TValue>[];
  value: TValue;
}

export function SegmentedControl<TValue extends string>({
  ariaLabel,
  disabled,
  onValueChange,
  options,
  value,
}: SegmentedControlProps<TValue>) {
  return (
    <fieldset className="ui-segmented-control">
      <legend className="sr-only">{ariaLabel}</legend>
      {options.map((option) => (
        <label className="ui-segmented-control__item" key={option.value}>
          <input
            checked={option.value === value}
            disabled={disabled}
            name={ariaLabel}
            onChange={() => onValueChange?.(option.value)}
            type="radio"
            value={option.value}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
