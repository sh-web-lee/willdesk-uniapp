<template>
	<view class="login">
		<view class="content" :style="{marginTop:top}">
			<view :style="{height:height}"></view>
			<registerTop ref="logo"></registerTop>
			<view class="uni-form">
				<view class="tip" :class="params.register == 1 ? 'green' : 'red'" v-show="text != ''">
					<image :src="params.register == 1 ? '/static/right.svg' : '/static/fail.svg'" mode="aspectFit"
						lazy-load></image>
					<text>{{text}}</text>
				</view>
				<view class="uni-form-item" :adjust-position="true">
					<uni-easyinput :focus="focus.email" trim="all" v-model="msg.email" :placeholder="i18n.email"
						maxlength="300" confirm-type='next' @focus="inputFocus" @blur="inputBlur('email')"
						@confirm="confirm">
					</uni-easyinput>
					<bubble :incorrertShow='error.email' :text='i18n.invalidEmail'></bubble>
				</view>
				<view class="uni-form-item" :adjust-position="true">
					<uni-easyinput type="password" :focus="focus.pwd" trim="all" v-model="msg.password"
						:placeholder="i18n.pwd" maxlength="50" confirm-type='go' @focus="inputFocus"
						@blur="inputBlur('password')" @confirm="preLogin">
					</uni-easyinput>
					<bubble :incorrertShow='error.password' :text='i18n.invalidPwd'></bubble>
				</view>
			</view>
			<view class="uni-btn-v">
				<button type="default" @click="preLogin">{{i18n.login}}</button>
				<!-- <navigator url="/pages/login/register/register" open-type="redirect">{{i18n.resetPwd}}</navigator> -->
			</view>
		</view>
		<navigator :url="'/pages/login/register/register?email='+msg.email" open-type="redirect">{{i18n.resetPwd}}
		</navigator>
	</view>
</template>

