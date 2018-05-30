<template>
  <div class="vue-chat-scroller" ref="scroller">
    <ul class="vue-chat-list" :style="{paddingTop: `${listPaddingTop}px`, paddingBottom: `${listPaddingBottom}px`}">
      <div class="pulldown" :style="{height: `${pullDownBlockY}px`}" v-show="pullDownBlockY > 5">
        <span v-show="(pullDownBlockY < (options.pullDownRefresh.threshold || 40)) && !loadingData">
          <slot name="pulldown-pull-to-load">
            pull down to load data
          </slot>
        </span>
        <span v-show="(pullDownBlockY >= (options.pullDownRefresh.threshold || 40)) && !loadingData">
          <slot name="pulldown-before-load">
            release to refresh
          </slot>
        </span>
        <span v-show="(pullDownBlockY >= (options.pullDownRefresh.threshold || 40)) && loadingData">
          <slot name="pulldown-after-load">
            loading.......
          </slot>
        </span>
      </div>
      <!--  :style="{visibility: item.height >= currentHeight - 500 ? 'visible': 'hidden'}" -->
      <li :ref="`${itemClass}-${item.index}`" v-for="item in visibleItems" :class="`${itemClass}-${item.index}`" :key="item.index">
        <slot name="item" :data="item.data" :height="item.height">
        </slot>
      </li>
    </ul>
  </div>
</template>

