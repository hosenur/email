import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect } from "react";

export const Route = createFileRoute("/switch")({
  validateSearch: (search): SwitchSearch => ({
    fromImage:
      typeof search.fromImage === "string" ? search.fromImage : undefined,
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    toImage: typeof search.toImage === "string" ? search.toImage : undefined,
  }),
  component: SwitchPage,
});

interface SwitchSearch {
  redirect?: string;
  fromImage?: string;
  toImage?: string;
}

export default function SwitchPage() {
  const { redirect, fromImage, toImage } = Route.useSearch();

  useEffect(() => {
    if (redirect) {
      const timer = setTimeout(() => {
        window.location.href = redirect;
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [redirect]);

  return (
    <div className="flex h-screen w-full items-center justify-center gap-16 bg-bg p-8">
      <motion.div
        initial={{ width: 50, height: 50, x: 0 }}
        animate={{
          width: [50, 60, 50],
          height: [50, 60, 50],
          x: [0, 0, 20],
        }}
        transition={{
          duration: 1.5,
          times: [0, 0.5, 1],
          ease: "easeInOut",
        }}
        className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-secondary shadow-xl"
      >
        {fromImage ? (
          <img
            src={fromImage}
            alt="From"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-blue-500 to-purple-600" />
        )}
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ delay: 0.75, duration: 0.5, ease: "linear" }}
          className="absolute inset-0 -rotate-45 scale-[3] bg-gradient-to-r from-transparent via-white/50 to-transparent"
        />
      </motion.div>

      <motion.div
        initial={{ width: 50, height: 50, x: 0 }}
        animate={{
          width: [50, 60, 50],
          height: [50, 60, 50],
          x: [0, 0, -20],
        }}
        transition={{
          duration: 1.5,
          times: [0, 0.5, 1],
          ease: "easeInOut",
        }}
        className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-secondary shadow-xl"
      >
        {toImage ? (
          <img src={toImage} alt="To" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-orange-400 to-pink-600" />
        )}
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ delay: 0.75, duration: 0.5, ease: "linear" }}
          className="absolute inset-0 -rotate-45 scale-[3] bg-gradient-to-r from-transparent via-white/50 to-transparent"
        />
      </motion.div>
    </div>
  );
}
