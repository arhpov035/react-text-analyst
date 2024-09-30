import { useState } from 'react';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});

// Описание структуры сообщений для чата
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const useOpenAICompletion = () => {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]); // Используем правильную типизацию для сообщений

  const getCompletion = async (prompt: string, text: string) => {
    setLoading(true);
    setError(null);

    // Обновляем историю сообщений: добавляем системное сообщение и сообщение пользователя
    const updatedMessages: Message[] = [
      ...messages,
      { role: 'system', content: prompt },
      { role: 'user', content: text },
    ];

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: updatedMessages, // Передаем историю сообщений
      });

      const assistantMessage = completion.choices[0].message?.content ?? '';

      // Сохраняем результат и обновляем историю сообщений
      setResult(assistantMessage);
      setMessages([
        ...updatedMessages,
        { role: 'assistant', content: assistantMessage }, // Добавляем ответ ассистента в историю
      ]);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Функция для сброса истории сообщений и начала нового чата
  const resetChat = () => {
    setMessages([]); // Очищаем историю сообщений
    setResult(null); // Очищаем результат
  };

  return { getCompletion, resetChat, result, loading, error, messages };
};



// import { useState } from 'react';
// import OpenAI from 'openai';
// import { ChromaClient, Collection } from 'chromadb'; // Убедитесь, что импорт правильный

// const openai = new OpenAI({
//   apiKey: process.env.REACT_APP_OPENAI_API_KEY,
// });

// const chroma = new ChromaClient(); // Убираем 'url', так как он не поддерживается

// interface Message {
//   role: 'system' | 'user' | 'assistant';
//   content: string;
// }

// export const useOpenAICompletionWithChroma = () => {
//   const [result, setResult] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [collection, setCollection] = useState<Collection | null>(null);

//   // Создание или получение коллекции в ChromaDB
//   const initChromaCollection = async () => {
//     try {
//       const col = await chroma.createCollection('chat-history');
//       setCollection(col);
//     } catch (err) {
//       console.error('Error creating Chroma collection:', err);
//     }
//   };

//   const getCompletion = async (prompt: string, text: string) => {
//     setLoading(true);
//     setError(null);

//     const updatedMessages: Message[] = [
//       ...messages,
//       { role: 'system', content: prompt },
//       { role: 'user', content: text },
//     ];

//     try {
//       if (!collection) {
//         await initChromaCollection(); // Инициализируем коллекцию при первом вызове
//       }

//       const completion = await openai.chat.completions.create({
//         model: 'gpt-4o-mini',
//         messages: updatedMessages,
//       });

//       const assistantMessage = completion.choices[0].message?.content ?? '';

//       // Сохраняем результат и обновляем историю сообщений
//       setResult(assistantMessage);
//       setMessages([
//         ...updatedMessages,
//         { role: 'assistant', content: assistantMessage },
//       ]);

//       // Сохраняем данные в ChromaDB
//       if (collection) {
//         await collection.add({
//           embeddings: [[0]], // Здесь должен быть вектор (векторизация через модель)
//           documents: [text],
//           metadatas: [{ role: 'user', content: text }],
//         });

//         await collection.add({
//           embeddings: [[0]], // Здесь должен быть вектор
//           documents: [assistantMessage],
//           metadatas: [{ role: 'assistant', content: assistantMessage }],
//         });
//       }
//     } catch (err: any) {
//       setError(err.message || 'Something went wrong');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetChat = () => {
//     setMessages([]);
//     setResult(null);
//   };

//   return { getCompletion, resetChat, result, loading, error, messages };
// };
