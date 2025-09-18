import THEventBus from './THEventBus';

class WebSocketService {
  private websocket: WebSocket | null = null;

  private readonly wsUrl: string;

  public isConnected = false;

  constructor(wsUrl: string) {
    this.wsUrl = wsUrl;
    this.addNetworkListeners();
  }

  public connect() {
    if (this.websocket) {
      return;
    }

    this.websocket = new WebSocket(this.wsUrl);
    this.websocket.binaryType = 'arraybuffer';
    this.websocket.addEventListener('open', this.onOpen.bind(this));
    this.websocket.addEventListener('message', WebSocketService.onMessage);
    this.websocket.addEventListener('close', this.onClose.bind(this));
    this.websocket.addEventListener('error', this.onError.bind(this));
  }

  private onOpen() {
    console.log('远程协助-WebSocket connection opened');
    this.isConnected = true;
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
    THEventBus.emit('ThWsClose');
  }

  private onError(error: any) {
    console.error('TH-WebSocket error', error, this);
    THEventBus.emit('ThWsError');
  }

  public sendMessage(message: any) {
    if (this.websocket && this.isConnected) {
      this.websocket?.send(message);
    }
  }

  public close() {
    if (this.websocket) {
      this.websocket?.close();
      this.websocket = null;
    }
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
