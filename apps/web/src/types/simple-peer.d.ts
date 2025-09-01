declare module 'simple-peer' {
  interface SimplePeerOptions {
    initiator?: boolean;
    trickle?: boolean;
    stream?: MediaStream;
    config?: RTCConfiguration;
    constraints?: MediaStreamConstraints;
    channelConfig?: RTCDataChannelInit;
    channelName?: string;
    sdpTransform?: (sdp: string) => string;
    objectMode?: boolean;
    allowHalfTrickle?: boolean;
  }

  interface SimplePeerData {
    [key: string]: any;
  }

  class SimplePeer extends NodeJS.EventEmitter {
    constructor(options?: SimplePeerOptions);
    signal(data: SimplePeerData): void;
    send(data: string | Buffer | Uint8Array | ArrayBufferLike): void;
    addStream(stream: MediaStream): void;
    removeStream(stream: MediaStream): void;
    addTrack(track: MediaStreamTrack, stream: MediaStream): void;
    removeTrack(track: MediaStreamTrack, stream: MediaStream): void;
    replaceTrack(oldTrack: MediaStreamTrack, newTrack: MediaStreamTrack, stream: MediaStream): void;
    destroy(): void;
    readonly destroyed: boolean;
    readonly connected: boolean;
  }

  export = SimplePeer;
}
