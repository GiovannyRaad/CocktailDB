import { motion } from "motion/react";
import Dust from "../components/Dust";
import MenuButton from "../components/MenuButton";

function Homepage() {
  return (
    <main
      data-theme="caramellatte"
      className="relative min-h-screen overflow-hidden bg-[url('/wood.jpg')] bg-cover bg-center bg-no-repeat text-base-content"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a120d]/60 via-[#2b1b12]/45 to-[#120c08]/70" />
      <Dust />

      <motion.a
        href="/login"
        className="tavern-cta absolute left-4 top-4 z-20 rounded-full border border-[#f4dfc0]/35 bg-[#24150e]/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#f8ead3] shadow-[0_10px_24px_rgba(0,0,0,0.3)] backdrop-blur-sm sm:left-6 sm:top-6"
        initial={{ opacity: 0, x: -12, y: -6 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        Login
      </motion.a>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6 py-12 text-center sm:px-8">
        <section className="w-full max-w-3xl">
          <motion.h1
            className="tavern-title text-5xl font-semibold uppercase leading-[1.05] tracking-[0.08em] text-[#f8ead3] drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] sm:text-6xl lg:text-8xl"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: [0.98, 1, 1],
              rotate: [0, 0.9, -0.9, 0.6, -0.6, 0],
            }}
            transition={{
              opacity: { duration: 1.1, ease: "easeOut" },
              y: { duration: 1.1, ease: "easeOut" },
              scale: { duration: 1.1, ease: "easeOut" },
              rotate: {
                duration: 8,
                ease: "easeInOut",
                delay: 1.2,
                repeat: Infinity,
                repeatType: "loop",
              },
            }}
            style={{ transformOrigin: "50% 0%" }}
          >
            The Cocktail Tavern
          </motion.h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 tracking-[0.05em] text-[#f4dfc0]/90 sm:text-xl">
            A classic cocktail collection.
          </p>

          <div className="mt-10">
            <MenuButton />
          </div>
        </section>

        <p className="absolute bottom-5 right-6 text-sm uppercase tracking-[0.28em] text-[#efd8b7]/80 sm:bottom-8 sm:right-8">
          by Giovanny Raad
        </p>
      </div>
    </main>
  );
}

export default Homepage;
