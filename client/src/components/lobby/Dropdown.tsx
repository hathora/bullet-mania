import React, { useCallback } from "react";

interface MultiSelectProps<T extends string | number> {
  options: T[];
  selected: T;
  onSelect: (s: T) => void;
  format?: (s: T) => string;
  className?: string;
  width?: string;
}

export function Dropdown<T extends string | number>(props: MultiSelectProps<T>) {
  const { options, selected, onSelect, className, width } = props;
  const format = props.format ?? ((s: T) => `${s}`);
  const changeOption: React.ChangeEventHandler<HTMLSelectElement> = useCallback(
    (event) => {
      onSelect(event.target.value as T);
    },
    [onSelect]
  );
  return (
    <div className={`flex justify-center ${className}`}>
      <select
        className={`px-4 py-2 bg-secondary-600 rounded text-secondary-800 cursor-pointer ${width ? width : ""}`}
        value={selected}
        onChange={changeOption}
      >
        {options.map((r) => (
          <option key={r} value={r}>{`${format(r)}`}</option>
        ))}
      </select>
    </div>
  );
}
