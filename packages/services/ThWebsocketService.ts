import THEventBus from './THEventBus';

class WebSocketService {
  private websocket: WebSocket | null = null;

  private readonly wsUrl: string;

  public isConnected = false;

  private reconnectAttempts = 0;

  private maxReconnectAttempts = 5;

  private reconnectInterval = 3000; // 3秒

  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(wsUrl: string) {
    this.wsUrl = wsUrl;
    this.addNetworkListeners();
  }

  public connect() {
    if (this.websocket && this.isConnected) {
      return;
    }

    this.websocket = new WebSocket(this.wsUrl);
    this.websocket.binaryType = 'arraybuffer';
    this.websocket.addEventListener('open', this.onOpen.bind(this));
    this.websocket.addEventListener('message', WebSocketService.onMessage);
    this.websocket.addEventListener('close', this.onClose.bind(this));
    this.websocket.addEventListener('error', this.onError.bind(this));
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('WebSocket 重连次数已达上限，停止重连');
      return;
    }

    this.reconnectAttempts += 1;
    console.log(
      `WebSocket 重连尝试 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private onOpen() {
    console.log('远程协助-WebSocket connection opened');
    this.isConnected = true;
    this.reconnectAttempts = 0; // 重置重连计数
    this.clearReconnectTimer(); // 清除重连定时器
    THEventBus.emit('ThWsOpen');
  }

  private static onMessage(event: MessageEvent) {
    const data = new Uint8Array(event.data);
    THEventBus.emit('ThWsMessage', data);
  }

  private onClose(event: CloseEvent) {
    console.log(
      `TH-WebSocket connection closed with code: ${event.code}`,
      this
    );
    this.isConnected = false;
    this.websocket = null;
    THEventBus.emit('ThWsClose');

    // 如果不是主动关闭，则尝试重连
    if (event.code !== 1000) {
      this.reconnect();
    }
  }

  private onError(error: any) {
    console.error('TH-WebSocket error', error, this);
    this.isConnected = false;
    THEventBus.emit('ThWsError');

    // 发生错误时尝试重连
    this.reconnect();
  }

  public sendMessage(message: any) {
    if (this.websocket && this.isConnected) {
      this.websocket?.send(message);
    }
  }

  public close() {
    this.clearReconnectTimer(); // 清除重连定时器
    if (this.websocket) {
      this.websocket?.close();
      this.websocket = null;
    }
    this.isConnected = false;
  }

  // 监听网络变化
  private addNetworkListeners() {
    window.addEventListener('online', this.handleNetworkOnline.bind(this));
    window.addEventListener('offline', this.handleNetworkOffline.bind(this));
  }

  private handleNetworkOnline() {
    console.log('网络-在线', this);
    THEventBus.emit('ThWsIsOnline');
  }

  private handleNetworkOffline() {
    console.log('网络离线', this);
    THEventBus.emit('ThWsIsOutline');
  }
}

const createThWebSocketService = (wsUrl: string) => new WebSocketService(wsUrl);

export default createThWebSocketService;
