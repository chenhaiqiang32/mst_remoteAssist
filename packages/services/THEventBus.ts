import mitt from 'mitt';

const emitter = mitt();

const THEventBus = {
  on: emitter.on,
  off: emitter.off,
  emit: emitter.emit,
};

export default THEventBus;
