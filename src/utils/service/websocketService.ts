import EventListener from '../event-listener';

class WebSocketService {
  private websocket: WebSocket | null = null;

  private reconnectTimeout: number | undefined;

  private retryCount = 0; // 当前重试次数

  private readonly maxRetries: number = 30; // 最大重试次数

  private readonly initialReconnectDelay: number = 3000; // 初始重连延迟时间（毫秒）

  private readonly maxReconnectDelay: number = 60000; // 最大重连延迟时间（毫秒）

  private readonly wsUrl: string;

  public isConnected = false;

  public isReConnect = true;

  constructor(wsUrl: string) {
    this.wsUrl = wsUrl;
    this.connect();
  }

  public connect() {
    if (this.websocket) {
      return;
    }

    console.log('222222222wsUrl>>>>', this.wsUrl);
    this.websocket = new WebSocket(this.wsUrl);
    this.websocket.binaryType = 'arraybuffer';
    this.websocket.addEventListener('open', this.onOpen.bind(this));
    this.websocket.addEventListener('message', this.onMessage.bind(this));
    this.websocket.addEventListener('close', this.onClose.bind(this));
    this.websocket.addEventListener('error', this.onError.bind(this));
  }

  private onOpen() {
    console.log('即时通讯-WebSocket-websocketService connection open');
    this.isConnected = true;
    this.retryCount = 0; // 重置重试次数
    this.clearReconnectTimeout();
    EventListener.emit('im-ws-open');
  }

  public onMessage(event: MessageEvent) {
    const data = new Uint8Array(event.data);
    EventListener.emit('im-ws-message', { data, _self: this });
  }

  private onClose(event: any) {
    console.log(`IM-Connection closed with code: ${event.code}`);
    if (this.isReConnect) {
      this.reconnect();
    }
  }

  private onError(error: any) {
    console.error('IM-WebSocket error', error);
    EventListener.emit('im-ws-error', { error, event: this });
  }

  private reconnect() {
    if (!this.isReConnect) {
      console.log('Max retries reached or reconnection is disabled.');
      return;
    }
    console.log(
      `IM WebSocket reconnecting in ${this.initialReconnectDelay} ms... 重试次数：`,
      this.retryCount
    );
    if (this.retryCount > this.maxRetries) {
      this.stopReconnect();
      EventListener.emit('im-ws-reconnect-failed');
      return;
    }
    this.websocket = null;
    EventListener.emit('im-ws-reconnect-start', {
      retryCount: this.retryCount,
    });
    this.reconnectTimeout = window.setTimeout(() => {
      this.retryCount += 1;
      this.connect();
    }, this.initialReconnectDelay);
  }

  public stopReconnect() {
    console.log('IM WebSocket stop reconnect');
    this.isReConnect = false;
    this.retryCount = 0;
    this.clearReconnectTimeout();
  }

  private clearReconnectTimeout() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = undefined;
    }
  }

  public sendMessage(message: any) {
    if (this.websocket && this.isConnected) {
      this.websocket.send(message);
    } else {
      console.warn('WebSocket is not connected. Message not sent.', message);
    }
  }

  public close() {
    console.log('IM WebSocket close');
    this.stopReconnect();
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }
}

const ChatIMWebSocketService = (wsUrl: string) => new WebSocketService(wsUrl);

export default ChatIMWebSocketService;
