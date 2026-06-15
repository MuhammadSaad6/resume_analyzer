'use client';

import { motion } from 'framer-motion';
import { CardTitle, CARD_FRAME_CLASS_NAME } from '@/components/AllCradsStyling';

type MissingSkillsCardProps = {
  missingSkills: string[];
};

export function MissingSkillsCard({ missingSkills }: MissingSkillsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2 }}
      className={`glass-card rounded-3xl border p-6 shadow-glass ${CARD_FRAME_CLASS_NAME}`}
    >
      <CardTitle className="text-sm uppercase tracking-[0.24em]">Missing Skills</CardTitle>
      <p className="mt-4 text-2xl font-semibold text-slate-100">Skills to add</p>
      <div className="mt-5 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
        {missingSkills.length > 0 ? (
          missingSkills.map((skill, index) => (
            <span key={index} className="rounded-2xl bg-slate-950/70 px-3 py-2 text-sm text-slate-100">
              {skill}
            </span>
          ))
        ) : (
          <p>No significant skills gaps detected. Resume appears skill-complete.</p>
        )}
      </div>
    </motion.div>
  );
}
