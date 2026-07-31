/** Sohbet mesaj rolü */
export type MessageRole = 'user' | 'assistant' | 'system';

/** Tek bir sohbet mesajı */
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;    // ISO format
}

/** Sohbet oturumu */
export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

/** Önceden tanımlı sohbet önerileri */
export const CHAT_SUGGESTIONS = [
  { label: '📅 Haftalık Diyet Programı', prompt: 'haftalik_diyet_programi' },
  { label: '🍽️ Günlük menü oluştur', prompt: 'Bana bugün için sağlıklı bir Türk mutfağı menüsü oluştur.' },
  { label: '🔥 Kalori hesapla', prompt: 'Günlük kalori ihtiyacımı hesapla ve bana açıkla.' },
  { label: '🥗 Atıştırmalık öner', prompt: 'Sağlıklı ve düşük kalorili atıştırmalık önerileri ver.' },
  { label: '💪 Protein kaynakları', prompt: 'Türk mutfağında en iyi protein kaynakları nelerdir?' },
] as const;

/** Gemini sohbet için sistem prompt'u */
export const DIET_SYSTEM_PROMPT = `Sen uzman bir diyetisyen ve beslenme uzmanısın. Adın "AI Diyetisyen". 
Türk mutfağı konusunda derin bilgiye sahipsin. 
Kullanıcıya sağlıklı beslenme tavsiyeleri veriyorsun.
Yanıtlarını Türkçe ver. Kısa, net ve pratik ol.
Tıbbi teşhis koymaktan kaçın, genel beslenme tavsiyeleri ver.
Gerektiğinde bir doktora veya diyetisyene başvurmayı öner.`;
