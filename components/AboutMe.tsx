"use client";
import React from "react";
import { motion } from "framer-motion";

const About: React.FC = () => {
  return (
    <motion.section
      id="about"
      className="min-h-screen flex flex-col items-center justify-center bg-gray-700 text-white p-0"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      <motion.h2
        className="text-4xl font-bold mb-6 text-blue-400"
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
      >
        About Me
      </motion.h2>

      <motion.div
        className="max-w-3xl text-center space-y-4"
        initial="hidden"
        whileInView="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.3 },
          },
        }}
        viewport={{ once: true }}
      >
        {[
          "I am Idrissa Maiga, a passionate and detail-oriented Full-Stack Developer with a strong foundation in Java and JavaScript. With a love for solving complex problems, I thrive in building high-performance web applications.",
          "My expertise includes modern frameworks such as Spring Boot, React.js, and Node.js. I have hands-on experience developing RESTful APIs, working with relational and NoSQL databases, and deploying applications on cloud platforms like AWS.",
          "I am currently pursuing my BSc in Computer Science at Óbuda University in Budapest. My journey in tech started with a deep curiosity about how things work, leading me to explore software engineering, AI, and cloud computing.",
          "I am always eager to collaborate on exciting projects, improve my skills, and contribute to innovative software solutions. When I’m not coding, you can find me exploring AI technologies, working on open-source projects, or playing football. 🚀",
        ].map((text, index) => (
          <motion.p
            key={index}
            className="text-lg text-gray-300 leading-relaxed"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 1 }}
          >
            {text}
          </motion.p>
        ))}
      </motion.div>
    </motion.section>
  );
};

export default About;
