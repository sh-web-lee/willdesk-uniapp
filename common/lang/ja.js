//ja.js 日语
export default {
	index: {
		welcome: "ようこそ",
		email: "郵便",
		pwd: "パスワード"
	},
	login: {
		login: "ログイン",
		welcome: "ようこそ",
		email: "郵便",
		pwd: "パスワード",
		invalidEmail: "無効なメール",
		invalidPwd: "無効なパスワード",
		resetPwd: 'パスワードをお忘れですか？',
		selectDomain: "続行するにはストアを選択してください",
		loginerr: {
			400: 'メールまたはパスワードが正しくありません',
			401: 'アカウントがアクティブ化されていません。アクティブ化してください',
			403: '現在の招待状の有効期限が切れています。招待者にご相談ください',
			404: 'メールアカウントが存在しません',
			405: '操作に失敗しました。もう一度お試しください'
		},
		login_err:"メールまたはパスワードが正しくありません"
	},
	chat: {
		inbox: '受信トレイ',
		all: "すべて",
		Open: "開けろ",
		Pending: "未定",
		Close: "閉じます",
		Close_d: "閉まっている",
		Reopen: "再開",
		mention: "私に言及",
		assigned: "私に割り当てられた",
		unassigned: "未割り当て",
		month:{
			Jan:"1月",
			Feb:"2月",
			Mar:"3月",
			Apr:"4月",
			May:"5月",
			Jun:"6月",
			Jul:"7月",
			Aug:"8月",
			Sep:"9月",
			Oct:"10月",
			Nov:"11月",
			Dec:"12月"
		}
	},
	setting: {
		setting: "設定",
		signout: 'サインアウト',
		messageN: 'メッセージつーち通知',
		yac: 'こーざ口座',
		name: '名前',
		save: "保存",
		Upload_successful:"アップロードに成功",
		Save_try_again:"保存に失敗しました。 リトライ",
		Save_success:"変更は正常に保存されました",
		Rate_us:"私たちを評価してください",
		Close:"クロージャー",
		Rate_content:"あなたのフィードバックは私にとって非常に重要です。 ここにコメントを残していただけませんか？"
	},
	ButtonBox: {
		set: "設定",
		get: "読んだ",
		send: "送信するには",
		submit: "さしだ·す",
		confirm: "もちろん",
		cancel: "キャンセル",
	},
	MessageBox: {
		Tips: "ヒントヒント",
		Logout: "やめてもよろしいですか？"
	},
	// 忘记密码页面
	regidter:{
		reset:"パスワードを再設定する",
		Submit:"さしだ·す",
		Back:"ログインページに戻る",
		Invalid:"無効なメール",
		not:"アカウントが存在しません"
	},
	details:{
		Conversation_details:"会話の詳細",
		Brand:"ブランド",
		Local_Time:"現地時間",
		location:"住所",
		Email:"郵便",
		Phone:"電話番号",
		Visitor_Type:"訪問の種類",
		User_Id:"ユーザー Id",
		Last_Seen_Time:"最終訪問時間",
		Shop_Name:"店舗名",
		note:"注釈",
		Add_a_note:"注釈を追加します",
		Shop_URL:"ストアリンク",
		Shopify_plan:"Shopify プラン",
		Willdesk_plan:"Willdesk プラン",
		Branding:"ブランド",
		Review:"評価",
		Note:"注釈",
		add_note:"コメントを追加"
	},
	actions:{
		Actions:"操作する",
		Close_conversation:"セッションを閉じる",
		Pending_conversation:"保留中のセッション",
		Reopen_conversation: "セッションを再開します",
		Conversation_details:"会話の詳細"
	},
	components: {
		Order:"注文書",
		Total_amount:"合計金額",
		Total_number:"合計",
		Failed_to_send:"送信",
		
	}
}
