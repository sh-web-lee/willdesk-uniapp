<template>
	<view class="actions">
		<view-navbar class="header" back>
			<template slot="text">
				<text>{{this.$t('actions').Actions}}</text>
			</template>
		</view-navbar>
		<options :dataList="List" @viewMore='viewMore' @control='control'></options>
	</view>
</template>

<script>
	import {
		mapGetters,
		mapMutations
	} from 'vuex'
	import options from '@/components/optionList/optionList'
	import chat from '@/api/chat.js'
	export default {
		components: {
			options
		},
		data() {
			return {
				ListStatus: 'Open',
				List: [{
						content: this.$t('actions').Close_conversation,
						icon: '/static/chat/Closed1.svg',
						name: 'Close',
						status: '',
						methods: 'control',
						args: 'close',
					},
					{
						content: this.$t('actions').Pending_conversation,
						icon: '/static/chat/Pending1.svg',
						name: 'Pending',
						status: '',
						methods: 'control',
						args: 'wait',
					},
					{
						content: this.$t('actions').Reopen_conversation,
						icon: '/static/chat/Open1.svg',
						name: 'Open',
						status: '',
						methods: 'control',
						args: 'open',
					},
					{
						content: this.$t('actions').Conversation_details,
						icon: '/static/default.svg',
						name: 'default',
						status: 'arrow',
						methods: 'viewMore'
					}
				],
				operationParams: {}, // 操作请求参数
			};
		},
		onShow() {
			let list = []
			this.List.map(option => {
				if (this.type(option)) {
					list.push(option)
				}
			})
			this.List = list
		},
		computed: {
			...mapGetters({
				serviceInfo: 'login/serviceInfo',
				roomInfo: 'chat/roomInfo'
			})
		},
		watch: {
			roomInfo: {
				immediate: true,
				handler(a, b) {
					const typeList = ['Open', 'Pending', 'Close']
					this.ListStatus = typeList[a.status - 1]
				}
			},
		},
		methods: {
			control(option) {
				// 显示Loading态
				uni.showLoading({
					mask: true
				})
				this.operationParams = {
					uid: this.serviceInfo.id,
					uType: this.serviceInfo.uType,
					platform: this.serviceInfo.platform,
					roomId: this.roomInfo.roomId,
					clientId: this.$store.state.clientId,
					event: option,
					avatar: this.serviceInfo.avatar.indexOf('http') === 0 ? this.serviceInfo.avatar : '',
					username: this.serviceInfo.userName,
					title: this.roomInfo.title
				}
				chat.updateSession(this.operationParams).then(res => {
					if (res.data.code === 200) {
						uni.navigateBack({
							delta: 1
						});
					}
				}).catch(error => {

				})
			},
			viewMore() {
				uni.navigateTo({
					url: '/pages/details/details'
				});
			},
			type(option) {
				if (option.name == 'default') {
					return true
				} else if (this.ListStatus == 'Close') {
					return option.name == 'Open' && option.name != this.ListStatus
				} else {
					return option.name != this.ListStatus
				}
			},
		}
	}
</script>

<style lang="scss">
	.actions {
		// padding-top: 88upx;
		// height: calc(100vh - 88upx);
		height: 100vh;
		background: #F4F4F4;
	}

	.body {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		padding: 32upx;
	}

	::v-deep .options .option1 .option2 uni-image:first-child {
		width: 30upx !important;
		height: 30upx !important;
	}
</style>
