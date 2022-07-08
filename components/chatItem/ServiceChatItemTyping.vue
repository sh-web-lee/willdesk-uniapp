<template>
  <view class="chatItem">
    <view class="chatItemInfo">
      <view class="user">
        <view class="currentTime">
          {{ chatItemInfo.time | formatTime }}
        </view>
        <view class="splitSymbol">-</view>
        <view class="username">
          {{(otherServiceInfo && otherServiceInfo.name) || serviceInfo.userName}}
        </view>
      </view>
      <view class="chatContentContainer">
        <!-- <message-state @reSend="reSend" :contentType="chatItemInfo.contentType" :currentState.sync="chatItemInfo.currentState"></message-state> -->
        <view class="chatContent Typing">
          <view style="margin-right:8px" :style="{ backgroundColor: `${typingBg1}` }"></view>
          <view style="margin-right:8px" :style="{ backgroundColor: `${typingBg2}` }"></view>
          <view :style="{ backgroundColor: `${typingBg3}` }"></view>
        </view>
      </view>
    </view>
    <view class="avatar">
      <!-- 如果其他坐席消息为空，则说明当前消息是本坐席消息 -->
      <image :src="(otherServiceInfo && otherServiceInfo.profile) || serviceInfo.avatar" alt="" />
    </view>
  </view>
</template>

<script>
import { mixin } from '@/mixins/chatItem/chatItem.js'
// import chatBox from '@/api/chatBox.js'
import { getCallTag } from '@/utils/publicMethods'

// 引入组件
// import MessageState from './MessageState'
let typingStyle
export default {
  name: 'serviceChatItem',
  mixins: [mixin],
  // components: { MessageState },
  props: {
    // 坐席信息
    serviceInfo: {
      type: Object,
      require: true
    }
  },
  data () {
    return {
      // 其他坐席的用户信息
      otherServiceInfo: null,
      typingBg1: '#727272',
      typingBg2: '#888888',
      typingBg3: '#AAAAAA'
    }
  },
  created () {
    // 如果信息的坐席id不等于当前登录坐席，则判断为其他坐席
    if (this.chatItemInfo.cid && this.chatItemInfo.cid != this.$store.state.serviceInfo.id) {
      // this.searchServiceInfo(this.chatItemInfo.cid)
      this.getServiceInfo(this.chatItemInfo.cid)
    } else if (this.chatItemInfo.CustomerServiceId && this.chatItemInfo.CustomerServiceId != this.$store.state.serviceInfo.id) {
      // this.searchServiceInfo(this.chatItemInfo.CustomerServiceId)
      this.getServiceInfo(this.chatItemInfo.CustomerServiceId)
    }

    // 如果是call类型就需要将特殊标识转为 call标签
    if (this.chatItemInfo.contentType === 'call') {
      this.chatItemInfo.content = getCallTag(this.chatItemInfo.content)
    }
  },
  mounted () {
    let changeBg1 = ''
    let changeBg2 = ''
    typingStyle = setInterval(() => {
      // this.typingStyle()
      changeBg1 = this.typingBg1
      changeBg2 = this.typingBg2
      this.typingBg1 = this.typingBg3
      this.typingBg2 = changeBg1
      this.typingBg3 = changeBg2
    }, 600)
  },
  beforeDestroy () {
    clearInterval(typingStyle)
  },
  methods: {

    // 从vuex中取出当前坐席的信息
    getServiceInfo (id) {
      this.otherServiceInfo = this.$store.state.serviceInfoList.find(item => item.id == id)
    }
  }
}
</script>

<style scoped lang="less">
  @import url("@/mixins/chatItem/chatItem.less");

  .chatItemInfo {
    .user {
      justify-content: flex-end;
    }

    .chatContentContainer {
      display: flex;
      justify-content: flex-end;

      .chatContent {
        display: flex;
        align-items: center;
        min-height: 40px;
        max-width: 70%;
        min-width: 50px;
        width: fit-content;
        padding: 10px 16px;
        font-size: 14px;
        font-family: SF-Pro;
        font-weight: 400;
        color: #292929;
        line-height: 20px;
        box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
        word-break: break-all;
        border-radius: 12px 0px 12px 12px;
        background-color: #dadfff;
      }

      .chatContentImg {
        border-radius: 12px 0px 12px 12px;
      }
    }
  }

  .callItem {
    background-color: #ffecc1 !important;
  }

  a:hover {
    text-decoration: underline;
  }

  .avatar image {
    object-fit: cover;
  }

  .Typing view {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #727272;
  }
</style>
