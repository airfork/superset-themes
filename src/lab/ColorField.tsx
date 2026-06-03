import { useEffect, useId, useRef, useState } from "react";

const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;

interface ColorFieldProps {
  id?: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
}

export function ColorField({ id, label, onChange, value }: ColorFieldProps) {
  const colorInputRef = useRef<HTMLInputElement>(null);
  const hexId = useId();
  const errorId = useId();
  const [hexDraft, setHexDraft] = useState(value);
  const [invalid, setInvalid] = useState(false);

  // Re-sync the editable hex when the committed value changes from outside
  // (e.g. a group reroll rewrites every token at once).
  useEffect(() => {
    setHexDraft(value);
    setInvalid(false);
  }, [value]);

  const commitHex = () => {
    if (HEX_PATTERN.test(hexDraft)) {
      setInvalid(false);
      onChange(hexDraft.toLowerCase());
      return;
    }

    setInvalid(true);
  };

  return (
    <div className="lab-color-field" id={id}>
      <span className="lab-color-field__swatch-wrap">
        <button
          aria-label={`Pick ${label} color`}
          className="lab-color-field__swatch"
          onClick={() => {
            colorInputRef.current?.focus();
            colorInputRef.current?.click();
          }}
          style={{ background: value }}
          type="button"
        />
        <input
          aria-label={`${label} color picker`}
          className="lab-color-field__picker"
          onChange={(event) => onChange(event.currentTarget.value)}
          ref={colorInputRef}
          tabIndex={-1}
          type="color"
          value={value}
        />
      </span>
      <label className="lab-color-field__label" htmlFor={hexId}>
        {label}
      </label>
      <input
        aria-describedby={invalid ? errorId : undefined}
        aria-invalid={invalid || undefined}
        aria-label={`${label} hex`}
        autoComplete="off"
        className="lab-color-field__hex"
        id={hexId}
        name={`${label.toLowerCase().replace(/\s+/g, "-")}-hex`}
        onBlur={commitHex}
        onChange={(event) => {
          setHexDraft(event.currentTarget.value);
          setInvalid(false);
        }}
        spellCheck={false}
        type="text"
        value={hexDraft}
      />
      {invalid ? (
        <p className="lab-color-field__error" id={errorId} role="status">
          Enter a 6-digit hex color, like #1a2b3c.
        </p>
      ) : null}
    </div>
  );
}
