'use client';

import { motion } from 'framer-motion';
import { CardTitle, CARD_FRAME_CLASS_NAME } from '@/components/AllCradsStyling';

type SuggestionsCardProps = {
  suggestions: string[];
};

export function SuggestionsCard({ suggestions }: SuggestionsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.3 }}
      className={`glass-card rounded-3xl border p-6 shadow-glass ${CARD_FRAME_CLASS_NAME}`}
    >
      <CardTitle className="text-sm uppercase tracking-[0.24em]">Improvement Suggestions</CardTitle>
      <p className="mt-4 text-2xl font-semibold text-slate-100">Actionable recommendations</p>
      <div className="mt-5 space-y-3 text-sm text-slate-300">
        {suggestions.length > 0 ? (
          suggestions.map((item, index) => (
            <p key={index}>• {item}</p>
          ))
        ) : (
          <p>Good resume structure. Add quantifiable accomplishments for stronger impact.</p>
        )}
      </div>
    </motion.div>
  );
}
