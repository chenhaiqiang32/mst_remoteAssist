import AgoraRTC from 'agora-rtc-sdk-ng';
import THEventBus from '../../services/THEventBus';

class ThRTC {
  private agoraRTC: any = AgoraRTC;

  private client: any = null;

  private appID: any = null;

  private channel: any = null;

  private token: any = null;

  private uid: any = null;

  public localAudioTrack: any = null;

  public localVideoTrack: any = null;

  public localScreenTrack: any = null;

  constructor(data: { appId: any; channel: any; token: string; uid: number }) {
    this.client = AgoraRTC.createClient({
      codec: 'vp8',
      mode: 'rtc',
    });
    this.appID = data.appId;
    this.channel = data.channel;
    this.token = data.token;
    this.uid = data.uid;
    this.hardwareListeners();
    this.listeners();
  }

  /**
   * 监听硬件事件
   */
  private hardwareListeners() {
    // 监听自动播放失败事件
    this.agoraRTC.on('autoplay-failed', (info: any) => {
      console.log('AutoplayFailed', info);
    });
    /**
     * 视频采集设备状态变化回调
     * 该回调提示有摄像头被添加或移除
     * 注意事项：当该回调提示有设备被添加时，如果该设备是虚拟设备，可能无法采集到音频或视频。
     */
    this.agoraRTC.on('camera-changed', (info: any) => {
      console.log('Camera changed!', info.state, info.device);
    });
    /**
     * 音频播放设备状态变化回调。
     * 该回调提示有音频播放设备被添加或移除
     */
    this.agoraRTC.on('playback-device-changed', (info: any) => {
      console.log('Playback device changed!', info.state, info.device);
    });
    /**
     * 音频采集设备状态变化回调。
     * 该回调提示有麦克风被添加或移除
     * 当该回调提示有设备被添加时，如果该设备是虚拟设备，可能无法采集到音频或视频
     */
    this.agoraRTC.on('microphone-changed', (info: any) => {
      console.log('Microphone changed!', info.state, info.device);
    });
  }

