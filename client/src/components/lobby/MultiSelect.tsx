import React from "react";

interface MultiSelectProps<T extends string> {
  options: T[];
  selected: T;
  onSelect: (s: T) => void;
  className?: string;
}

export function MultiSelect<T extends string>(props: MultiSelectProps<T>) {
  const { options, selected, onSelect, className } = props;
  return (
    <div className={`flex justify-center ${className}`}>
      {options.map((option, index) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          className={`px-4 py-1 border-2  ${
            option === selected
              ? "border-brand-500 bg-secondary-600 text-brand-500"
              : "border-transparent bg-secondary-500 text-secondary-800 hover:bg-secondary-600"
          } ${index === 0 ? "rounded-l-lg" : index === options.length - 1 ? "rounded-r-lg" : ""}`}
        >
          {option.charAt(0).toUpperCase() + option.slice(1)}
        </button>
      ))}
    </div>
  );
}
