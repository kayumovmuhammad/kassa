import { useState, useEffect } from "react";

export default function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-end">
      <span className="text-lg font-semibold text-gray-800 tabular-nums tracking-tight">
        {time.toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
      <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium -mt-1">
        {time.toLocaleDateString("ru-RU", {
          day: "numeric",
          month: "long",
        })}
      </span>
    </div>
  );
}
