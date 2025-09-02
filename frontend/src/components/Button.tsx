import type { ButtonHTMLAttributes } from "react";

export default function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="rounded-xl px-4 py-2 font-medium shadow hover:shadow-md bg-blue-600 text-white disabled:opacity-60"
      {...props}
    />
  );
}
