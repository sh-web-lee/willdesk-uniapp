// 引入库
// import moment from 'moment'
import axios from 'axios'
import ProgressBar from '@/components/ProgressBar.vue'
import Loading from '@/components/Loading.vue'
import moment from 'moment'
import {
  getEmojiByAlt,
  calcImgSize,
  getImgSizeFromSrc
} from '@/utils/publicMethods'

// 是否是本页面发送的图片
let instantImg = false

export const mixin = {
  components: {
    ProgressBar,
    Loading
  },
  props: {
    // chatItem的内容
    chatItemInfo: {
      type: Object,
      require: true
    },
    // 用户信息
    userInfo: {
      type: Object,
      requrie: true
    }
  },
  data () {
    return {
      // 文字类型
      textType: [1, 9, 10],
      // 图片类型
      imgType: [2],
      // 文件类型
      fileType: [6],
      // 评论组件类型
      rateType: [7],
      // 文件的本地url下载地址
      downloadURL: null,
      // 当前的下载进度
      progress: 0,
      // 是否正在下载
      isDownloading: false,
      // 取消下载的方法
      cancelDownloadFunc: null,
      // 图片是否在加载中
      imgLoading: false
    }
  },
  created () {
  },
  methods: {
    // 图片加载完成后的回调 由于图片加载完成后会撑开滚动条，需要再判断是否触底，进而判断是否需要自动滚动到底部
    imgLoad () {
      this.imgLoading = false
      // if (instantImg && !this.$store.state.isPostNextPage) {
        // this.$bus.$emit('imgLoad')
      // }
    },
  }
}
