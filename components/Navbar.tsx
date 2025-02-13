"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const Navbar: React.FC = () => {
  const sections = ["projects", "about", "languages", "contact"];
  const [activeSection, setActiveSection] = useState("about");
  const [scrolling, setScrolling] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolling(window.scrollY > 50);
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 50, behavior: "smooth" });
      setMenuOpen(false); // Close the menu when a section is selected
    }
  };

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300  ${
        scrolling ? "bg-gray-900 shadow-lg" : "bg-gray-900 shadow-lg"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        {/* Left Side - Profile Picture & Name */}
        <div className="flex items-center space-x-4">
          <Image
            src="/logos/id_.jpg"
            alt="Your Profile"
            width={50}
            height={50}
            className="rounded-full border-2 border-blue-500"
          />
          <div className="text-white">
            <span className="text-lg font-bold">Idrissa Maiga</span>
            <span className="text-blue-400 text-sm block">Full-Stack Developer (JavaScript & Java)</span>
          </div>
        </div>

        {/* Right Side - Navigation Links & CV Button */}
        <div className="hidden md:flex space-x-6 items-center">
          {sections.map((section) => (
            <button
              key={section}
              className={`px-4 py-2 text-white text-lg transition duration-300 ${
                activeSection === section ? "border-b-2 border-blue-500 text-blue-400" : "hover:text-blue-400"
              }`}
              onClick={() => handleScrollToSection(section)}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}

          {/* Download CV Button */}
          <a
            href="/IdrissaMaigaCV.pdf"
            download
            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
          >
            Download CV
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col items-center bg-gray-800 text-white py-4 space-y-4">
          {sections.map((section) => (
            <button
              key={section}
              className={`px-4 py-2 text-lg transition duration-300 ${
                activeSection === section ? "border-b-2 border-blue-500 text-blue-400" : "hover:text-blue-400"
              }`}
              onClick={() => handleScrollToSection(section)}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}

          {/* Download CV Button */}
          <a
            href="/IdrissaMaigaCV.pdf"
            download
            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
          >
            Download CV
          </a>
        </div>
      )}
    </motion.nav>
  );
};

export default Navbar;
