import { motion, useReducedMotion } from "motion/react";

const particles = Array.from({ length: 20 });
const particleConfig = particles.map(() => ({
  size: Math.random() > 0.5 ? 6 : 4,
  left: Math.random() * 100,
  top: Math.random() * 100,
  duration: 6 + Math.random() * 4,
  delay: Math.random() * 5,
  driftX: 2 + Math.random() * 4,
}));

export default function Dust() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 z-[20] pointer-events-none overflow-hidden">
      {particleConfig.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-amber-200/70 blur-[0.5px]"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
          }}
          initial={{ opacity: 0 }}
          animate={
            prefersReducedMotion
              ? { opacity: 0.5 }
              : {
                  y: [0, -14, -30, -46, -56],
                  x: [
                    -particle.driftX,
                    particle.driftX,
                    -particle.driftX * 0.6,
                    particle.driftX * 0.25,
                    0,
                  ],
                  opacity: [0, 0.7, 0.9, 0.45, 0],
                }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : {
                  duration: particle.duration,
                  times: [0, 0.2, 0.45, 0.78, 1],
                  delay: particle.delay,
                  repeat: Infinity,
                  repeatType: "loop",
                  repeatDelay: 0,
                  ease: "easeInOut",
                }
          }
        />
      ))}
    </div>
  );
}
