"use client";


import Navbar from "../components/Navbar";
import LanguageSection from "../components/LanguageSection";
import ProjectSection from "../components/ProjectSection";
import ContactSection from "../components/ContactSection";
import AboutMe from "@/components/AboutMe";
import ChatButton from "@/components/ChatButton";

export default function Home() {
  return (
    <>
      <Navbar />
      <ProjectSection />
      <AboutMe />
      <LanguageSection />
      <ContactSection />
      <ChatButton />
    </>
  );
}