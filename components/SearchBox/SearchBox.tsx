import css from "./SearchBox.module.css";

interface SearchBoxProps {
  onChange: (value: string) => void;
  defaultValue: string;
}

export default function SearchBox({ onChange, defaultValue }: SearchBoxProps) {
  return (
    <input
      className={css.input}
      type="text"
      defaultValue={defaultValue}
      placeholder="Search notes"
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        onChange(e.target.value)
      }
    />
  );
}
