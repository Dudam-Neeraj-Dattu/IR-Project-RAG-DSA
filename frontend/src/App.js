import React, { useState } from 'react';
import axios from 'axios';
import { Search, Loader2, ServerCrash, BrainCircuit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Define the API endpoint
// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1/problems/search';
// FIX: The 'process' object is not defined in this browser environment, causing a ReferenceError.
// We will hardcode the API URL for now.
const API_URL = 'http://localhost:8000/api/v1/problems/search';


// Main App Component
function App() {
   const [query, setQuery] = useState('');
   const [answer, setAnswer] = useState(null);
   const [sources, setSources] = useState([]);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState(null);

   const handleSearch = async (e) => {
      e.preventDefault();
      if (!query.trim()) return;

      // Reset state for new search
      setIsLoading(true);
      setAnswer(null);
      setSources([]);
      setError(null);

      try {
         // Call the backend API
         const response = await axios.post(API_URL, { query });

         if (response.data && response.data.success) {
            setAnswer(response.data.data.answer);
            setSources(response.data.data.sources);
         } else {
            throw new Error('Received an invalid response from the server.');
         }
      } catch (err) {
         console.error('Search error:', err);
         const message = err.response?.data?.message || err.message || 'An unknown error occurred.';
         setError(message);
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 md:p-8">
         <div className="max-w-4xl mx-auto">

            {/* Header */}
            <header className="text-center mb-8">
               <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 inline-flex items-center gap-3">
                  <BrainCircuit size={40} />
                  DSAvecSearch
               </h1>
               <p className="text-gray-400 text-lg mt-2">
                  Your AI-powered DSA search engine.
               </p>
            </header>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-8">
               <div className="relative flex items-center shadow-lg">
                  <input
                     type="text"
                     value={query}
                     onChange={(e) => setQuery(e.target.value)}
                     placeholder="e.g., How do I use a sliding window?"
                     className="w-full p-4 pr-16 text-lg bg-gray-800 text-white rounded-lg border-2 border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     disabled={isLoading}
                  />
                  <button
                     type="submit"
                     className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 disabled:bg-gray-600 transition-all"
                     disabled={isLoading}
                  >
                     {isLoading ? (
                        <Loader2 className="animate-spin" />
                     ) : (
                        <Search />
                     )}
                  </button>
               </div>
            </form>

            {/* Results Area */}
            <div className="space-y-8">
               {/* Loading State */}
               {isLoading && <LoadingSpinner />}

               {/* Error State */}
               {error && <ErrorMessage message={error} />}

               {/* Answer Section */}
               {answer && (
                  <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700">
                     <h2 className="text-2xl font-bold p-4 border-b border-gray-700 text-transparent bg-clip-text bg-linear-to-r from-blue-300 to-purple-400">
                        Generated Answer
                     </h2>

                     {/* --- THIS IS THE UPDATED PART --- */}
                     <div className="p-6 text-lg leading-relaxed">
                        <ReactMarkdown
                           remarkPlugins={[remarkGfm]}
                           components={{
                              ul: ({ node, ...props }) => <ul className="list-disc list-outside pl-6 space-y-2 mb-4" {...props} />,
                              ol: ({ node, ...props }) => <ol className="list-decimal list-outside pl-6 space-y-2 mb-4" {...props} />,
                              li: ({ node, ...props }) => <li className="mb-2" {...props} />,
                              p: ({ node, ...props }) => <p className="mb-4" {...props} />,
                              strong: ({ node, ...props }) => <strong className="font-bold text-blue-300" {...props} />,
                           }}
                        >
                           {answer}
                        </ReactMarkdown>
                     </div>
                  </div>
               )}

               {/* Sources Section */}
               {sources.length > 0 && (
                  <div>
                     <h2 className="text-2xl font-bold mb-4 text-gray-300">
                        Related Problems
                     </h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sources.map((source, index) => (
                           <SourceCard key={index} source={source} index={index + 1} />
                        ))}
                     </div>
                  </div>
               )}
            </div>

         </div>
      </div>
   );
}

// --- Reusable Components (Defined in the same file) ---

/**
 * A styled card to display a single retrieved problem source.
 */
const SourceCard = ({ source, index }) => {
   const difficultyColors = {
      easy: 'text-green-400 border-green-400',
      medium: 'text-yellow-400 border-yellow-400',
      hard: 'text-red-400 border-red-400',
   };

   const scorePercentage = (source.score * 100).toFixed(1);

   return (
      <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-lg border border-gray-700 hover:border-blue-500 transition-all transform hover:-translate-y-1">
         <div className="p-5 flex-grow">
            <div className="flex justify-between items-center mb-2">
               <span className={`text-xs font-semibold px-3 py-1 rounded-full ${difficultyColors[source.problemDifficulty.toLowerCase()] || 'text-gray-400 border-gray-400'} border bg-opacity-10 bg-gray-700`}>
                  {source.problemDifficulty.toUpperCase()}
               </span>
               <span className="text-sm font-medium text-blue-300" title="Relevance Score">
                  {scorePercentage}%
               </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
               {source.problemName}
            </h3>
            <div className="flex flex-wrap gap-2 mt-4">
               {source.problemTags.slice(0, 4).map((tag, i) => ( // Show first 4 tags
                  <span
                     key={i}
                     className="px-2.5 py-0.5 bg-gray-700 text-gray-300 text-xs font-medium rounded-full"
                  >
                     {tag}
                  </span>
               ))}
            </div>
         </div>
         <div className="p-4 bg-gray-800 rounded-b-lg border-t border-gray-700">
            <p className="text-sm text-blue-400 font-medium">Source {index}</p>
         </div>
      </div>
   );
};

/**
 * A simple loading spinner component.
 */
const LoadingSpinner = () => (
   <div className="flex flex-col items-center justify-center p-12 text-gray-400">
      <Loader2 size={48} className="animate-spin text-blue-500" />
      <span className="mt-4 text-lg font-medium">Generating answer...</span>
   </div>
);

/**
 * A component to display an error message.
 */
const ErrorMessage = ({ message }) => (
   <div className="flex flex-col items-center justify-center p-8 bg-red-900 bg-opacity-20 border border-red-700 rounded-lg text-red-300">
      <ServerCrash size={40} className="mb-4" />
      <h3 className="text-xl font-bold mb-2">An Error Occurred</h3>
      <p className="text-center">{message}</p>
   </div>
);

export default App;
