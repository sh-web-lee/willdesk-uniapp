<template>
  <div class="SessionState">
    <span>
      {{ operationTip }}
    </span>
  </div>
</template>

<script>
// import moment from 'moment'

import { findServiceInfo } from '@/utils/publicMethods.js'

export default {
  name: 'SessionState',
  props: {
    // 会话状态信息
    sessionInfo: {
      type: Object,
      require: true
    }
  },
  methods: {
    // 格式化时间
    formatTime (time) {
      // console.log(time)

      // 当日时间
      if (this.$moment(parseInt(time)).isSame(new Date().getTime(), 'day')) {
        // return this.$moment(parseInt(time)).format('hh:mm a')
        return this.$moment(parseInt(time)).format('HH:mm')
        // 今年之前的时间
      } else if (this.$moment(parseInt(time)).isBefore(new Date().getTime(), 'year')) {
        // 返回格式：Sep 25,2019（月，日，年），XX：XXam/pm；
        // return this.$moment(parseInt(time)).format('MMM DD,YYYY, hh:mm a')
        return this.$moment(parseInt(time)).format('MMM DD,YYYY, HH:mm')
        // 今年的时间 格式：Sep 25（月，日），XX：XXam/pm；
      } else {
        // return this.$moment(parseInt(time)).format('MMM DD, hh:mm a')
        return this.$moment(parseInt(time)).format('MMM DD, HH:mm')
      }
    }
  },
  computed: {
    // 拼接状态展示语
    operationTip () {
      const jsonContent = this.sessionInfo.content
      if (jsonContent == null || jsonContent == undefined) {
        return
      }
      const sendTime = this.sessionInfo && this.sessionInfo.sendTime && this.formatTime(this.sessionInfo.sendTime)
      const userName = this.sessionInfo && this.sessionInfo.senderUid && findServiceInfo(this.sessionInfo.senderUid).name
      let message = jsonContent.message.replace('{operatorName}', userName).replace('{operationTime}', sendTime)
      if (jsonContent.event == 'allocat') {
        const allocationUid = jsonContent.allocationUid
        const allocationService = findServiceInfo(allocationUid)
        message = message.replace('{allocationName}', allocationService.name)
      }
      return message
    }
  }
}
</script>

<style scoped>
.SessionState {
  text-align: center;
  margin: 40upx 0;
  font-family: SF-Pro;
  font-weight: 400;
	font-size: 24upx;
	padding: 0 32rpx;
  color: #727272;
  /* line-height: 12px; */
}
</style>
