import pdf from 'pdf-parse';

export async function extractTextFromPdf(fileBuffer: Buffer): Promise<string> {
  const data = await pdf(fileBuffer);
  const rawText = data.text?.trim() ?? '';
  if (!rawText) {
    throw new Error('Unable to extract text from the uploaded PDF. Please verify the file.');
  }
  return rawText;
}
