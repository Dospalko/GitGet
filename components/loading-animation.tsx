import { Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"

/**
 * LoadingAnimation component provides a visually engaging loader
 * with a smoothly spinning icon and animated progress bars
 * for different GitHub data sections.
 */
export function LoadingAnimation() {
  // Sections to display loading progress for
  const sections = ['Profile', 'Repositories', 'Activity']

  return (
    <div className="relative flex flex-col items-center justify-center p-8 space-y-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl">
      {/* Spinner and message container */}
      <motion.div
        className="flex items-center space-x-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Rotating loader icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ loop: Infinity, ease: 'linear', duration: 1 }}
        >
          <Loader2 className="h-10 w-10 text-primary" />
        </motion.div>
        {/* Pulsing loading text */}
        <motion.p
          className="text-xl font-semibold text-primary"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Fetching GitHub data...
        </motion.p>
      </motion.div>

      {/* Animated progress cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {sections.map((section, idx) => (
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + idx * 0.2 }}
          >
            <Card className="p-5 border-2 border-primary/20 rounded-xl">
              {/* Section title */}
              <p className="text-sm font-medium text-primary mb-3">{section}</p>
              {/* Animated progress bar */}
              <div className="h-2 bg-primary/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{
                    repeat: Infinity,
                    repeatType: 'reverse',
                    duration: 1.5,
                    ease: 'easeInOut',
                  }}
                />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
