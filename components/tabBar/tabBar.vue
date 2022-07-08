<template>
	<!-- <view class="tabbar" :style="{'padding-bottom': paddingBottomHeight + 'rpx'}"> -->
	<view class="tabbar" @touchmove.stop.prevent="stopPenetrate">
		<view class="tabbar-item" v-for="(item, index) in list" :key="index" @click="tabbarChange(item)">
			<view v-if="item.name == 'chat'">
				<badge :text="$store.state.msgNum">
					<image :src="current == index ? item.icon_a : item.icon" mode="aspectFit" lazy-load></image>
				</badge>
			</view>
			<view v-else>
				<image :src="current == index ? item.icon_a : item.icon" mode="aspectFit" lazy-load></image>
			</view>
			<view class="item-name" :class="{'tabbarActive': current == index}" v-if="item.text">{{item.text}}
			</view>
		</view>
	</view>
</template>

<script>
	import badge from '@/components/badge/badge.vue'
	import chat from '@/api/chat.js'
	import {
		mapGetters,
		mapActions
	} from 'vuex'
	export default {
		props: {
			current: Number
		},
		data() {
			return {
				paddingBottomHeight: 0, //苹果X以上手机底部适配高度
				list: [{
					name: 'chat',
					icon: '/static/tab/tab-chat.svg', //未选中图标
					icon_a: '/static/tab/tab-chat-current.svg', //选中图片
					path: "/pages/chat/chat", //页面路径
				}, {
					name: 'setting',
					icon: '/static/tab/tab-setting.svg',
					icon_a: '/static/tab/tab-setting-current.svg',
					path: "/pages/setting/setting",
				}],
				isMsgNum: this.$store.state.msgNum
			};
		},
		components: {
			badge
		},
		computed: {
			...mapGetters({
				serviceInfo: 'login/serviceInfo'
			}),
		},
		created() {
			let that = this;
			let model = ['X', 'XR', 'XS', '11', '12', '13', '14', '15'];
			model.forEach(item => {
				//适配iphoneX以上的底部，给tabbar一定高度的padding-bottom
				if (this.$store.state.deviceInfo.model.indexOf(item) != -1 && this.$store.state.deviceInfo.model
					.indexOf('iPhone') != -1) {
					that.paddingBottomHeight = 40;
				}
			})
		},
		mounted() {
			this.OSSUpload();
			//调用 显示未回复的消息数量
			this.tabbarNum()
		},
		methods: {
			...mapActions({
				OSSUpload: 'OSSUpload',
			}),
			// 防止触摸穿透(避免底部元素滚动或被点击)
			stopPenetrate() {
				return
			},
			tabbarChange(item) {
				uni.switchTab({
					url: item.path
				})
			},
			//显示 未回复的消息数量
			tabbarNum() {
				const param = {
					uid: this.serviceInfo.id,
					uType: this.serviceInfo.uType,
					platform: this.serviceInfo.platform,
					siteIds: this.serviceInfo.siteIds
				}
				chat.newGetUnReplyNumber(param).then(res => {
					this.$store.commit('CHANGE_NUM', res.data.data.total)
					// console.log('???',res.data.data.total);
				})
			}
		},
	};
</script>

<style lang="scss" scoped>
	.tabbarActive {
		color: $color-primary !important;
	}

	.tabbar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		// bottom: var(--window-bottom);
		display: flex;
		justify-content: space-around;
		align-items: center;
		width: 100%;
		height: calc(98upx + constant(safe-area-inset-bottom));
		height: calc(98upx + env(safe-area-inset-bottom));
		background-color: rgba(255, 255, 255, 0.7);
		overflow: hidden;
		border-top: 1upx solid rgba(0, 0, 0, 0.10);
		z-index: 10;
		padding-bottom: 0;
		margin-bottom: 0;

		&::before {
			content: "";
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background-attachment: fixed;
			background-color: #fff;
			// backdrop-filter: blur(20px);

			z-index: -1;
		}

		.tabbar-item {
			width: 50%;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			height: 98upx;
			transition: all 0.2s ease;

			&:active {
				// border-radius: 49upx;
				// background: rgba(#ccc, 0.5);
			}

			image {
				width: 44upx;
				height: 44upx;
			}

			.item-name {
				color: rgba(0, 0, 0, 0.2);
				font-size: $font-size-lg !important;
			}

			::v-deep .uni-cover-view {
				color: rgba(0, 0, 0, 0.14);
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
			}
		}
	}
</style>
