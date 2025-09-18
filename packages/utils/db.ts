const DB_NAME = 'MyDatabase';
const CHAT_TABLE_NAME = 'ChatSessions';

interface ChatSession {
  userId: string;
  userName: string;
  userAvatar: string;
  time: number;
  message: string;
}

class IndexDBService {
  private db: IDBDatabase | null = null;

  constructor() {
    this.openDB(); // 在构造函数中调用 openDB 方法
  }

  private openDB(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, 2);

      request.onerror = (event: any) => {
        console.error('Database error: ', event.target?.error?.message);
        reject(event.target?.error?.message);
      };

      request.onsuccess = (event: any) => {
        this.db = event.target?.result;
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        this.db = event.target?.result;

        // 创建聊天会话表
        if (!this.db?.objectStoreNames.contains(CHAT_TABLE_NAME)) {
          const chatStore: any = this.db?.createObjectStore(CHAT_TABLE_NAME, {
            autoIncrement: true,
          });
          chatStore.createIndex('userId', 'userId', { unique: false });
        }
      };
    });
  }

  async deleteChatSessionsTable(): Promise<void> {
    await this.ensureDBInitialized(); // 确保数据库已初始化

    return new Promise((resolve, reject) => {
      if (!this.db) {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject('Database not initialized');
        return;
      }

      if (!this.db.objectStoreNames.contains(CHAT_TABLE_NAME)) {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject(`Object store ${CHAT_TABLE_NAME} not found`);
        return;
      }

      const transaction = this.db.transaction(CHAT_TABLE_NAME, 'readwrite');
      const objectStore = transaction.objectStore(CHAT_TABLE_NAME);

      const request = objectStore.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event: any) => {
        console.error(
          'Error clearing chat sessions table:',
          event.target?.error
        );
        reject(event.target?.error);
      };
    });
  }

  private ensureDBInitialized(): Promise<void> {
    if (this.db) {
      return Promise.resolve();
    }
    return this.openDB();
  }

  async addChatSession(session: ChatSession): Promise<void> {
    await this.ensureDBInitialized(); // 确保数据库已初始化

    return new Promise((resolve, reject) => {
      if (!this.db) {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject('Database not initialized');
        return;
      }

      if (!this.db.objectStoreNames.contains(CHAT_TABLE_NAME)) {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject(`Object store ${CHAT_TABLE_NAME} not found`);
        return;
      }

      const transaction = this.db.transaction(CHAT_TABLE_NAME, 'readwrite');
      const store = transaction.objectStore(CHAT_TABLE_NAME);

      const request = store.add(session);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event: any) => {
        console.error('Error adding chat session:', event.target?.error);
        reject(event.target?.error);
      };
    });
  }

  async getAllChatSessions(): Promise<ChatSession[]> {
    await this.ensureDBInitialized(); // 确保数据库已初始化

    return new Promise((resolve, reject) => {
      if (!this.db) {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject('Database not initialized');
        return;
      }

      if (!this.db.objectStoreNames.contains(CHAT_TABLE_NAME)) {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject(`Object store ${CHAT_TABLE_NAME} not found`);
        return;
      }

      const transaction = this.db.transaction(CHAT_TABLE_NAME, 'readonly');
      const store = transaction.objectStore(CHAT_TABLE_NAME);
      const sessions: ChatSession[] = [];

      store.openCursor().onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          sessions.push(cursor.value);
          cursor.continue();
        } else {
          resolve(sessions);
        }
      };

      transaction.onerror = (event: any) => {
        console.error('Error fetching chat sessions:', event.target?.error);
        reject(event.target?.error);
      };
    });
  }
}

export default IndexDBService;
