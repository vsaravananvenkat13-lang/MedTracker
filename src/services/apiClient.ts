import { ParsedMedicine } from './geminiService';
import { ChatMessage } from './chatService';

// Get auth token from wherever it's stored (using authStore)
let authToken: string | null = null;

export function setAuthToken(token: string) {
  authToken = token;
}

async function callAPI<T>(endpoint: string, method: string = 'POST', body?: any): Promise<T> {
  if (!authToken) {
    throw new Error('Authentication required. Please log in.');
  }

  const response = await fetch(`/api/${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `API error: ${response.statusText}`);
  }

  return response.json();
}

export async function parseMedicineInput(input: string): Promise<ParsedMedicine> {
  const result = await callAPI<ParsedMedicine>('ai/parse-medicine', 'POST', { input });
  return result;
}

export async function parsePrescriptionImage(base64Image: string): Promise<ParsedMedicine[]> {
  const result = await callAPI<ParsedMedicine[]>('ai/parse-prescription', 'POST', { image: base64Image });
  return result;
}

export async function getChatResponse(history: ChatMessage[], message: string, language: string = 'en'): Promise<string> {
  const result = await callAPI<{ response: string }>('ai/chat', 'POST', { history, message, language });
  return result.response;
}

export async function getBehavioralAnalysisInsights(stats: any, language: string = 'en'): Promise<string> {
  const result = await callAPI<{ insights: string }>('ai/behavior-insights', 'POST', { stats, language });
  return result.insights;
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  if (!text || !targetLanguage || targetLanguage === 'en') return text;
  const result = await callAPI<{ text: string }>('ai/translate', 'POST', { text, targetLanguage });
  return result.text;
}

export async function getMedicineInsights(medicineName: string, dosage: string, frequency: string, instructions?: string, language: string = 'en'): Promise<string> {
  const result = await callAPI<{ insights: string }>('ai/medicine-insights', 'POST', { medicineName, dosage, frequency, instructions, language });
  return result.insights;
}
