import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../components/ui/button";
import { FaGithub } from "react-icons/fa"; // Import GitHub Icon

const projects = [
  {
    name: "Filmu - VOD Streaming Platform",
    link: "https://github.com/IdrissaMaiga/Android-Filmu-ReactNative-MongoDb",
    description: "Developed a streaming platform using React Native, Node.js, and MongoDB.",
    logos: ["/logos/react.png", "/logos/nodejs.png", "/logos/mongodb.png"],
  },
  {
    name: "Gmail AI Assistance",
    link: "https://github.com/IdrissaMaiga/GmailAi-Deepseek-R1-70bil",
    description: "Built an AI-powered email manager with Next.js and DeepSeek R1.",
    logos: ["/logos/nextjs.png", "/logos/deepseek.png"],
  },
  {
    name: "SignalApp - Trading Signals",
    link: "https://github.com/IdrissaMaiga/SignalApp",
    description: "Created a real-time trading signal app with Firebase and React Native.",
    logos: ["/logos/firebase.png", "/logos/react.png"],
  },
  {
    name: "Kouma - AI-Powered Chat App",
    link: "https://github.com/IdrissaMaiga/Kouma-Chat-With-Ai",
    description: "Developed a chatbot app using Node.js and React.",
    logos: ["/logos/nodejs.png", "/logos/react.png"],
  },
];

const ProjectSection = () => {
  return (
    <motion.section
      id="projects"
      className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-6 py-12 mt-20"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <h2 className="text-4xl font-bold mb-12 text-blue-400 text-center">Projects</h2>

      <div className="w-full max-w-6xl flex flex-col gap-16">
        {projects.map((project, index) => (
          <motion.div
            key={index}
            className="relative p-8 border border-gray-700 rounded-xl bg-gray-800 shadow-lg transition duration-300 overflow-hidden"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: index * 0.3 }}
            whileHover={{ scale: 1.05 }}
          >
            {/* Tech Stack Logos (Moving from Right to Left, Vertically Centered) */}
            <div className="absolute inset-0 flex justify-center items-center overflow-hidden">
              <motion.div
                className="flex justify-evenly w-full"
                initial={{ x: "100%" }}
                animate={{ x: "-100%" }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 2 * index, // Delay the start for each project
                }}
              >
                {project.logos.map((logo, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: 2, // Adjust for fade-in speed
                      delay: i * 2, // Stagger the opacity animation of each logo
                    }}
                  >
                    <Image
                      src={logo}
                      alt="Tech Logo"
                      width={100}  // Increased size of the logos
                      height={100} // Increased size of the logos
                      className="opacity-40"
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Project Name & Description */}
            <motion.div className="relative z-10 text-center">
              <h3 className="text-2xl font-semibold mb-4 text-blue-300">{project.name}</h3>
              <motion.p
                className="text-gray-300 mb-6 opacity-75"
                initial={{ opacity: 0, y: 10 }}
                whileHover={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {project.description}
              </motion.p>

              {/* GitHub Button */}
              <Link href={project.link} passHref>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-3 text-black border-blue-500 hover:bg-blue-500 transition px-6 py-3"
                >
                  <FaGithub size={24} /> 
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default ProjectSection;
