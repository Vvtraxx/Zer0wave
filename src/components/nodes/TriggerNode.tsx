"use client";

export default function TriggerNode({ data }: any) {
  return (
    <div className="bg-green-600 text-white p-3 rounded w-40">
      <p className="font-bold">⚡ Trigger</p>
      <p className="text-xs">Manual / Cron</p>
    </div>
  );
}