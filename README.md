# vue-chat-scroller

> A Vue.js chat scroller

<!-- ## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
``` -->
```js
    npm install vue-chat-scroller --save

    import VueChatScroller from 'vue-chat-scroller'

    Vue.use(VueChatScroller)
 
    // 作为组件的方式使用
    <vue-chat-scroller></vue-chat-scroller>
```

### Props
|    name    |    Description   |   type   |default|
| -----------------  | ---------------- | :--------: | :----------: |
| options       | better-scroll options |Object| { scrollbar: true, probeType: 3, pullDownRefresh: { threshold: 40, stop: 40 } }
| chatList        | 聊天列表 | Array | []
| size        | 能显示的列表长度 | Number | 50

### Events
| name | Description   |
| :--------:   | -----  |
|    onPullingDown    |  上拉加载的回调

### Slots 支持自定义插槽
|    name    |    Description   |   type   |default|
| -----------------  | ---------------- | :--------: | :----------: |
| item       | 列表循环里的每一个子项 |`<template></template>`|| `<div>{{item.index}}</div>`
| pulldown-pull-to-load        | 上拉加载没挂载到钩子|`<template></template>`|| pull down to load data
| pulldown-before-load        | 上拉加载挂载到钩子但是没有开始进行回调|`<template></template>`|| release to refresh
| pulldown-after-load        | 开始进行回调|`<template></template>`| loading.......