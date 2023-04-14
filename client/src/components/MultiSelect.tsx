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
      {options.map((option, index) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          className={`px-4 py-1 bg-secondary-600 ${
            option === selected ? "border-2 border-brand-500 text-brand-500" : "text-secondary-800"
          } ${index === 0 ? "rounded-l-lg" : index === options.length - 1 ? "rounded-r-lg" : ""}`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
