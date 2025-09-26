// src/components/SelectField.tsx
import type { Component, JSX } from "solid-js";

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: JSX.EventHandler<HTMLSelectElement, Event>;
  options: string[];     // or { value: string; label: string }[]
  disabledOption?: string; // e.g. "Choose your top skill"
}

const SelectField: Component<SelectFieldProps> = (props) => {
  const baseSelect =
    "w-full px-4 py-2 rounded-lg bg-[#000]/30 text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4CE0D2]/50";

  return (
    <div class="mb-4">
      <label class="block text-gray-200 mb-1">{props.label}</label>
      <select
        class={baseSelect}
        value={props.value}
        onChange={props.onChange}
      >
        {props.disabledOption && (
          <option value="" disabled>
            {props.disabledOption}
          </option>
        )}
        {props.options.map((opt) => (
          <option value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
