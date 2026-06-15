import OpenAI from 'openai';
import type { ResumeAnalysisResult } from '@/types/analysis';

function isQuotaError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('429') || message.toLowerCase().includes('quota');
}

function isScore(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100;
}

function cleanLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function isLikelySectionHeading(value: string) {
  return /^(experience|work experience|professional experience|employment|education|skills|technical skills|projects|summary|objective|profile|contact)\b/i.test(value.trim());
}

function isLikelyJobTitle(value: string) {
  return /\b(intern|internship|developer|engineer|designer|manager|analyst|consultant|specialist|associate|lead|senior|junior|full stack|fullstack|backend|frontend|software|data scientist|product owner|project manager)\b/i.test(
    value.trim()
  );
}

function isLikelyDescriptor(value: string) {
  return /\b(ensuring|seamless|dynamic|passionate|driven|motivated|result[-\s]?oriented|detail[-\s]?oriented|innovative|creative|professional|experienced|skilled|talented|user|system|solution|solutions|building|developing|designing)\b/i.test(
    value.trim()
  );
}

function isLikelyLocation(value: string) {
  return /\b(city|street|road|town|village|district|state|province|country|pakistan|islamabad|lahore|karachi|rawalpindi|faisalabad|multan|peshawar|tarnol|e-?11|e11|dha|bahria|gulberg|f-?10|f10|sector)\b/i.test(value.trim()) || /^[A-Z]\s+[A-Z][a-z]+$/.test(value.trim());
}

