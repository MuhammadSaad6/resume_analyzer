# Smart Resume Analyzer

AI-powered resume review built with Next.js 15 App Router, Gemini, and PDF parsing.

## Features

- Drag-and-drop PDF resume upload
- Gemini AI resume analysis
- ATS compatibility scoring
- Strengths, weaknesses, missing skills, and role match insights
- Responsive modern UI with Tailwind CSS and Framer Motion
- Dark mode / light mode toggle
- Error handling for invalid files and API failures

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Add environment variable:

Create a `.env.local` file at the project root with:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

3. Run the development server:

```bash
npm run dev
```

4. Open http://localhost:3000

## Project Structure

- `src/app` – Next.js App Router pages and API routes
- `src/components` – Reusable UI components
- `src/hooks` – Client hooks and analysis logic
- `src/lib` – PDF parser and Gemini integration
- `src/types` – TypeScript models

## Notes

- This project uses the Gemini API via the OpenAI SDK and expects a valid `GEMINI_API_KEY`.
- The analysis route extracts text from PDF resumes using `pdf-parse` and sends it to Gemini for JSON output.

## Production

Build for production:

```bash
npm run build
```

Start production server:

```bash
npm run start
```
