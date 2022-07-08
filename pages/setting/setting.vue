<template>
	<view class="setting">
		<view class="setting_tabbar">
			<view-navbar>
				<template slot="text">
					<text>{{i18n.setting}}</text>
				</template>
			</view-navbar>
		</view>
		<view v-if="!loading" class="setting_content">
			<view class="setting_user" @click="toyourAccount">
				<view class="user_u_em">
					<view class="setting_u">
						<portrait v-if="msg.avatar != ''" portrait_readonly :portrait='msg.avatar'></portrait>
						<defaultProfile v-else :name="msg.userName" :size="100" :fontSize="32"></defaultProfile>
					</view>
					<view class="setting_em">
						<text>{{msg.userName}}</text>
						<text>{{msg.email}}</text>
					</view>
				</view>
				<image src="/static/arrow_right.svg"></image>
			</view>
			<view class="change_type">
				<setting_options :dataList="List" @toggle='toggle' @switchChange='switchChange' @signOut='signOut'>
				</setting_options>
			</view>
		</view>
		<loading v-else status="loading"></loading>
		<!-- Rate弹窗 -->
		<!-- <uni-popup ref="RatePopup" background-color="#fff" @change="change" :mask-click="false"> -->
		<uni-popup ref="RatePopup" background-color="#fff" @change="change">
			<view class="popup-content">
				<text>{{i18n.Rate_us}}</text>
				<text>{{i18n.Rate_content}}</text>
				<uni-rate :margin="RateMargin" :touchable="false" :size="RateSize" color="#D0D0D0" active-color="orange"
					v-model="rateValue" @change="onChange" />
				<navigator type="default" @click="popupClose">{{i18n.Close}}</navigator>
			</view>
		</uni-popup>
		<view-tabbar :current="1"></view-tabbar>
	</view>

</template>

<script>
	import {
		mapActions,
		mapGetters,
		mapMutations
	} from 'vuex'
	import portrait from '@/components/portrait/portrait.vue'
	import defaultProfile from '@/components/defaultProfile.vue'
	import setting_options from '@/components/setting_option.vue'

	export default {
		data() {
			return {
				loading: true,
				RateMargin: uni.upx2px(20),
				RateSize: uni.upx2px(66),
				rateValue: 5,
				msg: {},
				List: [{
						content: this.$t('setting').messageN,
						icon: '/static/setting/message.svg',
						status: 'switch',
						methods: ''
					},
					{
						content: this.$t('setting').Rate_us,
						icon: '/static/setting/star.svg',
						status: 'arrow',
						methods: 'toggle'
					},
					{
						content: this.$t('setting').signout,
						icon: '/static/setting/signOut.svg',
						status: '',
						methods: 'signOut'
					}
				],
			}
		},
		components: {
			portrait,
			setting_options,
			defaultProfile
		},
		computed: {
			...mapGetters({
				serviceInfo: 'login/serviceInfo',
			}),
			i18n() {
				return this.$t('setting')
			},
		},
		watch: {
			msg() {
				this.loading = false
			},
		},
		onLoad: function() { //query为object类型，会序列化上个页面传递的参数
			this.msg = this.serviceInfo
		},
		onShow() {
			// this.msg = this.serviceInfo
			uni.hideTabBar({
				animation: false
			})
		},
		methods: {
			...mapMutations({
				SOCKET_CLOSE: 'socket/store_socket_close'
			}),
			...mapActions('login', ['loginOut']),
			toyourAccount() {
				const msg = {
					avatar: this.msg.avatar,
					userName: this.msg.userName,
					email: this.msg.email
				}
				uni.navigateTo({
					url: '/pages/setting/comps/yourAccount'
				});
			},
			switchChange(type) {
				console.log('点击switch,当前状态为' + type);
			},
			toggle() {
				// open 方法传入参数 等同在 uni-popup 组件上绑定 type属性
				this.$refs.RatePopup.open('center')
			},
			popupClose() {
				this.$refs.RatePopup.close()
			},
			change(e) {
				// console.log('当前模式：' + e.type + ',状态：' + e.show);
				// this.show = e.show
			},
			onChange(e) {
				if (JSON.stringify(e.value) > 3) {
					this.link()
				} else {
					this.$msg.msg('Thank you for your feedback')
				}
				this.popupClose()
				// console.log('rate发生改变:' + JSON.stringify(e))
				// console.log(this.rateValue);
			},
			link() {
				// #ifdef APP-PLUS
				plus.runtime.openURL(
					'https://apps.shopify.com/self-faq?#modal-show=ReviewListingModal'
				) //这里默认使用外部浏览器打开而不是内部web-view组件打开
				// #endif
				// #ifdef H5
				window.open('https://apps.shopify.com/self-faq?#modal-show=ReviewListingModal')
				// #endif
			},
			signOut() {
				this.loginOut().then(res => {
					this.SOCKET_CLOSE()
					uni.reLaunch({
						url: '/pages/login/login'
					})
				})
			},
		}
	}
</script>

<style scoped lang="scss">
	.setting {
		height: 100%;
		background-color: #F4F4F4;
		overflow: hidden;
	}

	.setting_content {
		width: 100%;
		// height: 100vh;
		// transform: translateY(90upx);
		padding-top: 64upx;

		.setting_user {
			background-color: #fff;
			height: 100upx;
			padding: 44upx 32upx;
			display: flex;
			align-items: center;
			justify-content: space-between;

			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;

			.user_u_em {
				width: 80%;
				display: flex;
				align-items: center;

				.setting_em {
					display: flex;
					flex-direction: column;
					align-items: flex-start;
					justify-content: space-between;
					width: 95%;
					margin-left: 22upx;

					text {
						font-size: $font-size-lg - 2upx;
						font-weight: 600;

						width: 100%;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;

						&:last-child {
							font-size: $font-size-lg - 4upx !important;
							font-weight: 400;
							color: rgba(0, 0, 0, 0.7);
						}
					}
				}
			}

			image {
				width: 12upx;
				height: 22upx;
			}
		}

		.change_type {
			margin-top: 64upx;
		}
	}

	// Rate弹窗
	::v-deep .uni-popup .uni-popup__wrapper {
		width: 72% !important;
		border-radius: 28upx !important;

		.popup-content {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			text-align: center;

			>text {
				margin: 0 32upx;
				font-size: $font-size-lg - 6upx !important;
				font-weight: 400;
				margin-bottom: 24upx;

				&:first-child {
					margin-top: 56upx;
					margin-bottom: 14upx;
					font-size: $font-size-lg + 2upx !important;
					font-weight: 600;
				}
			}

			navigator {
				margin-top: 56upx;
				width: 100%;
				text-align: center;
				border-top: 1upx solid rgba(60, 60, 67, 0.36);
				padding: 26upx 0;
				font-size: $font-size-lg + 2upx !important;
				font-weight: 600;
				border-radius: 0 0 28upx 28upx;
			}
		}
	}

	::v-deep .uni-rate {
		.uni-rate__icon {
			.uni-icons {
				font-size: $font-size-lg + 34upx !important;
			}
		}
	}

	::v-deep .portrait {
		.small {
			image {
				width: 20upx !important;
			}
		}
	}
</style>
