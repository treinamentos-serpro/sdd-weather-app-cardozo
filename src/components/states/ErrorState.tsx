interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <section
      aria-labelledby="error-state-title"
      className="w-full rounded-lg border border-red-300/25 bg-red-950/30 p-6 text-center shadow-glass backdrop-blur-md"
      role="alert"
    >
      <h2 id="error-state-title" className="text-lg font-semibold text-white">
        Não foi possível consultar o clima
      </h2>
      <p className="mt-2 text-sm text-white/75">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900"
      >
        Tentar novamente
      </button>
    </section>
  );
}