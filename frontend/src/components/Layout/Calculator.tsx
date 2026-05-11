import { useState } from "react";
import { Calculator as CalcIcon } from "lucide-react";
import type { KeyboardEvent } from "react";

export default function Calculator() {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  const calculate = (expr: string) => {
    try {
      // Allow only numbers, math operators, parens, and spaces
      if (!/^[0-9+\-*/%()., \t]+$/.test(expr)) {
        return null;
      }

      let safeExpr = expr.replace(/,/g, ".");

      // Handle A + B% and A - B% operations
      safeExpr = safeExpr.replace(
        /([0-9.]+)\s*([+-])\s*([0-9.]+)\s*%/g,
        "$1 $2 ($1 * $3 / 100)",
      );

      // Handle remaining X% as X/100
      safeExpr = safeExpr.replace(/([0-9.]+)\s*%/g, "($1 / 100)");

      // Safe evaluation
      const result = new Function(`return ${safeExpr}`)();

      if (!isFinite(result) || isNaN(result)) return null;

      return Number(result.toFixed(4)).toString();
    } catch {
      return null;
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      console.log(value);
      if (!value.trim()) return;
      const res = calculate(value);
      if (res !== null) {
        setValue(res);
        setError(false);
      } else {
        setError(true);
      }
    }
  };

  return (
    <div className="relative flex items-center">
      <CalcIcon size={16} className="absolute left-3 text-gray-400" />
      <input
        type="text"
        className={`w-40 bg-[#f0f2f1] rounded-lg py-2 pl-9 pr-4 text-sm font-medium tabular-nums focus:outline-none focus:ring-1 focus:ring-gray-300 transition-shadow ${
          error ? "text-red-500" : "text-gray-700"
        }`}
        placeholder=""
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (error) setError(false);
        }}
        onKeyDown={handleKeyDown}
        title="Введите выражение и нажмите Enter"
      />
    </div>
  );
}