<script>
import BScroll from 'better-scroll'
export default {
  name: 'vue-chat-scroller',
  data() {
    return {
      topItem: '',
      chatList: [],
      scroll: null,
      scrollPaddingBottom: 0,
      pullDownBlockY: 0,
      loadingData: false,
      items: [],
      scrollToElementCallBackBoolean: false,
      currentHeight: 0,
      startItem: 0,
      windowHeight: 0,
      start: 0,
      end: 0,
      startHeight: 0,
      topOffsetHeight: 0,
      chatListLength: 0,
      itemIndex: 1
    }
  },
  props: {
    options: {
      type: Object,
      default: {
        scrollbar: true,
        probeType: 3,
        pullDownRefresh: {
          threshold: 40,
          stop: 40
        }
      }
    },
    itemClass: {
      type: String,
      default: 'item'
    },
    
    loadHistory: {
      type: Function,
      default: () => {
        console.warn('you have not implement the loadHistory default function, please implement it!')
      }
    },
    size: {
      type: Number,
      default: 50
    }
  },
  computed: {
    visibleItems() {
      /**
       * 保证滑动到底部一定有100个dom
       **/
      this.end = Math.min(this.items.length, this.startItem + this.size > this.size * 2 ? this.startItem + this.size : this.size * 2)
      if (this.end === this.items.length) {
        this.start = (this.end - this.size * 2) >= 0 ? (this.end - this.size * 2) : 0
      } else {
        this.start = Math.max(0, this.startItem - this.size)
      }
      this._setStartHeight()
      return this.items.slice(this.start, this.end)
    },
    listTotalHeight() {
      let height = 0
      this.items.forEach(item => {
        height += item.height
      })
      return height
    },
    listPaddingTop() {
      return this.visibleItems[0] ? ((this.startHeight - this.visibleItems[0].height) > 0 ? (this.startHeight - this.visibleItems[0].height) : 0) : 0
    },
    listPaddingBottom() {
      return this.listTotalHeight - this.listPaddingTop - this.showableHeight
    },
    showableHeight() {
      let height = 0
      this.visibleItems.forEach((item) => {
        height += item.height
      })
      return height
    }
  },
  watch: {
    visibleItems() {
      this.$nextTick(() => {
        this._setItemHeight()
      })
    }
  },
  created() {
  },
  mounted() {
    this.$nextTick(() => {
      this.scroll = new BScroll(this.$refs.scroller, this.options)
      this.scroll.on('scroll', this._onScroll)
      this.scroll.on('pullingDown', this._onPullingDown)
      this.scroll.on('refresh', this._onRefresh)
      this.loadHistory()
    })
  },
  methods: {
    _onScroll(pos) {
      this.currentHeight = pos.y < 0 ? Math.abs(pos.y) : 0
      this._setPullDownBlockY(pos)
      this._updateStartItem(pos)
      if (pos.y < 0) {
        this.scroll.refresh()
      }
    },
    _onPullingDown() {
      if (this.chatList.length > 0) {
        this.topItem = `.${this.itemClass}-${this.chatList.length}`
        this.topOffsetHeight = this.listTotalHeight
      }
      this.loadingData = true
      this.$emit('onPullingDown')
    },
    _onRefresh() {
      if (this.scrollToElementCallBackBoolean === true) {
        setTimeout(() => {
          this.scroll.scrollToElement(this.topItem, 0, false, 0)
          this._setPullDownBlockY({
            y: 0
          })
        }, 100)
        this.scrollToElementCallBackBoolean = false
      }
      this.resizeWindow()
    },
    _setStartHeight() {
      let height = 0
      for (let i = 0; i < this.items.length; i++) {
        if (i <= this.start) {
          height += this.items[i].height
        } else {
          break
        }
      }
      this.startHeight = height
    },
    _setPullDownBlockY(pos) {
      if (pos.y > 0) {
        this.pullDownBlockY = pos.y
      } else {
        this.pullDownBlockY = 0
      }
    },
    _updateStartItem(pos) {
      let counter = 0
      for (let i = 0; i < this.items.length; i++) {
        counter += this.items[i].height
        if (counter > this.currentHeight) {
          this.startItem = Math.max(0, i)
          break
        }
      }
    },
    _setItemHeight() {
      let totalItemsHeight = 0
      this.items.forEach(item => {
        if (this.$refs['item-' + item.index]) {
          if (this.$refs['item-' + item.index][0]) {
            item.height = this.$refs['item-' + item.index][0].offsetHeight
          }
        }
      })
    },
    resizeWindow() {
        if (this.windowHeight !== this.$el.offsetHeight) {
          this.windowHeight = this.$el.offsetHeight
        }
    },
    _updateAddMessageItems(oldListLength, newListLength) {
      let list = []
      for (let i = oldListLength - 1; i < newListLength - 1; i++) {
        list.push({
          data: this.chatList[i],
          index: this.itemIndex,
          height: 0
        })
        this.itemIndex++
      }
      this.items = [...this.items, ...list]
    },
    
    _updateLoadMessageItems(oldListLength, newListLength) {
      let list = []
      for (let i = newListLength - oldListLength - 1; i >= 0; i--) {
        list.unshift({
          data: this.chatList[i],
          index: this.itemIndex,
          height: 0
        })
        this.itemIndex++
      }
      this.items = [...list, ...this.items]
    },
    /**
     * export api scrollToBottom
     */
    scrollToBottom() {
      setTimeout(() => {
        let h = this.listTotalHeight - this.windowHeight
        this.scroll.scrollTo(0, -h, 300)
      }, 100)
    },
    /**
     * export api add message
     */
    addMessage(msgList) {
      let oldListLength = this.chatList.length
      this.chatList = [...this.chatList, ...msgList]
      let newListLength = this.chatList.length
      this._updateAddMessageItems(oldListLength, newListLength)
    },
    /**
     * export api load message
     */
    loadMessage(msgList) {
      let oldListLength = this.chatList.length
      this.chatList = [...msgList, ...this.chatList]
      let newListLength = this.chatList.length
      this._updateLoadMessageItems(oldListLength, newListLength)
    },
    /**
     * export api finishPullDown
     */
    finishPullDown() {
        this.scrollToElementCallBackBoolean = true
        this.loadingData = false
        setTimeout(() => {
          this.scroll.refresh()
          setTimeout(() => {
            this.scroll.finishPullDown()
          }, 500)
        }, 100)
    }
  },
}
</script>

<style lang="scss" scoped>
.vue-chat-scroller {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: #eee;
  .vue-chat-list {
    padding: 0;
    margin: 0;
    list-style-type: none;
  }
  .pulldown {
    text-align: center;
  }
}
</style>