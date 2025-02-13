import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaEnvelope, FaLinkedin, FaGithub } from "react-icons/fa"; // Import icons

const Contact: React.FC = () => {
  return (
    <motion.section
      id="contact"
      className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <h2 className="text-4xl font-bold mb-6 text-blue-400">Contact</h2>
      
      <div className="flex space-x-8 text-lg">
        {/* Email Link */}
        <Link
          href="mailto:maigadrisking@gmail.com"
          className="flex items-center gap-2 hover:text-blue-400 transition duration-300"
        >
          <FaEnvelope size={24} /> Email
        </Link>

        {/* LinkedIn Link */}
        <Link
          href="https://www.linkedin.com/in/idrissa-maiga-16581b245"
          className="flex items-center gap-2 hover:text-blue-400 transition duration-300"
        >
          <FaLinkedin size={24} /> LinkedIn
        </Link>

        {/* GitHub Link */}
        <Link
          href="https://github.com/IdrissaMaiga"
          className="flex items-center gap-2 hover:text-blue-400 transition duration-300"
        >
          <FaGithub size={24} /> GitHub
        </Link>
      </div>
    </motion.section>
  );
};

export default Contact;
