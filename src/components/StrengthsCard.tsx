'use client';

import { motion } from 'framer-motion';
import { CardTitle, CARD_FRAME_CLASS_NAME } from '@/components/AllCradsStyling';

type StrengthsCardProps = {
  strengths: string[];
};

export function StrengthsCard({ strengths }: StrengthsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className={`glass-card rounded-3xl border p-6 shadow-glass ${CARD_FRAME_CLASS_NAME}`}
    >
      <CardTitle className="text-sm uppercase tracking-[0.24em]">Strengths</CardTitle>
      <p className="mt-4 text-2xl font-semibold text-slate-100">Well-aligned highlights</p>
      <div className="mt-5 space-y-3 text-sm text-slate-300">
        {strengths.length > 0 ? (
          strengths.map((item, index) => (
            <p key={index}>• {item}</p>
          ))
        ) : (
          <p>No strengths identified. Improve achievements and technical clarity.</p>
        )}
      </div>
    </motion.div>
  );
}
