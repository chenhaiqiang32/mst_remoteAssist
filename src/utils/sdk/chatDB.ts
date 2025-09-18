import * as ChatPB from '@/utils/proto/chatProtocol';

interface Conversation {
  conversationId: string; // 会话唯一 ID，客户端
  targetId: number; // 会话唯一 ID
  targetName: string; // 会话名称
  targetAvatarUrl: string; // 会话 icon
  unreadCount: number; // 未读数
  sendTime: number; // 发送时间
  name?: string; // 可选字段
  messageType: number; // 消息类型
  content: string; // 最后消息内容
  chatType: number; // 会话类型
  status: number; // 1: 存在 0: 已删除
}

interface Message {
  fingerPrint: string; // 消息唯一 ID
  chatType: number; // 消息类型
  recipientId: number; // 服务端提供的数据 关联 id
  name: string; // 发送人员名称
  avatarUrl: string; // 发送人员 头像
  parentId: string; // 客户端自建的关联 会话 ID
  senderId: number; // 发送者
  messageType: number; // 消息类型
  content: string; // 消息内容
  sendTime: number; // 发送时间
  status?: number; // 0: 已发送， 1:发送中 2: 发送失败
}

export function useChatIndexedDB(dbName: string) {
  const openDB = async (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('messages')) {
          const messageStore = db.createObjectStore('messages', {
            keyPath: 'fingerPrint',
          });
          // 创建 parentId 和 sendTime 的复合索引，用于按 parentId 进行查询并按 sendTime 排序
          messageStore.createIndex('parentId_sendTime', [
            'parentId',
            'sendTime',
          ]);
        }

        if (!db.objectStoreNames.contains('conversations')) {
          const conversationsStore = db.createObjectStore('conversations', {
            keyPath: 'conversationId',
          });
          conversationsStore.createIndex('conversationId_sendTime', [
            'sendTime',
            'conversationId',
          ]);
        }
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  };

  const addConversation = async (conversation: Conversation): Promise<void> => {
    if (!conversation || typeof conversation.conversationId !== 'string') {
      throw new Error('无效的对话对象：缺少或无效的 conversationId');
    }

    const db = await openDB();
    const transaction = db.transaction('conversations', 'readwrite');
    const store = transaction.objectStore('conversations');

    // 检查对话是否已存在
    const existingConversationRequest = store.get(conversation.conversationId);

    return new Promise((resolve, reject) => {
      existingConversationRequest.onsuccess = () => {
        const existingConversation =
          existingConversationRequest.result as Conversation;
        if (existingConversation) {
          // 更新现有对话
          Object.assign(existingConversation, conversation);
          const updateRequest = store.put(existingConversation);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          // 添加新对话
          const addRequest = store.put(conversation);
          addRequest.onsuccess = () => resolve();
          addRequest.onerror = () => reject(addRequest.error);
        }
      };

      existingConversationRequest.onerror = () =>
        reject(existingConversationRequest.error);
    });
  };

  const updateConversations = async (
    conversation: Conversation
  ): Promise<void> => {
    console.log('updateConversations', conversation);
    if (!conversation || typeof conversation.conversationId !== 'string') {
      throw new Error('无效的对话对象：缺少或无效的 conversationId');
    }

    const db = await openDB();

    const transaction = db.transaction('conversations', 'readwrite');
    const store = transaction.objectStore('conversations');

    // 检查对话是否已存在
    const existingConversationRequest = store.get(conversation.conversationId);
    console.log('检查对话是否已存在', existingConversationRequest);
    return new Promise((resolve, reject) => {
      existingConversationRequest.onsuccess = () => {
        const existingConversation =
          existingConversationRequest.result as Conversation;
        try {
          // 确保数据可序列化
          const serializedConversation = JSON.parse(
            JSON.stringify(conversation)
          );

          if (existingConversation) {
            // 更新现有对话
            Object.assign(existingConversation, serializedConversation);
            const updateRequest = store.put(existingConversation);
            updateRequest.onsuccess = () => resolve();
            updateRequest.onerror = () => reject(updateRequest.error);
          } else {
            // 插入新对话
            const addRequest = store.add(serializedConversation);
            addRequest.onsuccess = () => resolve();
            addRequest.onerror = () => reject(addRequest.error);
          }
        } catch (error) {
          reject(new Error('无法序列化的对话对象'));
        }
      };

      existingConversationRequest.onerror = () =>
        reject(existingConversationRequest.error);
    });
  };

  const addConversationByMessage = async (
    message: Message,
    unreadCount?: boolean
  ): Promise<void> => {
    let newConversation: any;
    if (message.chatType === ChatPB.ChatType.GROUP_CHAT) {
      // 群会话-创建
      if (message.messageType === ChatPB.MessageType.SYSTEM) {
        const content = JSON.parse(message.content);
        // 群创建消息
        newConversation = {
          conversationId: message.parentId,
          targetId: content.eventData.groupId,
          targetName: content.eventData.groupName,
          targetAvatarUrl: content.eventData.avatarUrl,
          unreadCount: unreadCount ? 1 : 0,
          sendTime: message.sendTime,
          name: '',
          messageType: message.messageType,
          content: message.content,
          chatType: message.chatType,
          status: 1,
        };
      } else {
        // 群创建消息
        newConversation = {
          conversationId: message.parentId,
          targetId: Number(message.parentId.split('_')[1]),
          targetName: '',
          targetAvatarUrl: '',
          unreadCount: unreadCount ? 1 : 0,
          sendTime: message.sendTime,
          name: '',
          messageType: message.messageType,
          content: message.content,
          chatType: message.chatType,
          status: 1,
        };
      }
    } else {
      // 单聊会话
      // 群创建消息
      newConversation = {
        conversationId: message.parentId,
        targetId: Number(message.parentId.split('_')[1]),
        targetName: message.name,
        targetAvatarUrl: message.avatarUrl,
        unreadCount: unreadCount ? 1 : 0,
        sendTime: message.sendTime,
        name: '',
        messageType: message.messageType,
        content: message.content,
        chatType: message.chatType,
        status: 1,
      };
    }
    addConversation(newConversation);
  };

  const getConversationById = async (
    conversationId: string
  ): Promise<Conversation | null> => {
    const db = await openDB();
    const transaction = db.transaction('conversations', 'readonly');
    const store = transaction.objectStore('conversations');

    return new Promise((resolve, reject) => {
      const request = store.get(conversationId);

      request.onsuccess = () => {
        const conversation = request.result as Conversation | null;
        resolve(conversation); // 如果找不到记录，将返回 null
      };

      request.onerror = () => reject(request.error);
    });
  };

  const getAllConversations = async (
    sort: IDBCursorDirection = 'prev'
  ): Promise<Conversation[]> => {
    const db = await openDB();
    const transaction = db.transaction('conversations', 'readonly');
    const store = transaction.objectStore('conversations');
    const index = store.index('conversationId_sendTime');

    return new Promise((resolve, reject) => {
      const request = index.openCursor(null, sort); // 'prev' 表示按 sendTime 倒序遍历 next
      const conversations: Conversation[] = [];
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          conversations.push(cursor.value);
          cursor.continue(); // 继续遍历下一个记录
        } else {
          resolve(conversations); // 遍历完成后返回结果
        }
      };

      request.onerror = () => reject(request.error);
    });
  };

  const deleteConversation = async (conversationId: string): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction('conversations', 'readwrite');
    const store = transaction.objectStore('conversations');

    return new Promise((resolve, reject) => {
      const request = store.delete(conversationId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  const addMessage = async (
    message: Message,
    isNoRead: boolean
  ): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction(
      ['messages', 'conversations'],
      'readwrite'
    );
    const messageStore = transaction.objectStore('messages');
    const conversationStore = transaction.objectStore('conversations');

    try {
      // console.log('chatDB-addMessage', messageStore, message);
      messageStore.put(message);
      const conversationRequest = conversationStore.get(message.parentId);
      const conversation = await new Promise<Conversation>(
        (resolve, reject) => {
          conversationRequest.onsuccess = () => {
            const result =
              conversationRequest.result as unknown as Conversation;
            resolve(result);
          };
          conversationRequest.onerror = () => reject(conversationRequest.error);
        }
      );
      if (conversation) {
        conversation.content = message.content;
        conversation.sendTime = message.sendTime;
        if (isNoRead) {
          conversation.unreadCount += 1;
        }
        conversationStore.put(conversation);
      } else {
        addConversationByMessage(
          {
            ...message,
          },
          isNoRead
        );
        // throw new Error(`未找到 ID 为 ${message.parentId} 的对话`);
      }
    } catch (error) {
      console.error('Failed to store message or update conversation:', error);
      throw error; // 重新抛出错误以便上层捕获
    }
  };

  const updateMessageByFingerPrint = async (
    fingerPrint: string,
    newContent: Partial<Message>
  ): Promise<void> => {
    if (!fingerPrint) {
      throw new Error('无效的消息对象：缺少或无效的 fingerPrint');
    }

    const db = await openDB();
    const transaction = db.transaction('messages', 'readwrite');
    const store = transaction.objectStore('messages');

    return new Promise((resolve, reject) => {
      // 获取现有的消息
      const request = store.get(fingerPrint);
      request.onsuccess = () => {
        const existingMessage = request.result as Message;
        if (existingMessage) {
          // 合并新内容到现有的消息
          Object.assign(existingMessage, newContent);
          const updateRequest = store.put(existingMessage);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('未找到对应 fingerPrint 的消息'));
        }
      };

      request.onerror = () => reject(request.error);
    });
  };

  const getAllMessages = async (
    conversationId: string,
    sort: IDBCursorDirection = 'next'
  ): Promise<Message[]> => {
    const db = await openDB();
    const transaction = db.transaction('messages', 'readonly');
    const store = transaction.objectStore('messages');
    const index = store.index('parentId_sendTime');
    // 创建一个范围对象，只选择 conversationId 匹配的记录
    const range = IDBKeyRange.bound(
      [conversationId, -Infinity],
      [conversationId, Infinity]
    );

    return new Promise((resolve, reject) => {
      const request = index.openCursor(range, sort); // 'prev' 用于倒序遍历

      const messages: Message[] = [];
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          messages.push(cursor.value);
          cursor.continue(); // 继续迭代
        } else {
          resolve(messages);
        }
      };

      request.onerror = () => reject(request.error);
    });
  };
  const clearTable = async (
    storeName: 'messages' | 'conversations'
  ): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    console.log(`Clearing table: ${storeName}`);

    return new Promise((resolve, reject) => {
      const request = store.clear();

      request.onsuccess = () => {
        console.log(`Table ${storeName} cleared successfully.`);
        resolve();
      };
      request.onerror = () => {
        console.error(`Error clearing table ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  };

  const clearAll = async (): Promise<void> => {
    const db = await openDB();
    const storeNames = Array.from(db.objectStoreNames);

    // 若没有存储对象，直接返回
    if (storeNames.length === 0) {
      console.log('No object stores to clear.');
      return;
    }

    // 在一个事务中执行所有表的清空操作
    const transaction = db.transaction(storeNames, 'readwrite');

    // 创建清空每个表的 Promise 数组
    const clearPromises = storeNames.map((storeName) => {
      return new Promise<void>((resolve, reject) => {
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => {
          console.log(`Table ${storeName} cleared successfully.`);
          resolve();
        };

        request.onerror = () => {
          console.error(`Error clearing table ${storeName}:`, request.error);
          reject(request.error);
        };
      });
    });

    try {
      // 等待所有表清空操作完成
      await Promise.all(clearPromises);
      console.log('All tables cleared.');
    } catch (error) {
      console.error('Error clearing tables:', error);
      throw error;
    }
  };

  return {
    addConversation,
    updateConversations,
    getConversationById,
    getAllConversations,
    deleteConversation,
    addMessage,
    updateMessageByFingerPrint,
    getAllMessages,
    clearTable,
    clearAll,
    openDB,
  };
}

export default null;
