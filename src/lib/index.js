import vueChatScroller from './vue-chat-scroller.vue'

const chatScroller = {
    install(Vue, options) {
        Vue.component(vueChatScroller.name, vueChatScroller)
    }
}

if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(chatScroller)
}

export default chatScroller