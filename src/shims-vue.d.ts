// shims-vue.d.ts

import { ComponentCustomProps as VueComponentCustomProps } from 'vue';

// Define JSX.IntrinsicElements type
declare module '@vue/runtime-core' {
  interface ComponentCustomProps extends VueComponentCustomProps {
    // Replace with actual component names and props as needed
    'a-sub-menu'?: VueComponentCustomProps;
    'a-menu-item'?: VueComponentCustomProps;
    'a-menu'?: VueComponentCustomProps;
    // Add more components if needed
  }
}
