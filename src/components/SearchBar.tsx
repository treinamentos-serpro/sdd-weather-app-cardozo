import { useState } from 'react';
import type { FormEvent } from 'react';

interface SearchBarProps {
  /** Chamado com o nome da cidade (sem espaços nas bordas) ao submeter a busca. */
  onSearch: (city: string) => void;
  /** Desabilita o input e o botão de busca, ex.: durante carregamento. */
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const city = value.trim();
    if (!city) return;
    onSearch(city);
  };

  return (
    <form
      role="search"
      aria-label="Buscar previsão do tempo"
      onSubmit={handleSubmit}
      className="flex w-full max-w-md min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur-md"
    >
      <label htmlFor="city-search" className="sr-only">
        Buscar cidade
      </label>
      <input
        id="city-search"
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={disabled}
        placeholder="Buscar cidade..."
        className="min-w-0 flex-1 rounded-lg bg-transparent px-3 py-2 text-white placeholder:text-white/65 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-800 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled}
        className="shrink-0 rounded-lg bg-accent-500 px-4 py-2 font-medium text-white transition-colors hover:bg-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Buscar
      </button>
    </form>
  );
}