<script>
	import {
		mapActions
	} from 'vuex'
	import login from '@/api/login.js'
	import utilsIndex from '@/utils/index.js'
	import registerTop from './registerTop/register_top.vue'
	import bubble from './bubble/bubble.vue'
	import {
		throttle
	} from '@/utils/publicMethods.js'
	let throttleFunc = null
	export default {
		data() {
			return {
				focus: {
					email: false,
					pwd: false
				},
				params: {
					register: 0
				},
				text: '',
				clientid: '',
				msg: {
					email: 'willdesktest-system@gmail.com',
					password: '123456789a',
				},
				error: {
					email: false,
					password: false
				},
				domainOptions: [],
				index: 0,
				top: '82upx',
				flex: '1',
				height: '0upx',
			}
		},
		components: {
			registerTop,
			bubble
		},
		computed: {
			i18n() {
				return this.$t('login')
			},
		},
		onLoad(params) {
			// 如果缓存中有账号信息
			// if (uni.getStorageSync('SET_SERVICEINFO').Domain) {
			// 	// 自动登录
			// 	// this.submit(uni.getStorageSync('SET_SERVICEINFO'))
			// 	// 回显邮箱
			// 	this.msg.email = uni.getStorageSync('SET_SERVICEINFO').email
			// 	this.msg.password = ''
			// }
			this.clientid = plus.push.getClientInfo().clientid
			this.$store.state.deviceInfo
			if (params.email != undefined) {
				this.msg = params
			}

			this.params = params
		},
		created() {
			throttleFunc = throttle(500)
		},
		watch: {
			params() {
				if (this.params.register == 1) {
					this.text = 'Password reset successful'
				}
			}
		},
		methods: {
			...mapActions('login', ['login']),
			inputFocus(type) {
				this.top = 'var(--status-bar-height)'
				this.height = '50upx'
				this.$refs.logo.top_img = '0upx'
				if (this.params.register != 1) {
					this.params.register = 0
					this.text = ''
				}
				this.error.email = this.error.password = false
			},
			inputBlur(type) {
				this.top = '82upx'
				this.height = '0upx'
				this.$refs.logo.top_img = '92upx'
				this.error.email = this.error.password = false
				if (type == 'email') {
					this.error.email = !utilsIndex.checkEmail(this.msg.email)
					return this.error.email
				} else if (type == 'password') {
					this.error.password = !utilsIndex.checkPwd(this.msg.password)
					return this.error.password
				}
			},
			confirm() {
				uni.hideKeyboard(); //隐藏软键盘
				this.focus.email = false;
				this.$nextTick(function() {
					this.focus.pwd = true;
				});
			},
			// 预登录
			preLogin() {
				throttleFunc(() => {
					if (this.inputBlur('email') || this.inputBlur('password')) {
						return
					}

					const params = {
						Email: this.msg.email,
						Password: this.msg.password
					}
					// 查询这个邮箱下是否有多个店铺
					login.authEmailDomain(params).then(res => {
						if (res.data.Code !== 200) return this.oninvalid(404)
						this.domainOptions = res.data.Domains.split(',')
						if (this.domainOptions.length > 1) {
							// 多个店铺，则根据用户选择进行登录
							let that = this
							uni.showActionSheet({
								title: this.i18n.selectDomain,
								itemList: this.domainOptions,
								success: function(item) {
									that.submit({}, item.tapIndex)
								}
							});
						} else {
							// 一个店铺，则直接登录
							// if (this.domainOptions.length != 0) {
							// }
							this.submit()
						}
					})
				})
			},
			// 登录
			submit(param = {}, tapIndex = 0) {
				// 显示Loading态
				uni.showLoading({
					title: 'Logging...'
				});
				let params = {}

				if (Object.keys(param).length === 0) {
					params = {
						Email: this.msg.email,
						Password: this.msg.password,
						Domain: this.domainOptions[tapIndex]
					}
				} else {
					params = {
						Email: param.email,
						Password: param.pwd,
						Domain: param.Domain
					}
				}

				this.login(params).then(res => {
					if (res.data.Code === 200 && res.data.Message === 'OK') {
						let params = {
							customerServiceId: res.data.CustomerServiceId,
							model: this.$store.state.deviceInfo.model,
							clientId: this.clientid
						}
						uni.switchTab({
							url: '/pages/chat/chat'
						})
					} else {
						// 400:账号或密码错误
						// 401:账号未激活
						// 403:店铺已删除邀请
						// 404:账号不存在
						// 其他为操作失败
						if (res.data.Code == 400) {
							this.oninvalid(res.data.Code)
						} else {
							this.$msg.msg(this.$t('login').loginerr[res.data.Code]);
						}
					}
				}).catch(e => {
					console.log(e);
					this.$msg.msg(this.$t('login').loginerr['405']);
				})
			},
			// 账号或密码错误
			oninvalid(code) {
				this.text = this.$t('login').loginerr[code]
				this.params.register = 2
			}
		},
		beforeDestroy() {
			// 隐藏键盘
			uni.hideKeyboard()
		}
	}
</script>

<style scoped lang="scss">
	.login {
		width: 100%;
		display: flex;
		height: 100vh;
		align-items: center;
		justify-content: space-between;
		flex-direction: column;
	}

	.content {
		transition: all 0.3s;
		width: 91.5%;
		// margin-top: 82upx;
	}

	.uni-form {
		margin-top: 174upx;
		position: relative;

		.uni-form-item {
			margin-top: 32upx;

			&:first-child {
				margin-top: 0;
			}
		}

		.tip {
			position: absolute;
			top: -78upx;
			width: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			height: 64upx;
			border-radius: 12upx;

			image {
				width: 32upx;
				height: 32upx;
				margin-right: 12upx;
			}

			text {
				font-size: $font-size-lg - 8upx !important;
				font-family: SF-Pro;
				font-weight: 400;
			}
		}
	}

	.red {
		background: rgba(255, 34, 34, 0.16) !important;

		text {
			color: #FF2222 !important;
		}
	}

	.green {
		background: rgba(64, 190, 0, 0.16) !important;

		text {
			color: #40BE00 !important;
		}
	}

	.uni-btn-v {
		margin-top: 96upx;
		text-align: center;
		margin-bottom: 20upx;
	}

	navigator {
		margin-bottom: 102upx;
		// position: fixed;
		// bottom: 102upx;
		// margin: 0 auto;
		color: $color-primary;
	}
</style>
