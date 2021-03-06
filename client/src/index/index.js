import Vue from 'vue';
import App from './app';
import { initSW } from '#/common/util';

const vm = new Vue({
  render: h => h(App),
}).$mount();
document.body.appendChild(vm.$el);
initSW();
