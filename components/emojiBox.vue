<template>
	<view class="emojiBoxContainer"
		:style="{ 'max-height': isShow ? keyboardHeight + 'px' : '0', 'padding': isShow ? '20upx' : '0 20upx' }">
		<scroll-view scroll-y="true">
			<view class="mostUse-tip emoji-tip" v-if="most_use_emoji_status">Recently Used</view>
			<view class="mostUse-emojiBox" v-if="most_use_emoji_status">
				<view class="emojiItem" v-for="(item, index) in use_emoji" :key="index" @click="chooseEmoji(item)">{{ item }}</view>
			</view>
			<view class="allEmoji-tip emoji-tip">All Stickers</view>
			<view class="all-emojiBox">
				<view class="emojiItem" v-for="(item, index) in emojiLibs" @click="chooseEmoji(item.char)" :key="index">{{ item.char }}</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex'
	export default {
		data() {
			return {
				totalNum: 200,
				most_use_emoji_status: false,
				use_emoji: [],
				keyboardHeight: 227,
				emojiLibs: ''
			}
		},
		created() {
			// 通用emoji
			this.emojiLibs = require('@/assets/emojiLib/emoji.json')
		},
		props: {
			isShow: {
				type: Boolean,
				default: false
			}
		},
		computed: {
			...mapGetters(['deviceInfo']),
		},
		mounted() {
			const _this = this
			// 获取键盘高度
			uni.onKeyboardHeightChange(res => {
				if (res.height > 0 && res.height != _this.deviceInfo.keyboardHeight) {
					let list = _this.deviceInfo
					list.keyboardHeight = res.height
					_this.$store.commit('GET_DEVICEINFO', list)
				}
			})
			// this.keyboardHeight = uni.getStorageSync('DEVICEINFO').keyboardHeight || 227;
			uni.getStorage({
				key: 'MOST_EMOJI_INDEX',
				fail() {

				},
				success(res) {
					_this.most_use_emoji_status = true
					_this.use_emoji = [...new Set(res.data.slice(0, 9))]
				}
			})
		},
		methods: {
			chooseEmoji(emoji) {
				this.$emit('chooseEmoji', emoji)
				uni.getStorage({
					key: 'MOST_EMOJI_INDEX',
					fail(res) {
						uni.setStorage({
							key: 'MOST_EMOJI_INDEX',
							data: [emoji]
						})
					},
					success(res) {
						let emojiData = res.data
						emojiData.unshift(emoji)
						// 当输入近期使用过的表情，插入后，需将以前重复的删掉，去重
						emojiData = [...new Set(emojiData)]
						uni.setStorage({
							key: 'MOST_EMOJI_INDEX',
							data: emojiData
						})
					}
				})
			}
		},
		beforeDestroy() {
			uni.offKeyboardHeightChange(res => {
			})
		}
	}
</script>

<style lang="scss" scoped>
	.emojiBoxContainer {

		background: #F8F8F8;
		backdrop-filter: blur(60px);
		overflow-y: auto;
		box-sizing: border-box;


		.emoji-tip {
			font-size: 24upx;
			font-family: SF-Pro;
			font-weight: 400;
			color: #000000;
			margin-bottom: 20upx;
		}

		// .mostUse-emojiBox {
		// 	display: flex;
		// 	flex-wrap: wrap;
		// 	.emojiItem {
		// 		width: 12.5%;
		// 		height: 64upx;
		// 		background: url("~@/assets/emojiLib/emojiLibs.png") 0 0 no-repeat;
		// 		text-decoration: none;
		// 		list-style-type: none;
		// 		user-select: none;
		// 		/* -webkit-user-select: none; */
		// 		cursor: pointer;
		// 		margin-bottom: 20upx;
		// 		background-size: 64upx;
		// 	}
		// }

		.all-emojiBox,
		.mostUse-emojiBox {
			display: flex;
			flex-wrap: wrap;

			.emojiItem {
				color: black;
				width: 11.11%;
				font-size: 48upx;
				text-align: center;
				// background: url("~@/assets/emojiLib/emojiLibs.png") 0 0 no-repeat;
				text-decoration: none;
				list-style-type: none;
				user-select: none;
				/* -webkit-user-select: none; */
				cursor: pointer;
				margin-bottom: 20upx;
				background-size: 22px;
				font-family: Segoe UI Emoji;
			}
		}
	}
</style>
