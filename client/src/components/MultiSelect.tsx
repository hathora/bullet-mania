import React from "react";

interface MultiSelectProps<T extends string> {
  options: T[];
  selected: T;
  onSelect: (s: T) => void;
}

export function MultiSelect<T extends string>(props: MultiSelectProps<T>) {
  const { options, selected, onSelect } = props;
  return (
    <div className="flex justify-center">
      {options.map((option) => (
        <button key={option} onClick={() => onSelect(option)} className={option === selected ? "border" : ""}>
          {option}
        </button>
      ))}
    </div>
  );
}
