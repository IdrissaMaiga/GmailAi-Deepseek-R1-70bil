import { useState } from 'react';

// Define the type for the result items
interface ResultItem {
  command: string;
  result: string | any;
}

interface ResultsComponentProps {
  results: ResultItem[];
}

const ResultsComponent: React.FC<ResultsComponentProps> = ({ results }) => {
  const [visibleResults, setVisibleResults] = useState<boolean[]>(new Array(results.length).fill(true));

  const handleClose = (index: number) => {
    const updatedResults = [...visibleResults];
    updatedResults[index] = false;
    setVisibleResults(updatedResults);
  };

  return (
    <div className="absolute top-0 right-0 p-4 md:p-6 space-y-6 z-10 max-w-full overflow-x-hidden">
      {results.map((item, index) =>
        visibleResults[index] ? (
          <div
            key={index}
            className="bg-white shadow-lg rounded-lg p-4 md:p-6 border border-gray-200 relative w-full max-w-md mx-auto"
          >
            {/* Close button */}
            <button
              onClick={() => handleClose(index)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>

            <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">
              Command: <span className="text-blue-500">{item.command}</span>
            </h3>
            <p className="text-gray-700">
              <strong className="font-medium">Result:</strong>
              {typeof item.result === "string" ? (
                <span className="block mt-2">{item.result}</span>
              ) : (
                <pre className="bg-gray-100 p-4 rounded-md text-sm text-gray-600 whitespace-pre-wrap break-words">
                {item.result?.data}
              </pre>
              
              )}
            </p>
          </div>
        ) : null
      )}
    </div>
  );
};

export default ResultsComponent;
