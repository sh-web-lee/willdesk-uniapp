<script>
	import push from '@/network/push.js'
	import {
		mapGetters
	} from 'vuex'
	export default {
		data() {
			return {
				switch_size: ''
			}
		},
		mounted() {
			// this.start()
		},
		onLaunch: function() {
			// console.log('App Launch')
			// let clientid = plus.push.getClientInfo().clientid
			// console.log('cid',clientid)
			// #ifdef APP-PLUS
			let timer = false;
			plus.push.addEventListener("click",(msg)=>{
				clearTimeout(timer);
				timer = setTimeout(()=>{
					console.log('click:' , JSON.stringify(msg))
					// if(msg.payload){
					// 	uni.navigateTo({
					// 		url:msg.payload
					// 	})
					// }
				},1500)
			},false)
			plus.push.addEventListener("receive",(msg)=>{
				if(msg.type=='receive'){
					// var options = {cover:false,title:msg.title};
					// plus.push.createMessage(msg.content, msg.payload, options ); 
					console.log('recevice:' , JSON.stringify(msg))
				 }			
			},false)
			// #endif
		},
		onShow: function() {
			// console.log('App Show')
			// this.switch_size = this.$store.state.deviceInfo.windowWidth > 550 ? 'scale(1);' : 'scale(0.5);'
			// this.switch_size = 'scale(0.5);'
		},
		onHide: function() {}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	@import "@/assets/css/resetPublic.scss";
	@import "@/assets/css/resetUni.scss";

	page,
	html {
		$font-size-lg: $font-size-lg - 1upx;
		font-size: $font-size-lg;
	}

	@media screen and (min-width:1125px) and (max-width:1559px) {

		page,
		html {
			$font-size-lg: $font-size-lg - 3upx;
		}
	}

	@media screen and (min-width:900px) and (max-width:1124px) {

		page,
		html {
			$font-size-lg: $font-size-lg - 6upx;
		}
	}

	@media screen and (max-width:900px) {

		page,
		html {
			$font-size-lg: $font-size-lg - 7upx;
		}
	}

	:root {
		--switch_size: scale(0.6);
		--emoji_position: 0 0px;
	}

	// switch
	uni-switch {
		transform: var(--switch_size);
	}

	@for $i from 1 through 199 {
		.emoji-#{$i} {
			background-position: center #{($i - 1) * -22}px;
		}
	}

	// APP端隐滚动条
	/* #ifdef APP-PLUS */
	/deep/ .scroll-view ::-webkit-scrollbar {
		display: none !important;
		width: 0 !important;
		height: 0 !important;
		-webkit-appearance: none;
		background: transparent;
		color: transparent;
	}

	/* #endif */
	// 顺便网页端也隐藏
	/* #ifdef H5 */
	/deep/ uni-scroll-view .uni-scroll-view::-webkit-scrollbar {
		/* 隐藏滚动条，但依旧具备可以滚动的功能 */
		display: none !important;
		width: 0 !important;
		height: 0 !important;
		-webkit-appearance: none;
		background: transparent;
		color: transparent;
	}

	/* #endif */
	.emoji-img {
		background: url("~@/assets/emojiLib/emojiLibs.png") 0 0 no-repeat;
		background-size: 22px !important;
	}

	image {
		will-change: transform !important;
	}
</style>
