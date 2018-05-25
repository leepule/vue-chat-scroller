<template>
  <div class="vue-chat-scroller" ref="scroller">
    <ul class="vue-chat-list" :style="{paddingTop: `${currentHeight}px`}">
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
      <li :ref="`${itemClass}-${item.data.index}`" v-for="item in visibleItems" :class="`${itemClass}-${item.data.index}`" :key="item.data.index" :data-height="item.height">
        <slot name="item" :data="item.data" :height="item.height"></slot>
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
      windowHeight: 0
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
    },
    displayItemSize: {
      type: Number,
      default: 100,
    }
  },
  computed: {
    scrollPaddingTop() {
      if (this.scroll) {
        // if (this.scrollerHeight < - this.windowHeight) {
          return (this.scroll.scrollerHeight / 2 - this.windowHeight)
        // }
      }
      return 0
    },
    visibleItems() {
      // return this.items.slice()
      return this.items.slice(Math.max(0, this.startItem - this.size), Math.min(this.items.length, this.startItem + this.size))
    },
  },
  watch: {
    chatList() {
      this._setItem()
    }
  },
  // watch: {
  //   scrollToHeight(newVal, oldVal) {
  //     this.$nextTick(() => {
  //       console.log('old scroll height:', this.oldScrollHeight)
  //       console.log('new scroll height:', this.newScrollHeight)
  //       console.log(this.scrollToHeight)
  //       if (this.oldScrollHeight !== 0) {
  //         this.scroll.scrollTo(0, -this.scrollToHeight, 0)
  //       }
  //     })
  //   }
  // },
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
      console.log('onScroll', pos)
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
      }
      this.loadingData = true
      this.$emit('onPullingDown')
    },
    _onRefresh() {
      console.log('_onRefresh')
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
        if (this.items[i].height > this.currentHeight) {
          console.log('_updateStartItem', this.items[i].height  + ':' + this.currentHeight)
          this.startItem = Math.max(0, i)
          break
        }
      }
      // this.scroll.refresh()
    },
    _setItem() {
      this.items = []
      let heightCounter = 0
      this.chatList.forEach((item, index) => {
        heightCounter = heightCounter + 20
        this.items.push({
          data: item,
          height: heightCounter
        })
      })
      this.$forceUpdate()
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