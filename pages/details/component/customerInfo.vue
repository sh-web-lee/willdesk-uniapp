<template>
	<view>
		<!-- Local Time -->
		<view class="de_list">
			<view>
				<text class="list_name">{{i18n.Local_Time}}</text>
			</view>
			<view class="content">
				<text>{{sessionInfo.localTime || '-'}}</text>
			</view>
		</view>
		<!-- location -->
		<view class="de_list">
			<view>
				<text class="list_name">{{i18n.location}}</text>
			</view>
			<view class="content">
				<text v-if="!serviceInfo.locationIsLock || serviceInfo.isSystemShop">{{sessionInfo.location}}</text>
				<text v-else>-</text>
			</view>
		</view>
		<!-- email  -->
		<view class="de_list" v-show="!sessionInfo.isVisitor">
			<view>
				<text class="list_name">{{i18n.Email}}</text>
			</view>
			<view class="content">
				<text>{{sessionInfo.email || '-'}}</text>
			</view>
		</view>
		<!--phone  -->
		<view class="de_list">
			<view>
				<text class="list_name">{{i18n.Phone}}</text>
			</view>
			<view class="content">
				<text>{{sessionInfo.phone || '-'}}</text>
			</view>
		</view>
		<!-- Visitor type -->
		<view class="de_list">
			<view>
				<text class="list_name">{{i18n.Visitor_Type}}</text>
			</view>
			<view class="content">
				<text>{{sessionInfo.isVisitor === 0 ? 'User':'Visitor'}}</text>
			</view>
		</view>
		<!-- User Id -->
		<view class="de_list">
			<view>
				<text class="list_name">{{i18n.User_Id}}</text>
			</view>
			<view class="content">
				<text>{{sessionInfo.customerId || '-'}}</text>
			</view>
		</view>
		<!-- Last seen time -->
		<view class="de_list">
			<view>
				<text class="list_name">{{i18n.Last_Seen_Time}}</text>
			</view>
			<view class="content">
				<text>{{roomInfo.lastMsgTime || '-'}}</text>
			</view>
		</view>
		<!-- Shop url -->
		<view class="de_list" v-if="sessionInfo.userShop">
			<view>
				<text class="list_name">{{i18n.Shop_URL}}</text>
			</view>
			<view class="content">
				<view class="link" @click="link(sessionInfo.userShop)">
					{{sessionInfo.userShop || '-'}}
				</view>
			</view>
		</view>
		<block v-if="serviceInfo.isSystemShop">
			<!-- Shopify plan -->
			<view class="de_list">
				<view>
					<text class="list_name">{{i18n.Shopify_plan}}</text>
				</view>
				<view class="content">
					<text>{{sessionInfo.shopifyPlan || '-'}}</text>
				</view>
			</view>
			<!-- Willdesk plan -->
			<view class="de_list">
				<view>
					<text class="list_name">{{i18n.Willdesk_plan}}</text>
				</view>
				<view class="content">
					<text>{{sessionInfo.willdeskPlan || '-'}}</text>
				</view>
			</view>
			<!-- Branding -->
			<view class="de_list">
				<view>
					<text class="list_name">{{i18n.Branding}}</text>
				</view>
				<view class="content">
					<text>{{sessionInfo.branding || '-'}}</text>
				</view>
			</view>
			<!-- Review -->
			<view class="de_list">
				<view>
					<text class="list_name">{{i18n.Review}}</text>
				</view>
				<view class="content">
					<uni-rate :readonly="true" color="#D0D0D0" active-color="orange" :value="sessionInfo.review" />
				</view>
			</view>
		</block>
	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex'
	export default {
		data() {
			return {}
		},
		computed: {
			...mapGetters({
				serviceInfo: 'login/serviceInfo',
				roomInfo: 'chat/roomInfo',
			}),
			i18n() {
				return this.$t('details');
			}
		},
		props: {
			sessionInfo: Object,
		},
		methods: {
			link(link) {
				// #ifdef APP-PLUS
				plus.runtime.openURL('https://' + link) //这里默认使用外部浏览器打开而不是内部web-view组件打开
				// #endif
				// #ifdef H5
				window.open('https://' + link)
				// #endif
			},
		}
	}
</script>

<style lang="scss">
	.de_list {
		display: flex;
		align-items: center;
		justify-content: space-between;

		.list_name {
			font-size: 28upx !important;
			font-family: SFPro-Regular, SFPro;
			font-weight: 400;
			color: rgba(0, 0, 0, 0.5);
		}

		.content {
			max-width: 308upx;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;

			.link {
				color: $color-primary !important;
			}

			text {
				color: #000;
			}

			.link,
			text {
				width: 100%;
				font-size: $font-size-lg - 4upx !important;
				font-weight: 400;

				/*强制文字在一行文本框内*/
				white-space: nowrap !important;
				overflow: hidden !important;
				text-overflow: ellipsis !important;
			}
		}
	}
</style>
