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
      <li :ref="`${itemClass}-${item.index}`" v-for="item in visibleItems" :class="`${itemClass}-${item.index}`" :key="item.data" :style="{'height': `${item.height}px`}">
        <slot name="item" :data="item.data" :height="item.__height__"></slot>
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
      scroll: null,
      scrollPaddingBottom: 0,
      pullDownBlockY: 0,
      loadingData: false,
      items: [],
      itemClass: 'item',
      scrollToElementCallBackBoolean: false,
      currentHeight: 0,
      startItem: 0,
      windowHeight: 0,
      start: 0,
      end: 0,
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
    chatList: {
      type: Array,
      default: []
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
      // return this.items.slice()
      /**
       * 保证滑动到底部一定有100个dom
       * 如果 startItem - size + size * 2 >= startItem + size
       * return startItem - size
       **/
      this.end = Math.min(this.items.length, this.startItem + this.size > this.size * 2 ? this.startItem + this.size : this.size * 2)
      if (this.end === this.items.length) {
        this.start = (this.end - this.size * 2) >= 0 ? (this.end - this.size * 2) : 0
      } else {
        this.start = Math.max(0, this.startItem - this.size)
      }
      return this.items.slice(this.start, this.end)
      // return this.items.slice(Math.max(0, this.startItem - this.size), Math.min(this.items.length, (this.startItem + this.size) >= (this.startItem + this.size * 2) ? (this.starItem + this.size) : (this.startItem + this.size * 2)))
    },
    listTotalHeight() {
      let height = 0
      this.items.forEach(item => {
        height += item.height
      })
      return height
    },
    listPaddingTop() {
      return this.visibleItems[0] ? ((this.visibleItems[0].__height__ - this.visibleItems[0].height) > 0 ? (this.visibleItems[0].__height__ - this.visibleItems[0].height) : 0) : 0
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
    chatList() {
      this._setItem()
    }
  },
  created() {
  },
  mounted() {
    this.$nextTick(() => {
      this.scroll = new BScroll(this.$refs.scroller, this.options)
      window.scroll = this.scroll
      this.loadHistory()
      this.windowHeight = this.$el.offsetHeight
      this.scroll.on('scroll', this._onScroll)
      this.scroll.on('pullingDown', this._onPullingDown)
      this.scroll.on('refresh', this._onRefresh)
    })
  },
  methods: {
    _onScroll(pos) {
      this.currentHeight = pos.y < 0 ? Math.abs(pos.y) : 0
      this._setPullDownBlockY(pos)
      this._updateStartItem(pos)
      if (pos.y < 0 && this.visibleItems.length >= this.size * 2) {
        this.scroll.refresh()
      }
    },
    _onPullingDown() {
      if (this.chatList.length > 0) {
        this.topItem = `.${this.itemClass}-${this.chatList.length}`
      }
      this.loadingData = true
      this.$emit('onPullingDown')
    },
    _onRefresh() {
      if (this.scrollToElementCallBackBoolean === true) {
        this.scroll.scrollToElement(this.topItem, 0, false, -(this.options.pullDownRefresh.threshold || 40))
        setTimeout(() => {
          this._setPullDownBlockY({
            y: 0
          })
        }, 60)
        this.scrollToElementCallBackBoolean = false
      }
    },
    _setPullDownBlockY(pos) {
      if (pos.y > 0) {
        this.pullDownBlockY = pos.y
      } else {
        this.pullDownBlockY = 0
      }
    },
    _updateStartItem(pos) {
      for (let i = 0; i < this.items.length; i++) {
        if (this.items[i].__height__ > this.currentHeight) {
          this.startItem = Math.max(0, i)
          break
        }
      }
      // this.scroll.refresh()
    },
    _setItem() {
      this.items = []
      let index = 0
      let heightCounter = 0
      this.chatList.forEach((item, index) => {
        heightCounter += heightCounter + item.height ? item.height : 80
        this.items.push({
          data: item.data,
          index: ++index,
          height: item.height,
          __height__: heightCounter
        })
      })
      this.$forceUpdate()
    },
    scrollToBottom() {
      this.$nextTick(() => {
        console.log(this.listTotalHeight)
        this.scroll.scrollTo(0, -this.listTotalHeight, 5000)
        this.scroll.refresh()
      })
    },
    // export api finishPullDown
    finishPullDown() {
        this.scroll.finishPullDown()
        this.loadingData = false
        this.$nextTick(() => {
          this.scrollToElementCallBackBoolean = true
          this.scroll.refresh()
        })
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