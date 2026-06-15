'use client';

import { motion } from 'framer-motion';
import { CardTitle, CARD_FRAME_CLASS_NAME } from '@/components/AllCradsStyling';

type WeaknessesCardProps = {
  weaknesses: string[];
};

export function WeaknessesCard({ weaknesses }: WeaknessesCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      className={`glass-card rounded-3xl border p-6 shadow-glass ${CARD_FRAME_CLASS_NAME}`}
    >
      <CardTitle className="text-sm uppercase tracking-[0.24em]">Weaknesses</CardTitle>
      <p className="mt-4 text-2xl font-semibold text-slate-100">Areas to strengthen</p>
      <div className="mt-5 space-y-3 text-sm text-slate-300">
        {weaknesses.length > 0 ? (
          weaknesses.map((item, index) => (
            <p key={index}>• {item}</p>
          ))
        ) : (
          <p>Well-structured resume. Consider adding measurable outcomes and certifications.</p>
        )}
      </div>
    </motion.div>
  );
}


