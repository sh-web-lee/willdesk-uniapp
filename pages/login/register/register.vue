<template>
	<view class="register">
		<view class="content" :style="{marginTop:top}">
			<registerTop></registerTop>
			<view class="uni-form">
				<view class="uni-form-item">
					<uni-easyinput focus trim="all" @blur="inputBlur" @focus="inputFocus" v-model="msg.email"
						placeholder="Email" @confirm="submit"></uni-easyinput>
					<bubble :incorrertShow='error.email' :text='text'></bubble>
				</view>
				<view class="uni-btn-v">
					<button type="default" @click="submit">{{i18n.Submit}}</button>
					<!-- <navigator url="/pages/login/login" open-type="redirect">{{i18n.Back}}</navigator> -->
				</view>
			</view>
		</view>
		<navigator :url="'/pages/login/login?email='+msg.email" open-type="redirect">{{i18n.Back}}</navigator>
	</view>
</template>

<script>
	import registerTop from '../registerTop/register_top'
	import bubble from '../bubble/bubble'
	import utilsIndex from '@/utils/index'
	import login from '@/api/login'
	export default {
		data() {
			return {
				msg: {
					email: '',
					password: '',
				},
				error: {
					email: false
				},
				text: '',
				top: '82upx'
			}
		},
		components: {
			registerTop,
			bubble
		},
		onLoad(params) {
			this.msg = params
		},
		computed: {
			i18n() {
				return this.$t('regidter')
			},
		},
		methods: {
			//点击submit按钮时，先验证邮箱的规则
			submit() {
				//接口参数
				const params = {
					Email: this.msg.email,
					Domain: 'willdesk-cjt-test-007.myshopify.com'
				}
				//email格式正确，点击后返回login页
				if (utilsIndex.checkEmail(this.msg.email)) {
					login.csResetPasswprd(params).then(res => {
						if (res.data.Code === 200) {
							uni.redirectTo({
								url: '/pages/login/login?register=1',
							});
						} else if (res.data.Code === 400) {
							this.isLoading = false
							this.text = this.i18n.not
							this.error.email = true
						}
					})

				}

			},
			inputBlur() {
				this.top = '82upx'
				this.text = this.i18n.Invalid
				this.error.email = !utilsIndex.checkEmail(this.msg.email)
				return this.msg.email
			},
			inputFocus() {
				this.top = 'var(--status-bar-height)'
				this.error.email = false
			}
		}
	}
</script>

<style scoped lang="scss">
	.register {
		// width: 100%;
		// display: flex;
		// align-items: center;
		// justify-content: center;
		width: 100%;
		display: flex;
		height: 100vh;
		align-items: center;
		justify-content: space-between;
		flex-direction: column;
	}

	.content {
		transition: all 0.2s;
		width: 91.5%;
		// margin-top: 82upx;
	}

	navigator {
		// position: absolute;
		margin-bottom: 102upx;
		// margin: 0 auto;
		color: $color-primary;
	}

	.uni-form {
		margin-top: 174upx;

		.uni-form-item {
			margin-top: 96upx;
			text-align: center;

			&:first-child {
				margin-top: 0;
			}
		}

		.uni-btn-v {
			margin-top: 96upx;
			text-align: center;


		}
	}
</style>
