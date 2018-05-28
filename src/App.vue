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
  methods: {
    loadHistory() {
      this.getData().then(response => {
        console.log(response)
        this.createDemoList()
        this.$refs.scroller.finishPullDown()
        setTimeout(() => {
          this.$refs.scroller.scrollToBottom()
        }, 3000)
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
      for (let i = 0; i < 200; i++) {
        count++
        height = (count % 3) === 0 ? 140 : (count % 3 === 1) ? 70 : (count % 3 === 2) ? 120 : 0
        this.chatList.unshift({
          data: count,
          height: height
        })
      }
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
}
// .item-0 {
//   height: 140px;
// }
// .item-1 {
//   height: 70px;
// }
// .item-2 {
//   height: 120px;
// }
html, body {
  margin: 0;
  background-color: yellow;
  display: flex;
  align-items: center;
  flex: 1;
  height: 100%;
  width: 100%;
}

</style>
