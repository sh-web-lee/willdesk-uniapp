<template>
	<view>
		<view class="note_input">
			<uni-easyinput trim="all" :clearable="false" :placeholder="i18n.add_note" v-model="msg" maxlength="300"
				confirm-type='done' @confirm="confirm">
			</uni-easyinput>
			<view class="NoteBtn" @click="addNote">
				<image src="/static/add.svg"></image>
			</view>
		</view>
		<view class="note_list" v-for="(item,i) of note" :key="i">
			<textarea v-model.trim="item.noteMsg" @blur="bindTextAreaBlur" auto-height maxlength="300"
				confirm-type='done' @confirm="confirm" />
			<view class="NoteBtn" @click="drop(item)">
				<image src="/static/x.svg"></image>
			</view>
		</view>
		<view class="bottom" v-show="noteList.length > 2" @click="_click">
			<text>{{few ? 'See less' : 'See more'}}</text>
		</view>
	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex'
	import faq from '@/api/faq.js'
	export default {
		data() {
			return {
				msg: '',
				few: false,
				note: [],
				deleteShow: false,
				oldInput: '',
				input: '',
				deleteId: 0,
				nowIndex: -1,
				noteList: []
			}
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
			sessionInfo: {
				type: Object,
				default: () => {
					return {}
				}
			},
		},
		mounted() {
			this.getNotesList()
		},
		methods: {
			_click() {
				if (this.few) {
					// 折叠
					this.note = this.noteList.slice(0, 2) // 只展示前两条note
				} else {
					// 查看更多
					this.note = this.noteList
				}
				this.few = !this.few
			},
			async getNotesList(params = {
				uid: this.roomInfo.firstSendUid,
				uType: this.roomInfo.firstSendUidType,
				customerServiceName: this.serviceInfo.userName,
				siteId: this.roomInfo.siteId,
				page: 0,
				pageSize: 10
			}) {
				const {
					data: res
				} = await faq.newGetNotesListApi(params)
				if (res.code !== 200) return
				this.noteList = res.data.list
				this.note = res.data.list.slice(0, 2)
				this.few = false
				this.noteList.map(note => {
					note.hoverText = 'Edited by ' + note.customerServiceName + ' at ' + moment(parseInt(note
						.updateAt) * 1000).format('YYYY/MM/DD, HH:mm').substring(moment(parseInt(note
						.updateAt) * 1000).format('YYYY/MM/DD, HH:mm').indexOf(',') + 1)
					note.delBtnShow = false
				})
			},
			bindTextAreaBlur: function(e) {
				console.log(e.detail.value)
			},
			addNote() {

			},
			drop(item) {
				this.nowIndex = -1
				this.deleteId = item.id
				this.deleteShow = true
			},
			confirm() {

			}
		}
	}
</script>

<style lang="scss">
	.note_input,
	.note_list {
		display: flex;
		align-items: center;
		justify-content: space-between;

		// overflow: hidden;

		.NoteBtn {
			display: flex;
			align-items: center;
			justify-content: center;

			height: 100%;
			padding: 0 32upx;
		}
	}

	.note_input {
		height: 84upx;
		border: 2upx solid rgba(0, 0, 0, 0.2);
		border-radius: 12upx;
		margin-bottom: 32upx;

		::v-deep uni-input {
			padding-right: 0 !important;
		}

		::v-deep .is-input-border {
			border: none !important;
		}

		.NoteBtn {
			image {
				width: 30upx;
				height: 30upx;
			}
		}
	}

	.note_list {
		min-height: 60upx;
		background: #FFECC1;
		border-radius: 30upx;
		margin-bottom: 16upx;

		::v-deep uni-textarea {
			text-align: left;

			padding-left: 32upx;
			width: 100%;
			min-height: $font-size-lg !important;

			font-size: $font-size-lg - 8upx !important;
			font-weight: 400;
			line-height: $font-size-lg !important;
		}

		::v-deep .is-input-border {
			border-radius: 30upx !important;
		}

		.NoteBtn {
			image {
				width: 24upx;
				height: 24upx;
			}
		}
	}

	.bottom {
		height: $font-size-lg - 4upx;
		line-height: $font-size-lg - 4upx;

		&:hover {
			cursor: pointer;
		}

		text {
			color: $color-primary;
			font-size: $font-size-lg - 4upx !important;
			font-weight: 700;
		}
	}

	::v-deep .uni-easyinput,
	::v-deep .uni-easyinput__content,
	::v-deep uni-input {
		min-height: 100% !important;
		height: 100% !important;
	}
</style>
