<template>
	<!-- Typing状态 -->
	<view class="chatItem" v-if="true">
		<view class="avatar">
			<!-- <view v-if="!userInfo.avatar" class="fontAvatar">HR</view>
      <img v-else :src="userInfo.avatar" alt="" /> -->
			<image :src="avatar(userInfo)" alt="" />
		</view>
		<view class="chatItemInfo">
			<view class="user">
				<view class="username">
					{{ userInfo.firstSendName }}
				</view>
				<view class="splitSymbol">-</view>
				<view class="currentTime">
					<!-- {{  (chatItemInfo && chatItemInfo.sendTime) || formatTime }} -->
				</view>
			</view>
			<view class="chatContentContainer">
				<view class="chatContent Typing">
					<view style="margin-right:8px" :style="{ backgroundColor: `${typingBg1}` }"></view>
					<view style="margin-right:8px" :style="{ backgroundColor: `${typingBg2}` }"></view>
					<view :style="{ backgroundColor: `${typingBg3}` }"></view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	// 声明一个定时器
	// import moment from 'moment'
	import {
		textToImg
	} from '@/utils/publicMethods'
	let typingStyle

	export default {
		name: 'Typing',

		props: {
			// 用户信息
			userInfo: {
				type: Object
			},
			isTyping: {
				type: Boolean

			},
			chatItemInfo: {
				type: Object
			}
		},
		// watch(){
		//   isTyping()
		// },
		data() {
			return {
				// typing: 'Typing&nbsp;&nbsp;&nbsp;'
				typingBg1: '#727272',
				typingBg2: '#888888',
				typingBg3: '#AAAAAA'

			}
		},
		mounted() {
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
		beforeDestroy() {
			clearInterval(typingStyle)
		},
		computed: {
			avatar() {
				return function(userInfo) {
					return textToImg(userInfo.firstSendName) || require('@/assets/img/default_avatar.png')
				}
			}
		},
		methods: {
			// 正在输入的样式
			// typingStyle () {
			//   // "Typing&nbsp;&nbsp;&nbsp;",
			//   const words = this.typing.substr(0, 6)
			//   let symbol = this.typing.substr(6)
			//   const index = symbol.lastIndexOf('&nbsp;')
			//   // 如果发现空格并且空格没有替换完
			//   symbol =
			//     index != -1 && index != 3
			//       ? symbol.replace('&nbsp;', '.')
			//       : '&nbsp;&nbsp;&nbsp;'
			//   this.typing = words + symbol
			// }
		},
		filters: {
			// 格式化时间
			formatTime(time) {
				return moment(parseInt(time)).format('MMM DD,YYYY HH:mm')
			}
		}
	}
</script>

<style scoped lang="less">
	.chatItem {
		margin: 26px;
		display: flex;
		justify-content: flex-start;
	}

	.avatar {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		overflow: hidden;

		.fontAvatar {
			background-color: #697ad7;
			color: white;
			line-height: inherit;
			text-align: center;
			user-select: none;
		}

		image {
			height: 100%;
		}
	}

	.chatItemInfo {
		flex: 1;
		margin: 0 10px;

		.user {
			margin-bottom: 10px;
			color: #727272;
			font-size: 12px;
			font-family: SF-Pro;
			font-weight: 400;
			display: flex;
			align-items: flex-start;
			line-height: 12px;
			user-select: none;

			.splitSymbol {
				margin: 0 3px;
			}
		}

		.chatContentContainer {
			display: flex;

			.chatContent {
				display: flex;
				align-items: center;
				min-height: 40px;
				max-width: 70%;
				min-width: 50px;
				width: fit-content;
				padding: 10px 16px;
				background: #e4e4e4;
				font-size: 14px;
				font-family: SF-Pro;
				font-weight: 400;
				color: #292929;
				line-height: 20px;
				box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
				border-radius: 0px 12px 12px 12px;
				word-break: break-all;
			}
		}
	}

	.chatContentImg {
		max-width: 70%;
		background: #f0f2ff;
		box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.12);
		display: flex;
		align-items: center;

		image {
			border-radius: 0px 12px 12px 12px;
			max-width: 260px;
			cursor: pointer;
		}
	}

	.Typing view {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background-color: #727272;
	}
</style>
