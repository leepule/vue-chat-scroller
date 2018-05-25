import Vue from 'vue'
import App from './App.vue'
import vueChatScroller from './lib/index'
Vue.use(vueChatScroller)
new Vue({
    el: '#app',
    render: h => h(App)
})