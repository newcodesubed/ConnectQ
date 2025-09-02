import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export default function Input({ label, error, ...props }: Props) {
  return (
    <label className="block w-full mb-3">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        className="w-full rounded-xl border px-3 py-2 outline-none focus:ring focus:ring-blue-200"
        {...props}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}