  /**
   * 监听RTC事件
   */
  listeners() {
    /**
     * SDK 与服务器的连接状态发生改变回调
     * curState 当前的连接状态
     * revState 之前的连接状态
     * reason 如果 curState 为 "DISCONNECTED"，这里表示断开连接的原因
     */
    // this.client.on(
    //   'connection-state-change',
    //   async (curState: any, revState: any, reason: any) => {
    //     console.log('connection-state-change', curState, revState, reason);
    //   }
    // );
    /**
     * 远端用户或主播加入频道回调
     * 通信场景下，该回调提示有远端用户加入了频道，并返回新加入用户的 ID；如果加入之前，已经有其他用户在频道中了，新加入的用户也会收到这些已有用户加入频道的回调。
     * 直播场景下，该回调提示有主播加入了频道，并返回该主播的 ID。如果在加入之前，已经有主播在频道中了，新加入的用户也会收到已有主播加入频道的回调。Agora 建议连麦主播不超过 17 人。
     * 该回调在以下情况下会被触发：
     * 通信场景的远端用户/直播场景的远端主播调用 join 方法加入频道。
     * 直播场景的远端观众加入频道后调用 setClientRole 将用户角色改变为主播。
     * 通信场景的远端用户/直播场景的远端主播网络中断后重新加入频道。
     * user 加入频道的用户信息
     */
    this.client.on('user-joined', async (user: any) => {
      console.log(
        'client: mst-agora-user-joined',
        user.hasVideo,
        user.hasAudio,
        user,
        Object.getOwnPropertyDescriptors(user)
      );
      THEventBus.emit('mst-agora-user-joined', user);
    });
    /**
     * 远端用户离线回调
     * 该回调通知 app 有远端用户离线，离线包括以下情况：
     * 正常离开：用户会收到类似“再见”的消息，接收此消息后，判断对方离开频道。
     * 超时掉线：在 20 秒内，用户没有收到对方的任何数据包，则判定为对方掉线。在网络较差的情况下，有可能会误报。
     * 用户角色从主播变为观众
     */
    this.client.on('user-left', async (user: any, reason: any) => {
      console.log('client: mst-agora-user-left', user, reason);
      THEventBus.emit('mst-agora-user-left', { user, reason });
    });
    /**
     * 该回调通知远端用户发布了新的音频轨道或者视频轨道
     * user 远端用户信息
     * mediaType 远端用户发布的媒体类型
     */
    this.client.on('user-published', async (user: any, mediaType: any) => {
      console.log('client: user-published', user.hasVideo, user.hasAudio);
      await this.client.subscribe(user, mediaType);
      if (mediaType === 'audio') {
        // 远端音频订阅
        user.audioTrack.play();
      }
      THEventBus.emit('mst-agora-user-published', { user, mediaType });
    });
    /**
     * 该回调通知远端用户取消发布了音频或视频轨道
     */
    this.client.on('user-unpublished', async (user: any, mediaType: any) => {
      console.log('client: user-unpublished', user);
      THEventBus.emit('mst-agora-user-unpublished', { user, mediaType });
    });
    // this.client.on(
    //   'user-user-info-updated',
    //   async (user: any, mediaType: any) => {
    //     console.log('user-user-info-updated', user, mediaType);
    //   }
    // );
    /**
     * SDK 开始尝试重新建立媒体连接（用于发布和订阅）的回调
     * uid 重新建立的媒体连接所对应的用户 ID。如果是本地 uid 说明是重新发布，如果是远端 uid 说明是重新订阅。
     */
    this.client.on('media-reconnect-start', async (uid: any) => {
      console.log('media-reconnect-start', uid);
    });
    /**
     * SDK 重新建立媒体连接（用于发布和订阅）结束的回调
     * uid 重新建立的媒体连接所对应的用户 ID。如果是本地 uid 说明是重新发布，如果是远端 uid 说明是重新订阅。
     */
    this.client.on('media-reconnect-end', async (uid: any) => {
      console.log('media-reconnect-end', uid);
    });
    /**
     * 订阅的视频流类型发生改变回调。
     * 视频流类型改变指视频大流（高码率、高分辨率）变为视频小流（低码率、低分辨率），或视频小流变为视频大流
     * uid 远端流对应的用户
     * streamType 改变后的视频流类型:
     * 0: 视频大流，即高码率、高分辨率的视频流。
     * 1: 视频小流，即低码率、低分辨率的视频流。
     */
    this.client.on('stream-type-changed', async (uid: any, streamType: any) => {
      console.log('stream-type-changed', uid, streamType);
    });
    /**
     * 订阅的音视频流回退为音频流或恢复为音视频流回调
     * 远端流对应的用户 ID
     * isFallbackOrRecover: "fallback" | "recover" 订阅流是回退还是恢复：
     * "fallback": 从音视频流回退为纯音频流。
     * "recover": 从音频流恢复为音视频
     */
    this.client.on(
      'stream-fallback',
      async (uid: any, isFallbackOrRecover: any) => {
        console.log('stream-fallback', uid, isFallbackOrRecover);
      }
    );
    /**
     * 跨频道媒体流转发状态回调。
     * 当跨频道媒体流转发状态发生改变时，SDK 会触发该回调，并报告当前的转发状态以及相关的错误信息。
     * state 跨频道媒体流转发服务的状态
     * code 跨频道媒体流转发错误码
     */
    this.client.on(
      'channel-media-relay-state',
      async (state: any, code: any) => {
        console.log('channel-media-relay-state', state, code);
      }
    );
    /**
     * 跨频道媒体流转发事件回调
     * event: ChannelMediaRelayEvent 相关事件码
     * NETWORK_CONNECTED 用户与服务器建立连接
     * NETWORK_DISCONNECTED 网络中断导致用户与服务器连接断开
     * PACKET_JOINED_DEST_CHANNEL 用户已加入目标频道
     * PACKET_JOINED_SRC_CHANNEL 用户已加入源频道
     * PACKET_RECEIVED_AUDIO_FROM_SRC 服务器收到了目标频道发送的音频流
     * PACKET_RECEIVED_VIDEO_FROM_SRC 服务器收到了目标频道发送的视频流
     * PACKET_SENT_TO_DEST_CHANNEL SDK开始向目标频道发送数据包
     * PACKET_UPDATE_DEST_CHANNEL 目标频道已更新
     * PACKET_UPDATE_DEST_CHANNEL_NOT_CHANGE 目标频道未更新
     * PACKET_UPDATE_DEST_CHANNEL_REFUSED 内部原因导致目标频道更新失败
     */
    this.client.on('channel-media-relay-event', async (event: any) => {
      console.log('channel-media-relay-event', event);
    });
    /**
     * 报告频道内正在说话的远端用户及其音量的回调
     * result level：音量，范围是 0 到 100。 uid：说话者的用户 ID。
     */
    this.client.on('volume-indicator', async (result: any) => {
      console.log('volume-indicator', result);
    });
    /**
     * 该回调表示用户在订阅过程中出现了解密失败，通常是由于和发布端设置的加密参数不一致导致的
     */
    this.client.on('crypt-error', async () => {
      console.log('crypt-error');
    });
    /**
     * Token 即将过期回调。在 token 过期前 30 秒，会收到该回调
     */
    this.client.on('token-privilege-will-expire', async () => {
      console.log('token-privilege-will-expire');
      // 重新申请 token 后
      // await client.renewToken(token);
    });
    /**
     * Token 已过期回调
     */
    this.client.on('token-privilege-did-expire', async () => {
      console.log('token-privilege-did-expire');
      // await client.join(<APPID>, <CHANNEL NAME>, <NEW TOKEN>);
    });
    /**
     * 网络上下行质量报告回调
     * stats 用户加入频道后，SDK 会每 2 秒触发一次该回调，报告本地用户当前的上行和下行网络质量
     */
    this.client.on('network-quality', async (stats: any) => {
      console.log('network-quality', stats);
    });
    /**
     * SDK 监测到异常事件回调。
     * 该回调报告频道内 SDK 监测出的异常事件。
     * 异常事件不是错误，但是一般会引起通话质量问题。发生异常事件后，如果恢复正常，也会收到该回调。
     * 每个异常事件都有对应的恢复事件。
     * 1001	FRAMERATE_INPUT_TOO_LOW	视频采集帧率过低
     * 1002	FRAMERATE_SENT_TOO_LOW	视频发送帧率过低
     * 1003	SEND_VIDEO_BITRATE_TOO_LOW	视频发送码率过低
     * 1005	RECV_VIDEO_DECODE_FAILED	接收视频解码失败
     * 2001	AUDIO_INPUT_LEVEL_TOO_LOW	发送音量过低
     * 2002	AUDIO_OUTPUT_LEVEL_TOO_LOW	接收音量过低
     * 2003	SEND_AUDIO_BITRATE_TOO_LOW	音频发送码率过低
     * 2005	RECV_AUDIO_DECODE_FAILED	接收音频解码失败
     * 恢复事件码
     * 3001	FRAMERATE_INPUT_TOO_LOW_RECOVER	视频采集帧率恢复正常
     * 3002	FRAMERATE_SENT_TOO_LOW_RECOVER	视频发送帧率恢复正常
     * 3003	SEND_VIDEO_BITRATE_TOO_LOW_RECOVER	视频发送码率恢复正常
     * 3005	RECV_VIDEO_DECODE_FAILED_RECOVER	接收视频解码恢复正常
     * 4001	AUDIO_INPUT_LEVEL_TOO_LOW_RECOVER	发送音量恢复正常
     * 4002	AUDIO_OUTPUT_LEVEL_TOO_LOW_RECOVER	接收音量恢复正常
     * 4003	SEND_AUDIO_BITRATE_TOO_LOW_RECOVER	音频发送码率恢复正常
     * 4005	RECV_AUDIO_DECODE_FAILED_RECOVER	接收音频解码恢复正常
     */
    this.client.on('exception', async (code: any, msg: any, uid: any) => {
      console.log('exception', code, msg, uid);
    });
  }

