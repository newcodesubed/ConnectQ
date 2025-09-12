import type { ComponentType, InputHTMLAttributes } from "react";

interface DateInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  icon: ComponentType<React.SVGProps<SVGSVGElement>>;
}

const DateInput = ({ icon: Icon, className, ...props }: DateInputProps) => {
  return (
    <div className="relative mb-6 date-input-container">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
        <Icon className="size-5 text-[#66BB6A]" />
      </div>
      <input
        type="date"
        {...props}
        className={`w-full pl-10 pr-3 py-2 bg-[#F2F2F2] bg-opacity-50 rounded-lg border border-gray-500 focus:border-[#66BB6A] focus:ring-2 focus:ring-[#66BB6A] text-[#2D2D2D] placeholder-gray-500 transition duration-200 relative z-[9999] ${className || ''}`}
        style={{ 
          position: 'relative',
          zIndex: 9999,
          // Force the calendar to appear in the correct position
          isolation: 'isolate',
          // Ensure the calendar picker is visible
          WebkitAppearance: 'none',
          MozAppearance: 'textfield',
          ...props.style
        }}
        // Handle focus to ensure proper z-index
        onFocus={(e) => {
          e.target.style.zIndex = '10001';
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.target.style.zIndex = '9999';
          props.onBlur?.(e);
        }}
      />
    </div>
  );
};

export default DateInput;