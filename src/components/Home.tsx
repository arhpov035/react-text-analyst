import React, { useEffect, useState } from 'react';

// Тип для события файла
interface FileEvent {
  event: string;
  path: string;
  content: string;
}

const FileWatcher: React.FC = () => {
  const [fileEvents, setFileEvents] = useState<FileEvent[]>([]); // Хранение всех событий файлов
  const [connectionStatus, setConnectionStatus] =
    useState<string>('Connecting...');
  const [previousFileContents, setPreviousFileContents] = useState<
    Record<string, string>
  >({}); // Хранение предыдущих содержимостей файлов

  // Метод для удаления одинаковых событий из массива
  const removeDuplicateEvents = (events: FileEvent[]): FileEvent[] => {
    return events.filter(
      (event, index, self) =>
        index ===
        self.findIndex(
          (e) => e.path === event.path && e.content === event.content
        )
    );
  };

  const sendToServer = (uniqueContent: string): void => {
    // Получаем значение из localStorage
    const storedText = localStorage.getItem('testText') || '';

    // Проверка, если предыдущее состояние в localStorage отличается от нового содержимого
    if (storedText !== uniqueContent) {
      console.log(`${uniqueContent}`);

      // Сохраняем новое значение в localStorage
      localStorage.setItem('testText', uniqueContent);
    }
  };

  useEffect(() => {
    // Функция, которая будет срабатывать перед обновлением страницы
    console.log(
      'process.env.REACT_APP_OPENAI_API_KEY: ' +
        process.env.REACT_APP_OPENAI_API_KEY
    );
    console.log('process.env:', process.env);

    
    const handleBeforeUnload = () => {
      localStorage.removeItem('testText'); // Удаляем значение из localStorage
    };

    // Добавляем обработчик события
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Удаляем обработчик при размонтировании компонента
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Инициализация WebSocket один раз при монтировании компонента
  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket('ws://localhost:8080');

      // Обработка успешного подключения
      ws.onopen = () => {
        setConnectionStatus('Connected');
      };

      // Обработка входящих сообщений
      ws.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);

          if (data.message) {
            // Обработка системного сообщения от сервера
            console.log('Server message:', data.message);
          } else if (data.event && data.content !== undefined) {
            const prevContent = previousFileContents[data.path];

            // Проверяем, изменилось ли содержимое файла
            if (prevContent !== data.content) {
              // Отправляем уникальный текст на сервер
              sendToServer(data.content); // Вызов метода отправки данных на сервер

              // Обновляем события файлов
              setFileEvents((prevEvents) => {
                const updatedEvents = [...prevEvents, data];
                return removeDuplicateEvents(updatedEvents); // Удаляем дубликаты событий
              });

              // Обновляем предыдущее содержимое файла
              setPreviousFileContents((prevContents) => ({
                ...prevContents,
                [data.path]: data.content, // Обновляем содержимое файла по его пути
              }));
            } else {
              console.log(
                `Content of ${data.path} hasn't changed, ignoring event.`
              );
            }
          } else {
            console.warn('Received data has an unexpected format:', data);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      // Обработка ошибок
      ws.onerror = (error) => {
        console.error('WebSocket error: ', error);
        setConnectionStatus('Error');
      };

      // Обработка закрытия соединения
      ws.onclose = () => {
        setConnectionStatus('Disconnected');

        // Переподключение через 5 секунд
        setTimeout(() => {
          connectWebSocket();
        }, 5000);
      };

      return ws;
    };

    const ws = connectWebSocket();

    // Очистка при размонтировании компонента
    return () => {
      ws.close();
    };
  }, []); // Запускаем WebSocket один раз при монтировании компонента

  return (
    <div>
      <h1>File Events</h1>
      <p>Status: {connectionStatus}</p>
      <ul>
        {fileEvents.map((event, index) => (
          <li key={index}>
            <strong>{event.event.toUpperCase()}</strong> - {event.path}
            <pre>{event.content}</pre> {/* Отображение содержимого файла */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileWatcher;