  // 加入房间
  joinRtcRoom() {
    return new Promise((resolve, reject) => {
      this.client.setLowStreamParameter({
        width: 160,
        height: 90,
        framerate: 15,
        bitrate: 120,
      });
      // Enable dual-stream mode.
      this.client
        .enableDualStream()
        .then(() => {
          console.log('Enable Dual stream success!');
        })
        .catch((err) => {
          console.log(err);
        });
      this.client
        .join(this.appID, this.channel, this.token, this.uid)
        .then((response: any) => {
          resolve(response);
        })
        .catch((error: any) => {
          reject(error);
        });
    });
  }

  // 离开房间
  leaveRtcRoom() {
    if (this.client) {
      this.client.leave();
      this.clearRtcOptions();
    }
  }

  /**
   * 清除RTC的状态
   */
  clearRtcOptions() {
    if (this.localAudioTrack) {
      THEventBus.emit('mst-agora-audio-track-close');
      this.localAudioTrack.close();
      this.localAudioTrack = null;
    }
    if (this.localVideoTrack) {
      this.localVideoTrack.close();
      this.localVideoTrack = null;
    }
    if (this.localScreenTrack) {
      this.localScreenTrack.close();
      this.localScreenTrack = null;
    }
    this.client = null;
    this.appID = null;
    this.channel = null;
    this.token = null;
    this.uid = null;
  }

