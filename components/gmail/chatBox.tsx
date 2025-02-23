import { motion } from "framer-motion";

interface AIChatInputProps {
  userCommand: string;
  setUserCommand: React.Dispatch<React.SetStateAction<string>>;
  handleCommandSubmit: () => void;
  loading: boolean;
}

const AIChatInput: React.FC<AIChatInputProps> = ({
  userCommand,
  setUserCommand,
  handleCommandSubmit,
  loading,
}) => {
  // Handle Enter key press event
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent the default behavior of Enter key (like form submission)
      handleCommandSubmit(); // Call the submit handler when Enter is pressed
    }
  };

  return (
    <motion.div
      className="bg-white shadow-lg fixed bottom-0 left-0 w-full p-4 flex items-center justify-center border-t"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <input
        type="text"
        value={userCommand}
        onChange={(e) => setUserCommand(e.target.value)}
        onKeyDown={handleKeyDown} // Add the keyDown event listener
        placeholder="Enter a command..."
        className="flex-1 border rounded-xl p-3 focus:ring focus:ring-blue-300 mx-4"
        disabled={loading}
      />
      <button
        onClick={handleCommandSubmit}
        className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
      >
        Execute
      </button>
    </motion.div>
  );
};

export default AIChatInput;
