import type { ComponentType, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: ComponentType<React.SVGProps<SVGSVGElement>>;
}

const Input = ({ icon: Icon, type, ...props }: InputProps) => {
  // Special handling for date inputs to fix calendar positioning
  const inputClasses = type === "date" 
    ? "w-full pl-10 pr-3 py-2 bg-[#F2F2F2] bg-opacity-50 rounded-lg border border-gray-500 focus:border-[#66BB6A] focus:ring-2 focus:ring-[#66BB6A] text-[#2D2D2D] placeholder-gray-500 transition duration-200 relative z-50"
    : "w-full pl-10 pr-3 py-2 bg-[#F2F2F2] bg-opacity-50 rounded-lg border border-gray-500 focus:border-[#66BB6A] focus:ring-2 focus:ring-[#66BB6A] text-[#2D2D2D] placeholder-gray-500 transition duration-200";

  return (
    <div className={type === "date" ? "relative mb-6 z-50" : "relative mb-6"}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
        <Icon className="size-5 text-[#66BB6A]" />
      </div>
      <input
        type={type}
        {...props}
        className={inputClasses}
        style={type === "date" ? { 
          position: 'relative',
          zIndex: 50
        } : undefined}
      />
    </div>
  );
};

export default Input;
