import { App } from 'vue';
import THMKitAssist from './views/assist/index.vue';
import THEventBus from './services/THEventBus';
import THImEvent from './utils/sdk/im';
import Msg from './services/msg';

const components = {
  THMKitAssist,
};

const install = (app: App): void => {
  Object.keys(components).forEach((name) => {
    app.component(name, components[name as keyof typeof components]);
  });
};
export { install, THMKitAssist, THEventBus, Msg, THImEvent };

export default {
  install,
};
