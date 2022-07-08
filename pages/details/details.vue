<template>
	<view class="detail">
		<view-navbar class="header" back>
			<template slot="text">
				<text>{{this.$t('details').Conversation_details}}</text>
			</template>
		</view-navbar>
		<!-- <view class="detail_content" :style="{marginTop: `calc(88upx + ${$store.state.deviceInfo.statusBarHeight}px)`}"> -->
		<view class="detail_content">
			<view v-if="!loading">
				<view class="de_id">
					<text>ID: {{roomInfo.id}}</text>
					<text>{{this.$t('details').Brand}}: {{sessionInfo.brand || '-'}} </text>
				</view>
				<!-- CustomerInfo -->
				<view class="de_card">
					<view class="car_content">
						<view class="car_name">
							<defaultProfile class='avatar' :name="sessionInfo.customerName" :size="50" :fontSize="16">
							</defaultProfile>
							<text>{{sessionInfo.customerName}}</text>
						</view>
						<view class="list">
							<customerInfo :sessionInfo='sessionInfo'></customerInfo>
						</view>
					</view>
				</view>
				<!-- Note -->
				<!-- 				<view class="de_card">
					<view class="car_content">
						<view class="car_name">
							<text>{{i18n.Note}}</text>
						</view>
						<view class="list">
							<note :sessionInfo='sessionInfo'></note>
						</view>
					</view>
				</view> -->
			</view>
			<loading v-else status="loading"></loading>
		</view>
	</view>
</template>

<script>
	import defaultProfile from '@/components/defaultProfile.vue'
	import faq from '@/api/faq.js'
	import chat from '@/api/chat.js'
	import customerInfo from './component/customerInfo.vue'
	// import note from './component/note.vue'
	import {
		transformTime
	} from '@/utils/publicMethods.js'
	import {
		mapGetters
	} from 'vuex'

	export default {
		data() {
			return {
				loading: true,
				sessionInfo: [],
				// 顾客当地时间
				transformTime: '',
				// 定时器
				timer: null,
				msg: '',
				navigatorList: [this.$t('details').location, this.$t('details').Shop_Name]
			};
		},
		computed: {
			...mapGetters({
				serviceInfo: 'login/serviceInfo',
				roomInfo: 'chat/roomInfo'
			}),
			i18n() {
				return this.$t('details');
			}
		},
		components: {
			defaultProfile,
			customerInfo,
			// note
		},
		onShow() {
			this.init()
		},
		watch: {
			sessionInfo(current) {
				clearInterval(this.timer)
				this.sessionInfo.localTime = transformTime(Number(current.timeZone))
				this.timer = setInterval(() => {
					this.sessionInfo.localTime = transformTime(Number(current.timeZone))
				}, 30 * 1000)
				if (current.location == ',') {
					current.location = '-'
				}
				// if (!current.phone) {
				// 	this.phoneInputShow = false
				// } else {
				// 	this.phoneInputShow = true
				// 	this.phoneInput = current.phone
				// 	this.remarksInput = current.Remarks
				// }
			},
		},
		methods: {
			init() {
				const params = {
					firstSendUid: this.roomInfo.firstSendUid,
					firstSendUidType: this.roomInfo.firstSendUidType,
					siteId: this.roomInfo.siteId
				}

				faq.newCustomerServiceDetail(params).then(res => {
					if (res.data.code !== 200) return
					this.sessionInfo = res.data.data
					if (this.serviceInfo.isSystemShop) {
						this.GetShopInfo(res.data.data.domain)
					} else {
						this.loading = false
					}
				}).catch(err => {
					console.log(err);
					this.loading = false
				})
			},
			GetShopInfo(Domain) {
				if (Domain === '-' || Domain === '') {
					Domain = this.serviceInfo.shop
				}
				faq.shopInfo({
					shopId: this.serviceInfo.shopId,
					customerShopDomain: Domain
				}).then((res) => {
					if (res.data.code === 200) {
						this.sessionInfo.shopifyPlan = res.data.data.shopifyPlan
						this.sessionInfo.willdeskPlan = res.data.data.willdeskPlan
						this.sessionInfo.branding = res.data.data.branding
						this.sessionInfo.review = parseInt(res.data.data.review)
						this.loading = false
					}
				}).catch(err => {
					console.log(err);
					this.loading = false
				})
			}
		}
	}
</script>

<style scoped lang="scss">
	.detail_content {
		width: 100%;
		// padding-top: 90upx;

		.de_id {
			padding: 32upx 64upx;
			display: flex;
			align-items: center;
			justify-content: space-between;

			text {
				font-size: 24upx !important;
				font-family: SFPro-Regular, SFPro;
				font-weight: 400;
				color: rgba(0, 0, 0, 0.6);
			}
		}

		.de_card {
			padding: 0 32upx;
			margin-bottom: 32upx;

			.car_content {
				box-shadow: 0upx 8upx 44upx 0upx rgba(0, 0, 0, 0.1);
				border-radius: 24upx;

				.car_name {
					padding: 32upx;
					border-bottom: 1px solid rgba(0, 0, 0, 0.13);
					display: flex;
					align-items: center;

					text {
						font-size: 30px;
						font-weight: 600;
						color: #000000;
					}

					.avatar {
						margin-right: 12upx;
					}
				}

				.list {
					padding: 32upx;

					::v-deep .de_list:not(:first-child) {
						margin-top: 42upx;
					}
				}
			}
		}
	}
</style>
