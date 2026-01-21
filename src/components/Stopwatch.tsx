interface StopwatchProps {
  formattedTime: string;
}

export function Stopwatch({ formattedTime }: StopwatchProps) {
  return (
    <div className="font-mono text-xl text-gray-400">
      {formattedTime}
    </div>
  );
}
