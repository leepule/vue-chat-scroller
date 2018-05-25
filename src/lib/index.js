import VueChatScroller from './vue-chat-scroller.vue'

const chatScroller = {
    install(Vue, options) {
        Vue.component(VueChatScroller.name, VueChatScroller)
    }
}

if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(chatScroller)
}

export default chatScroller