interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Carregando dados meteorológicos...' }: LoadingStateProps) {
  return (
    <div
      aria-live="polite"
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 p-6 text-white/80 shadow-glass backdrop-blur-md"
      role="status"
    >
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-white/25 border-t-accent-400"
      />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}