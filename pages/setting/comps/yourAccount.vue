<template>
	<view>
		<view-navbar back>
			<template slot="text">
				<text>{{i18nS.yac}}</text>
			</template>
			<template slot="right">
				<view class="uni-btn-v" type="default" @click="save">{{i18nS.save}}</view>
			</template>
		</view-navbar>
		<view class="uni-form" v-if="!loading" :style="{marginTop: `${$store.state.deviceInfo.statusBarHeight}px`}">
			<uploadAvatar :portrait='msg.avatar' :name="msg.userName" @upLoadImg='upLoadImg'></uploadAvatar>
			<view class="uni-form-item">
				<uni-easyinput v-model="msg.userName" :placeholder="i18nS.name" confirm-type="done" maxlength="100"
					@focus="inputFocus" @blur="inputBlur" @confirm="save">
				</uni-easyinput>
			</view>
		</view>
		<loading v-else status="loading"></loading>
	</view>
</template>

<script>
	import {
		mapGetters,
		mapActions
	} from 'vuex'
	import setting from '@/api/setting.js'
	import bubble from '@/pages/login/bubble/bubble.vue'
	import uploadAvatar from '@/components/uploadAvatar/uploadAvatar.vue'
	import {
		throttle
	} from '@/utils/publicMethods.js'
	let throttleFunc = null

	export default {
		data() {
			return {
				loading: true,
				msg: {},
				error: {
					userName: false
				},
				DataChange: false,
				index: "https://img.willdesk.com/"
			}
		},
		components: {
			bubble,
			uploadAvatar,
		},
		onLoad: function() { //query为object类型，会序列化上个页面传递的参数
			this.msg = JSON.parse(JSON.stringify(this.serviceInfo))
		},
		created() {
			throttleFunc = throttle(500)
		},
		computed: {
			...mapGetters({
				serviceInfo: 'login/serviceInfo',
			}),
			i18nS() {
				return this.$t('setting')
			},
			i18nL() {
				return this.$t('login')
			},
		},
		watch: {
			msg() {
				this.loading = false
			},
		},
		methods: {
			...mapActions(['uploadImg']),
			upLoadImg(params) {
				this.uploadImg(params).then(([res, key]) => {
					this.msg.avatar = key;
					if (res.statusCode == 200) {
						this.modifyAccountInfo().then(res => {
							if (res.data.Code == 200) {
								// this.$store.commit('change_setting', 1)
								this.$msg.msg(this.$t('setting').Upload_successful)
							}
						})
					}
				})
			},
			inputFocus() {
				this.error.userName = false
			},
			inputBlur() {
				this.error.userName = this.msg.userName == ''
				return this.error.userName
			},
			save() {
				throttleFunc(() => {
					// 显示Loading
					uni.showLoading({
						title: 'Saving...'
					})
					if (this.inputBlur()) {
						// 隐藏Loading态
						uni.hideLoading()
						this.$msg.msg('Name cannot empty')
						return
					}

					this.modifyAccountInfo().then(res => {
						if (res.data.Code == 200) {
							// this.$store.commit('change_setting', 1)
							this.$msg.msg(this.$t('setting').Save_success)
							setTimeout(function() {
								uni.navigateBack({
									delta: 1
								});
							}, 1000);
						}
					})
				})
			},
			modifyAccountInfo() {
				var Profile = ''
				if (this.msg.avatar != '') {
					Profile = this.msg.avatar.indexOf(this.index) == -1 ? this.msg.avatar : this.msg.avatar.substr(this
						.index.length, this.msg.avatar.length)
				}

				const params = {
					Name: this.msg.userName,
					Id: this.msg.id,
					Profile: Profile
				}

				return new Promise((resolve, reject) => {
					setting.modifyAccountInfo(params).then(res => {
						if (res.data.Code !== 200) {
							reject(res)
							this.$msg.msg(this.$t('setting').Save_try_again);
							return
						} else {
							if (Profile != '') {
								Profile = Profile.indexOf(this.index) == -1 ? this.index + Profile : Profile
							}
							this.serviceInfo.userName = this.msg.userName
							this.serviceInfo.avatar = Profile
							// 成功时， 将vuex的值给为1
							this.serviceInfo.change_setting = 1
							// this.$store.commit('login/SET_SERVICEINFO', list)
							resolve(res)
						}
					}).catch(err => {
						reject(res)
					})
				})
			}
		},
		beforeDestroy() {
			// 隐藏键盘
			uni.hideKeyboard()

			if (this.msg != this.serviceInfo) {
				this.msg = this.serviceInfo
			}
		}
	}
</script>

<style lang="scss" scoped>
	.uni-form {
		padding: 32upx;

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		.uni-form-item {
			width: 100%;
			margin-top: 32upx;

			&:first-child {
				margin-top: 0;
			}
		}
	}

	.uni-btn-v {
		padding: 26upx 32upx;

		color: $color-primary;
		font-size: $font-size-lg - 2upx !important;
		font-weight: bold;
	}

	::v-deep .portrait {
		.small {
			background: $color-primary;

			image {
				width: 20upx !important;
				height: 15upx !important;
			}
		}
	}

	::v-deep .uni-easyinput__content-input {
		padding: 0 16upx !important;
	}

	::v-deep .is-input-border {
		border: none !important;
		border-bottom: $uni-border !important;
		border-radius: 0upx !important;
	}
</style>