  /**
   * 创建本地媒体流（包含：音频、视频）
   * @param VideoProfile
   * @returns
   */
  createMediaTrack(VideoProfile: any = '1080p') {
    return new Promise((_resolve, reject) => {
      this.getDevices()
        .then((devices: any) => {
          if (devices.audioDevices && devices.audioDevices.length > 0) {
            this.createMicrophoneAudioTrack(devices.audioDevices[0].deviceId);
          }
          if (devices.videoDevices && devices.videoDevices.length > 0) {
            this.createCameraVideoTrack(
              devices.videoDevices[0].deviceId,
              VideoProfile
            );
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * 获取所有设备列表
   * @returns
   */
  // eslint-disable-next-line class-methods-use-this
  getDevices() {
    return new Promise((resolve, reject) => {
      AgoraRTC.getDevices()
        .then((devices) => {
          const audioDevices = devices.filter((device) => {
            return device.kind === 'audioinput';
          });
          const videoDevices = devices.filter((device) => {
            return device.kind === 'videoinput';
          });
          resolve({
            audioDevices,
            videoDevices,
          });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  // 创建本地麦克风音频流
  async createMicrophoneAudioTrack(selectedMicrophoneId: any) {
    this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
      microphoneId: selectedMicrophoneId,
    });
    console.log('localAudioTrack----', this.localAudioTrack);
  }

  /**
   *  创建本地相机视频流
   * optimizationMode: 'detail', 清晰度优先 ， 'motion' 流畅优先
   * */
  async createCameraVideoTrack(
    selectedCameraId: any,
    VideoProfile: any = '1080p',
    optimizationMode: any = 'motion'
  ) {
    console.log('创建本地相机视频流---', this.localVideoTrack);
    this.localVideoTrack = await AgoraRTC.createCameraVideoTrack({
      cameraId: selectedCameraId,
      encoderConfig: VideoProfile,
      optimizationMode,
    });
  }

  // 关闭本地视频流
  async closeCameraVideoTrack() {
    console.log('关闭本地视频流-closeCameraVideoTrack', this.localVideoTrack);
    if (this.localVideoTrack) {
      await this.localVideoTrackUnPush();
      await this.localVideoTrack.close();
      this.localVideoTrack = null;
    }
  }

  /**
   * 本地音频推送
   */
  localAudioTrackPush() {
    if (this.client) {
      this.client.publish(this.localAudioTrack);
      THEventBus.emit('mst-agora-audio-track-open');
    }
  }

  /**
   * 本地音频取消推送
   */
  localAudioTrackUnPush() {
    if (this.client) {
      this.client.unpublish(this.localAudioTrack);
      THEventBus.emit('mst-agora-audio-track-close');
    }
  }

  /**
   * 本地视频推送
   */
  localVideoTrackPush() {
    if (this.client) {
      console.log('本地视频推送', this.localVideoTrack);
      this.client.publish(this.localVideoTrack);
    }
  }

  /**
   * 本地视频取消推送
   */
  async localVideoTrackUnPush() {
    if (this.client) {
      await this.client.unpublish(this.localVideoTrack);
      console.log('本地视频取消推送', this.localVideoTrack);
    }
  }

  /**
   * 设置本地摄像头
   * @param deviceId
   * @returns
   */
  localSetCameraTrack(deviceId: any) {
    return new Promise((resolve, reject) => {
      if (this.localVideoTrack) {
        this.localVideoTrack
          .setDevice(deviceId)
          .then((res: any) => {
            resolve(res);
          })
          .catch((err: any) => {
            reject(err);
          });
      }
    });
  }

  // 设置本地FPS
  localSetOptimizationMode(optimizationMode: any) {
    if (this.localVideoTrack) {
      this.localVideoTrack.setOptimizationMode(optimizationMode);
    }
  }

  /**
   * 设置视频流分辨率
   * @param VideoProfile
   */
  localSetVideoProfile(VideoProfile: any = '1080p') {
    if (this.localVideoTrack) {
      this.localVideoTrack.setEncoderConfiguration({
        encoderConfig: VideoProfile,
      });
    }
  }

  /**
   * 设置开启/关闭音频流
   * @param type
   */
  localAudioTrackMuted(type: any) {
    if (this.localAudioTrack) {
      this.localAudioTrack.setEnabled(type);
      if (type) {
        THEventBus.emit('mst-agora-audio-track-open');
      } else {
        THEventBus.emit('mst-agora-audio-track-close');
      }
    }
  }

  /**
   * 渲染本地视频流
   * @param htmlId
   * @param mirror
   */
  renderLocalStreams(htmlId: any, mirror = false) {
    console.log(`渲染本地视频流-`, htmlId, this.client, this.localVideoTrack);
    if (this.client && this.localVideoTrack) {
      this.localVideoTrack.play(htmlId, {
        fit: 'cover',
        mirror,
      });
    }
  }

  /**
   * 创建屏幕共享视频流
   * optimizationMode
   * "motion": 流畅优先。
   * "detail": 清晰优先。
   */
  async createScreenVideoTrack() {
    try {
      this.localScreenTrack = await AgoraRTC.createScreenVideoTrack({
        encoderConfig: '1080p_1',
        // 设置视频传输优化策略为清晰优先或流畅优先
        optimizationMode: 'detail',
      });
      this.localScreenTrack.on('track-ended', async (user: any) => {
        console.log('client: track-ended', user);
        THEventBus.emit('mst-agora-share-track-ended', user);
      });
      this.localScreenTrack.on('track-updated', async (user: any) => {
        console.log('client: track-updated', user);
      });
      this.localScreenTrack.on('transceiver-updated', async (user: any) => {
        console.log('client: transceiver-updated', user);
      });
    } catch (error) {
      console.log('创建屏幕共享视频流-----error', error);
      THEventBus.emit('mst-agora-share-track-ended');
    }
  }

  /**
   * 屏幕共享视频流推送
   */
  localScreenTrackPush() {
    if (this.client && this.localScreenTrack) {
      console.log('屏幕共享视频流推送', this.localScreenTrack);
      this.client.publish(this.localScreenTrack);
    }
  }

  /**
   * 共享视频流取消推送
   */
  localScreenTrackUnPush() {
    if (this.client && this.localScreenTrack) {
      this.client.unpublish(this.localScreenTrack);
    }
  }

  /**
   * 渲染屏幕共享视频流
   * @param htmlId
   */
  renderLocalScreenStreams(htmlId: any) {
    if (this.localScreenTrack) {
      this.localScreenTrack.play(htmlId, {
        fit: 'cover',
      });
    }
  }

  /**
   * 关闭屏幕共享
   */
  closeScreenVideoTrack() {
    if (this.localScreenTrack) {
      this.localScreenTrackUnPush();
      this.localScreenTrack.close();
      this.localScreenTrack = null;
    }
  }

  /**
   * 渲染远端视频流
   * @param remoteUserId
   * @param htmlId
   */
  async renderRemoteStreams(remoteUserId: any, htmlId: any, type: boolean) {
    if (this.client) {
      const remoteStreams = this.client.remoteUsers;
      if (type) {
        await this.client.setRemoteVideoStreamType(remoteUserId, 0);
      } else {
        await this.client.setRemoteVideoStreamType(remoteUserId, 1);
      }
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < remoteStreams.length; i++) {
        const item = remoteStreams[i];
        console.log('渲染远端视频流-remoteStreams', item);
        if (item.uid === remoteUserId) {
          item.videoTrack.play(htmlId, {
            fit: 'cover',
            mirror: false,
          });
        }
      }
    }
  }

  async stopAudioTrack() {
    if (this.client) {
      const remoteStreams = this.client.remoteUsers;
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < remoteStreams.length; i++) {
        const item = remoteStreams[i];
        console.log('stopAudioTrack---item', item);
        item.audioTrack?.stop();
      }
    }
  }

  async playAudioTrack() {
    if (this.client) {
      const remoteStreams = this.client.remoteUsers;
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < remoteStreams.length; i++) {
        const item = remoteStreams[i];
        item.audioTrack?.play();
      }
    }
  }
}
export default ThRTC;
