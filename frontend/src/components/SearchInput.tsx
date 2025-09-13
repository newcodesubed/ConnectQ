import { useState } from "react";
import { Search, Sparkles, X } from "lucide-react";

interface SearchInputProps {
  onSearch: (query: string) => void;
  loading: boolean;
  placeholder?: string;
  hasResults?: boolean;
  onClear?: () => void;
}

export default function SearchInput({ 
  onSearch, 
  loading, 
  placeholder = "Describe your project needs...",
  hasResults = false,
  onClear
}: SearchInputProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !loading) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery("");
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-[#fa744c]" />
          <h2 className="text-2xl font-bold text-[#2D2D2D]">Find Your Perfect Company</h2>
        </div>
        <p className="text-gray-600">
          Describe your project requirements and we'll find companies that match your needs using AI
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl text-lg focus:outline-none focus:border-[#fa744c] focus:ring-2 focus:ring-[#fa744c] focus:ring-opacity-20 transition-all"
            disabled={loading}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-full h-full" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            <p className="mb-1">Try searching for:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "React e-commerce website",
                "Mobile app with AI features",
                "SaaS platform with authentication",
                "WordPress custom theme"
              ].map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setQuery(example)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded-full transition-colors"
                  disabled={loading}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasResults && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                disabled={loading}
              >
                Clear Results
              </button>
            )}
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="bg-[#fa744c] hover:bg-[#e8633f] disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Search Companies
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {loading && (
        <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
          <div className="flex items-center gap-3 text-orange-800">
            <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <p className="font-medium">Processing your request...</p>
              <p className="text-sm text-orange-700">
                Our AI is analyzing your requirements and finding the best matches
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}