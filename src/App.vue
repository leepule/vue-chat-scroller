<template>
  <div id="app">
    <vue-chat-scroller :options="options" :chatList="chatList" :loadHistory="loadHistory" @onPullingDown="loadHistory" :size="size" ref="scroller">
      <template slot="item" slot-scope="scope">
        <div>
          {{scope.data}} : {{scope.height}}
        </div>
      </template>
      <template slot="pulldown-pull-to-load">
        <div>11111</div>
      </template>
      <template slot="pulldown-before-load">
        <div>22222</div>
      </template>
      <template slot="pulldown-after-load">
        <div>33333</div>
      </template>
    </vue-chat-scroller>
    <div class="scroll-to-bottom-btn" @click="scrollToBottom">
      scroll to bottom
    </div>
  </div>
</template>

<script>
var count = 0
var height = 0
export default {
  name: 'app',
  data () {
    return {
      chatList: [],
      options: {
        scrollbar: true,
        probeType: 3,
        pullDownRefresh: {
          threshold: 40,
          stop: 40
        },
      },
      size: 50
    }
  },
  created() {
    this.addStatsPanel()
  },
  mounted() {
    // let a = new Set([1, 2, 3]);
    // let b = new Set([3, 5, 2]); 

    // // 并集
    // let unionSet = new Set([...a, ...b]);
    // //[1,2,3,5]
    // console.log(unionSet)
    // // 交集
    // let intersectionSet = new Set([...a].filter(x => b.has(x)));
    // // [2,3]
    // console.log(intersectionSet)
    // // ab差集
    // let differenceABSet = new Set([...b].filter(x => !a.has(x)));
    // // [1]
    // console.log(differenceABSet)
    window.onresize = () => {
      this.$refs.scroller.resizeWindow()
    }
  },
  methods: {
    loadHistory() {
      this.getData().then(response => {
        this.createDemoList()
        this.$refs.scroller.finishPullDown()
        // setTimeout(() => {
        //   this.$refs.scroller.scrollToBottom()
        // }, 3000)
      })
    },
    getData() {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, 3000)
      })
    },
    createDemoList() {
      for (let i = 0; i < 50; i++) {
        count++
        height = (count % 3) === 0 ? 140 : (count % 3 === 1) ? 70 : (count % 3 === 2) ? 120 : 0
        this.chatList.unshift({
          count
        })
      }
    },
    scrollToBottom() {
      let h = this.$refs.scroller.listTotalHeight - this.$refs.scroller.windowHeight
      console.log(h)
      this.$refs.scroller.scroll.scrollTo(0, -h, 300)
      console.log(this.$refs.scroller.scroll)
    },
    addStatsPanel() {
        if (window.requestIdleCallback) {
          let self = this
          let stats = new Stats()
          let domPanel = new Stats.Panel('D', '#0ff', '#002')
          stats.addPanel(domPanel)
          stats.showPanel(3)
          document.body.appendChild(stats.dom)
          setTimeout(function timeoutFunc() {
            // Only update DOM node graph when we have time to spare to call
            // numDomNodes(), which is a fairly expensive function.
            requestIdleCallback(() => {
              domPanel.update(self.numDomNodes(document.body), 1500)
              setTimeout(timeoutFunc, 100)
            })
          }, 100)
        }
      },
      numDomNodes(node) {
        if(!node.children || node.children.length == 0) return 0
        let childrenCount = Array.from(node.children).map(this.numDomNodes)
        return node.children.length + childrenCount.reduce(function(p, c){ return p + c; }, 0)
      }
  }
}
</script>

<style lang="scss">
#app {
  height: 100%;
  width: 100%;
  overflow: hidden;
}
li {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #000000;
  height: 90px;
}
.item-0 {
  height: 140px;
}
.item-1 {
  height: 70px;
}
.item-2 {
  height: 120px;
}
html, body {
  margin: 0;
  background-color: yellow;
  display: flex;
  align-items: center;
  flex: 1;
  height: 100%;
  width: 100%;
}
.scroll-to-bottom-btn {
  background-color: burlywood;
  position: absolute;
  bottom: 0;
  right: 0;
  height: 40px;
  width: 100px;
  text-align: center;
  border-radius: 5px;
  cursor: pointer;
}

</style>