function isLikelyName(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    return false;
  }

  if (isLikelySectionHeading(normalized)) {
    return false;
  }

  if (normalized.includes('@') || /\d/.test(normalized)) {
    return false;
  }

  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length > 4 || normalized.length > 50) {
    return false;
  }

  if (/[.!?;,]/.test(normalized)) {
    return false;
  }

  if (/\b(and|or|with|features|feature|features\.|experience|education|skills|resume|cv|profile)\b/i.test(normalized)) {
    return false;
  }

  if (isLikelyJobTitle(normalized)) {
    return false;
  }

  if (isLikelyDescriptor(normalized)) {
    return false;
  }

  if (isLikelyLocation(normalized)) {
    return false;
  }

  return words.every((word) => /^[A-Za-z][a-zA-Z'.-]*$/.test(word));
}

function titleCaseName(value: string) {
  return value
    .split(/\s+/)
    .map((word) => {
      const lower = word.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ')
    .trim();
}

function scoreNameCandidate(value: string, lineIndex: number) {
  const normalized = value.trim();
  const words = normalized.split(/\s+/).filter(Boolean);
  let score = 0;

  if (words.length === 2) {
    score += 6;
  } else if (words.length === 3) {
    score += 5;
  } else if (words.length === 4) {
    score += 2;
  }

  if (normalized.length >= 8 && normalized.length <= 32) {
    score += 4;
  } else if (normalized.length <= 45) {
    score += 2;
  }

  if (!/[.!?;,]/.test(normalized)) {
    score += 2;
  }

  if (lineIndex <= 2) {
    score += 4;
  } else if (lineIndex <= 5) {
    score += 2;
  }

  if (!isLikelyJobTitle(normalized)) {
    score += 6;
  }

  if (!isLikelyDescriptor(normalized)) {
    score += 4;
  }

  if (!isLikelySectionHeading(normalized)) {
    score += 4;
  }

  return score;
}

function isLikelyOwnerName(value: string) {
  const normalized = value.trim();
  if (!isLikelyName(normalized) || isLikelyJobTitle(normalized) || isLikelyDescriptor(normalized) || isLikelyLocation(normalized)) {
    return false;
  }

  const words = normalized.split(/\s+/).filter(Boolean);
  return words.length >= 2 && words.length <= 3;
}

function extractOwnerNameFromNearbyLines(lines: string[]) {
  const contactIndex = lines.findIndex((line) => /@|(\+?\d[\d\s().-]{7,}\d)/.test(line));
  const searchStart = contactIndex >= 0 ? Math.max(0, contactIndex - 6) : 0;
  const searchEnd = contactIndex >= 0 ? Math.min(lines.length, contactIndex + 3) : Math.min(lines.length, 12);
  const windowLines = lines.slice(searchStart, searchEnd);

  const candidates: Array<{ value: string; score: number }> = [];

  windowLines.forEach((rawLine, offset) => {
    const lineIndex = searchStart + offset;
    const line = rawLine.split('|')[0].replace(/\s+/g, ' ').trim();
    if (!line || isLikelySectionHeading(line) || isLikelyJobTitle(line) || isLikelyDescriptor(line) || isLikelyLocation(line)) {
      return;
    }

    const fragments = line
      .split(/[\-–—•·,]/)
      .map((fragment) => fragment.trim())
      .filter(Boolean);

    for (const fragment of fragments) {
      const candidate = fragment.replace(/[^A-Za-z\s'.-]/g, '').trim();
      if (isLikelyOwnerName(candidate)) {
        candidates.push({ value: titleCaseName(candidate), score: scoreNameCandidate(candidate, lineIndex) + 12 });
      }
    }

    const plainCandidate = line.replace(/[^A-Za-z\s'.-]/g, '').trim();
    if (isLikelyOwnerName(plainCandidate)) {
      candidates.push({ value: titleCaseName(plainCandidate), score: scoreNameCandidate(plainCandidate, lineIndex) + 10 });
    }
  });

  const ranked = candidates
    .filter(({ value }) => !/^(Resume|Cv|Curriculum Vitae|Smart Resume Analyzer)$/i.test(value))
    .sort((left, right) => right.score - left.score || left.value.length - right.value.length);

  return ranked[0]?.value ?? '';
}

function extractBestNameCandidate(text: string) {
  const lines = cleanLines(text);
  const firstLines = lines.slice(0, 6);
  for (const rawLine of firstLines) {
    const firstLine = rawLine.split('|')[0].replace(/\s+/g, ' ').trim();
    const firstLineCandidate = firstLine.replace(/[^A-Za-z\s'.-]/g, '').trim();
    if (isLikelyOwnerName(firstLineCandidate)) {
      return titleCaseName(firstLineCandidate);
    }
  }

  const explicitName = findField(lines, [
    /^name\s*[:\-]\s*(.+)$/i,
    /^candidate name\s*[:\-]\s*(.+)$/i,
    /^full name\s*[:\-]\s*(.+)$/i,
  ]);

  if (isLikelyName(explicitName) && !isLikelyJobTitle(explicitName)) {
    return titleCaseName(explicitName);
  }

  const nearbyOwnerName = extractOwnerNameFromNearbyLines(lines);
  if (nearbyOwnerName) {
    return nearbyOwnerName;
  }

  const contactIndex = lines.findIndex((line) => /@|(\+?\d[\d\s().-]{7,}\d)/.test(line));
  const startIndex = contactIndex > 0 ? Math.max(0, contactIndex - 8) : 0;
  const topLines = lines.slice(startIndex, Math.min(lines.length, startIndex + 24));
  const candidates: Array<{ value: string; score: number }> = [];

  topLines.forEach((rawLine, lineIndex) => {
    const line = rawLine.split('|')[0].replace(/\s+/g, ' ').trim();
    if (!line || isLikelySectionHeading(line)) {
      return;
    }

    const fragments = line
      .split(/[\-–—•·,]/)
      .map((fragment) => fragment.trim())
      .filter(Boolean);

    for (const fragment of fragments) {
      const candidate = fragment.replace(/[^A-Za-z\s'.-]/g, '').trim();
      if (isLikelyName(candidate) && !isLikelyJobTitle(candidate)) {
        candidates.push({ value: titleCaseName(candidate), score: scoreNameCandidate(candidate, lineIndex) });
      }
    }

    const plainCandidate = line.replace(/[^A-Za-z\s'.-]/g, '').trim();
    if (isLikelyName(plainCandidate) && !isLikelyJobTitle(plainCandidate)) {
      candidates.push({ value: titleCaseName(plainCandidate), score: scoreNameCandidate(plainCandidate, lineIndex) });
    }
  });

  const ranked = candidates
    .filter(({ value }) => !/^(Resume|Cv|Curriculum Vitae|Smart Resume Analyzer)$/i.test(value))
    .filter(({ value }) => !isLikelyDescriptor(value))
    .filter(({ value }) => !isLikelyLocation(value))
    .sort((left, right) => right.score - left.score || left.value.length - right.value.length);

  return ranked[0]?.value ?? '';
}

function findField(lines: string[], patterns: RegExp[]) {
  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match?.[1]) {
        return match[1].trim();
      }
    }
  }
  return '';
}

function extractSection(lines: string[], sectionName: string) {
  const startIndex = lines.findIndex((line) => new RegExp(`^${sectionName}\\b`, 'i').test(line));
  if (startIndex === -1) {
    return [];
  }

  const collected: string[] = [];
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^(experience|work experience|professional experience|employment|education|skills|technical skills|projects|summary|objective)\b/i.test(line)) {
      break;
    }
    if (line) {
      collected.push(line.replace(/^[•\-*]\s*/, '').trim());
    }
  }

  return collected.filter(Boolean);
}

function extractSkills(lines: string[]) {
  const skillsLine = findField(lines, [
    /^skills?\s*[:\-]\s*(.+)$/i,
    /^technical skills?\s*[:\-]\s*(.+)$/i,
    /^core skills?\s*[:\-]\s*(.+)$/i,
  ]);

  if (skillsLine) {
    return skillsLine
      .split(/[,|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  const skillsSection = extractSection(lines, 'skills');
  if (skillsSection.length > 0) {
    return skillsSection
      .flatMap((line) => line.split(/[,|]/))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function extractFallbackAnalysis(text: string): ResumeAnalysisResult {
  const lines = cleanLines(text);
  const email = findField(lines, [/([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i]);
  const phone = findField(lines, [/(\+?\d[\d\s().-]{7,}\d)/]);
  const name = extractBestNameCandidate(text);

  const skills = extractSkills(lines);
  const experience = extractSection(lines, 'experience');
  const education = extractSection(lines, 'education');

  const hasSkills = skills.length > 0;
  const hasExperience = experience.length > 0;
  const hasEducation = education.length > 0;
  const hasContact = Boolean(email || phone);

  return {
    profile: {
      name,
      email,
      phone,
      skills,
      experience,
      education,
    },
    resumeScore: Math.min(100, Math.max(30, (hasContact ? 25 : 10) + (hasSkills ? 25 : 0) + (hasExperience ? 25 : 0) + (hasEducation ? 25 : 0))),
    atsScore: Math.min(100, Math.max(25, (hasContact ? 30 : 10) + (hasSkills ? 30 : 0) + (hasExperience ? 20 : 0) + (hasEducation ? 20 : 0))),
    strengths: [
      hasContact ? 'Contact details were detected in the resume.' : 'Resume text was extracted successfully.',
      hasSkills ? 'Skills were identified from the document.' : 'Consider adding a dedicated skills section.',
      hasExperience ? 'Experience entries were found.' : 'Add clearer work experience bullets.',
    ],
    weaknesses: [
      !hasContact ? 'Name, email, or phone could not be found reliably.' : 'Some contact details may still need formatting cleanup.',
      !hasEducation ? 'Education details were not clearly separated.' : 'Education section could be easier for ATS systems to parse.',
    ],
    missingSkills: hasSkills ? [] : ['Skills section not detected'],
    jobMatch: {
      frontend: hasSkills ? 55 : 20,
      backend: hasSkills ? 55 : 20,
      fullstack: hasSkills ? 50 : 20,
      aiEngineer: hasSkills ? 40 : 15,
    },
    suggestions: [
      'Use a clear skills section with comma-separated keywords.',
      'List work experience with company, title, dates, and achievements.',
      'Add education details in a separate section for easier parsing.',
    ],
  };
}

function sanitizeProfileName(value: string, fallbackText: string) {
  const directCandidate = extractBestNameCandidate(fallbackText);
  if (isLikelyOwnerName(directCandidate)) {
    return titleCaseName(directCandidate);
  }

  const firstLines = cleanLines(fallbackText).slice(0, 6);
  for (const rawLine of firstLines) {
    const firstLine = rawLine.split('|')[0].replace(/[^A-Za-z\s'.-]/g, '').trim();
    if (isLikelyOwnerName(firstLine)) {
      return titleCaseName(firstLine);
    }
  }

  if (isLikelyOwnerName(value)) {
    return titleCaseName(value.trim());
  }

  if (value && !isLikelySectionHeading(value) && !isLikelyJobTitle(value) && !isLikelyDescriptor(value) && !isLikelyLocation(value)) {
    return titleCaseName(value.trim());
  }

  return directCandidate || '';
}

function getOpenAiClient() {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing API key: set GEMINI_API_KEY or OPENAI_API_KEY in .env.local');
  }

  const isGemini = !!process.env.GEMINI_API_KEY;
  if (isGemini) {
    return new OpenAI({
      apiKey,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    });
  }

  return new OpenAI({ apiKey });
}

export async function analyzeResumeText(text: string): Promise<ResumeAnalysisResult> {
  const prompt = `You are an expert HR recruiter, ATS specialist, and technical hiring manager. Analyze the resume text below and return only valid JSON with the following keys:
- profile: { name, email, phone, skills, experience, education }
- resumeScore
- atsScore
- strengths
- weaknesses
- missingSkills
- jobMatch
- suggestions

Rules:
- profile.name, profile.email, profile.phone must be strings.
- profile.name must be the candidate's real name, not a section heading like Experience, Education, or Skills.
- profile.skills, profile.experience, profile.education must be arrays of strings.
- jobMatch must include frontend, backend, fullstack, and aiEngineer as numbers between 0 and 100.
- If a field is not present in the resume, use an empty string or empty array.
- Do not add markdown, commentary, or extra keys.

Resume text:

${text}`;

  const isGemini = !!process.env.GEMINI_API_KEY;
  const defaultModel = isGemini ? 'gemini-1.5-flash' : 'gpt-4o-mini';
  const model = isGemini
    ? (process.env.GEMINI_MODEL ?? defaultModel)
    : (process.env.OPENAI_MODEL ?? defaultModel);

  const providers = isGemini ? ['gemini', 'openai'] as const : ['openai', 'gemini'] as const;
  let lastError: string | null = null;

  for (const provider of providers) {
    if (provider === 'gemini' && !process.env.GEMINI_API_KEY) {
      continue;
    }
    if (provider === 'openai' && !process.env.OPENAI_API_KEY) {
      continue;
    }

    try {
      const client =
        provider === 'gemini'
          ? new OpenAI({
              apiKey: process.env.GEMINI_API_KEY!,
              baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
            })
          : new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

      const response = await client.chat.completions.create({
        model:
          provider === 'gemini'
            ? (process.env.GEMINI_MODEL ?? 'gemini-1.5-flash')
            : (process.env.OPENAI_MODEL ?? 'gpt-4o-mini'),
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      });

      const output = response.choices?.[0]?.message?.content ?? '';
      if (!output.trim()) {
        throw new Error(`${provider === 'gemini' ? 'Gemini' : 'OpenAI'} returned an empty response.`);
      }

      let cleanedOutput = output.trim();
      if (cleanedOutput.startsWith('```json')) {
        cleanedOutput = cleanedOutput.substring(7);
      } else if (cleanedOutput.startsWith('```')) {
        cleanedOutput = cleanedOutput.substring(3);
      }
      if (cleanedOutput.endsWith('```')) {
        cleanedOutput = cleanedOutput.substring(0, cleanedOutput.length - 3);
      }
      cleanedOutput = cleanedOutput.trim();

      const payload = JSON.parse(cleanedOutput) as ResumeAnalysisResult;

      if (
        typeof payload.profile !== 'object' ||
        payload.profile === null ||
        typeof payload.profile.name !== 'string' ||
        typeof payload.profile.email !== 'string' ||
        typeof payload.profile.phone !== 'string' ||
        !Array.isArray(payload.profile.skills) ||
        !Array.isArray(payload.profile.experience) ||
        !Array.isArray(payload.profile.education) ||
        !isScore(payload.resumeScore) ||
        !isScore(payload.atsScore) ||
        !Array.isArray(payload.strengths) ||
        !Array.isArray(payload.weaknesses) ||
        !Array.isArray(payload.missingSkills) ||
        typeof payload.jobMatch !== 'object' ||
        payload.jobMatch === null ||
        !isScore(payload.jobMatch.frontend) ||
        !isScore(payload.jobMatch.backend) ||
        !isScore(payload.jobMatch.fullstack) ||
        !isScore(payload.jobMatch.aiEngineer) ||
        !Array.isArray(payload.suggestions)
      ) {
        throw new Error('AI response is missing expected analysis fields.');
      }

      return {
        ...payload,
        profile: {
          name: sanitizeProfileName(payload.profile.name, text),
          email: payload.profile.email.trim(),
          phone: payload.profile.phone.trim(),
          skills: payload.profile.skills.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean),
          experience: payload.profile.experience.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean),
          education: payload.profile.education.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean),
        },
        strengths: payload.strengths.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean),
        weaknesses: payload.weaknesses.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean),
        missingSkills: payload.missingSkills.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean),
        suggestions: payload.suggestions.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      lastError = `${provider === 'gemini' ? 'Gemini' : 'OpenAI'} request failed: ${message}`;
      if ((provider === 'openai' && isQuotaError(error) && process.env.GEMINI_API_KEY) || (provider === 'gemini' && isQuotaError(error) && process.env.OPENAI_API_KEY)) {
        continue;
      }
      continue;
    }
  }

  if (lastError) {
    console.warn(`${lastError}. Falling back to local CV extraction.`);
  }

  return extractFallbackAnalysis(text);
}
