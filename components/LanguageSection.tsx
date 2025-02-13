"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const LanguageSection = () => {
  const languageLogos = [
    { src: "/logos/english.png", alt: "English" },
    { src: "/logos/french.png", alt: "French" }
  ];

  return (
    <motion.section
      id="languages"
      className="flex flex-col items-center justify-center bg-gray-800 text-white p-3  shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-lg font-semibold mb-2 text-blue-400">Languages</h2>
      <div className="flex space-x-3">
        {languageLogos.map((logo, index) => (
          <Image key={index} src={logo.src} alt={logo.alt} width={30} height={30} className="rounded-full" />
        ))}
      </div>
    </motion.section>
  );
};

export default LanguageSection;
