import { getRoomChatHistoryCount } from '@/api/chat.js'
import $store from '@/store/index.js'
/*
 * @description 获取文件的缓存路径，如果文件未缓存，则直接返回网络路径，并下载缓存
 * @method getImageCache
 * @param {String} filePath 完整的图片下载路径，如果没有从缓存中获取到，则用这个路径去下载
 * @param {String} fileMd5 文件md5，必须唯一
 * @return {Object} promise对象
*/
const getImageCache = function(filePath, fileMd5) {
	// 图片缓存key值
	let storageKey = 'IMAGE_CACHE_INFO_' + fileMd5
	// 首先获取本地存储的数据，查询是否有对应文件路径，如果有缓存内容，直接返回
	const cacheFileInfo = uni.getStorageSync(storageKey)
	if (cacheFileInfo) {
		console.log("已缓存为：" + cacheFileInfo)
		return cacheFileInfo
	} else {
		console.log("未缓存,进行下载保存")
		// 如果没有，执行下载，并存储起来后
		uni.downloadFile({
		    url: filePath,
		    success: (res) => {
		        if (res.statusCode === 200) {
		            console.log('下载成功');
					// 再进行本地保存
					uni.saveFile({
					      tempFilePath: res.tempFilePath,
					      success: function (res2) {
							  console.log(res2.savedFilePath)
							  uni.setStorageSync(storageKey, res2.savedFilePath)
							  return res2.savedFilePath
					      },
						  fail: function (res2) {
						  	return filePath
						  }
					    })
		        } else {
					console.log('下载临时文件失败')
					return filePath
				}
		    },
			fail: (res) => {
				console.log(res)
				return filePath
			}
		})
	}
}
// 排序算法
function sortByKey(array, key) {
	return array.sort(function(a, b) {
		var x = a[key]
		var y = b[key]
		return ((x < y) ? -1 : ((x > y) ? 1 : 0))
	})
}
/**
 * 判断是否需要直接读取历史数据的信息
 * @param {Array} list 请求服务器获取的历史聊天记录 
 * @param {String} keys 唯一的聊天记录标识 现用roomId作为唯一标识
 */
export function checkChatHistory (list, keys, pageParams) {
	return new Promise(async (resolve, reject) => {
		const historyData = uni.getStorageSync('CHATHISTORYDATA') // 拿缓存的数据
		console.log(historyData);
		let chatMap = new Map() // 新建一个map对象，用来转义存储的历史消息
		if (historyData) {
			for (let key in historyData) {
				chatMap.set(key, historyData[keys])
			}
		}
		// 是否有相应的历史记录存在聊天列表中
		if (chatMap.has(keys)) { // 查找是否有已存储的历史消息记录
			// 拿到历史记录的最新时间点 用于与服务器获取的记录比对时间区间是否在最新记录中
			const requestLastMsgTime = list[0].sendTime // 获取最新记录的最后一条消息时间, 时间为倒序
			const historyChat = chatMap.get(keys) // 拿到聊天历史数据
			const historyNewstTime = historyChat[historyChat.length - 1].sendTime // 聊天的最新数据时间
			const findRecordIndex = list.findIndex(item => item.sendTime <= historyNewstTime) // 是否存在服务端返回记录时间在本地存储里面
			// 只有两种情况，一个是本地不是最新，一个是刚好是最新(最新的话就直接取历史数据渲染，历史数据会有图片大小，可以直接使用)
			if (findRecordIndex !== -1) { // 如果存在 取最新的合并到本地 返回合并后的本地pageSize条给到界面
				const findList = list.filter((item, index) => index > findRecordIndex) // 取最新的 + 本地的
				// 信息数据记录到本地数据然后返回20条 .slice(historyChat.length - (20 - findList.length))
				const recordList = [...historyChat, ...findList]
				chatMap.set(keys, recordList) // 本地记录重新设置 ++mark++
				historyChat = chatMap.get(keys)
				const renderList = historyChat.slice(historyChat.length - pageParams.pageSize)
				console.log('取历史记录', historyChat.slice(historyChat.length - pageParams.pageSize));
				resolve(recordList)
			} else { // 如果服务端的最后一条记录时间大于历史的最新时间(不在最新记录里面) 这个时候仍取服务端的记录作为显示记录
				console.log('取服务端记录');
				// 把数据保存到本地并添加标记 表示数据
				// 给数据的最后添加个标记，表示两段数据之间不是完整的数据记录，下次通过这里拿数据的时候需要请求服务器去取数据
				list[0][haveMoreServersData] = true
				// 直接把最新记录给到界面
				resolve(list)
			}
			// if (requestLastMsgTime > historyNewstTime) { 
				
			// } else { 
				
			// }
		}
		// 不存在历史聊天记录
		else {
			// 直接保存记录并标记数据
			resolve(list)
		}
	})
}

export function checkHistory (keys, list) {
	return new Promise(async (resolve, reject) => {
		// 首先拿历史记录的数据
		const history = uni.getStorageSync('CHATHISTORYDATA')
		const serviceInfo = $store.state.login.setServiceInfo
		const roomId = $store.state.chat.roomInfo.roomId
		// 是否有选中房间的数据
		const findRoomInfo = history.filter(item => item.roomId === keys)
		let roomRecord = {}
		if (findRoomInfo[0]) {
			roomRecord = findRoomInfo[0]
			// 获取当前消息与上条数据之间有没有丢失数据
			
			const recordLastTime_minTime = roomRecord.list[roomRecord.list.length - 1].sendTime
			const listLastTime_maxTime = list[0].sendTime
			if (recordLastTime_minTime <= listLastTime_maxTime) {
				const params = {
					uid: serviceInfo.id,
					uType: serviceInfo.uType,
					platform: serviceInfo.platform,
					roomId: roomId,
					minTime: recordLastTime_minTime,
					maxTime: listLastTime_maxTime
				}
				const res = await chat.getRoomChatHistoryCount(params)
				const total = res.data.code === 200 && res.data.total ? res.data.total : 0
				// 如果中间有相应缺失数据，就把这些数据给请求回来，然后合并到历史记录中
				if (total) {
					console.log(`缺失了${total}条, 现在来去获取中间缺失的部分`);
					const params_list = {
						firstSendUid: roomInfo.firstSendUid,
						firstSendUuidType: roomInfo.firstSendUidType,
						page: 1,
						pageSize: total,
						platform: serviceInfo.platform,
						roomId: roomId,
						sendTime: listLastTime_maxTime,
						uType: serviceInfo.uType,
						uid: serviceInfo.id
					}
					const res_list = await chat.getRoomChatHistory(params_list)
					if (res_list.data.code === 200) {
						console.log('拿到缺失的部分, 合并历史数据');
						// 缺失的数据和历史数据组合到一起
						roomRecord.record = [...roomRecord.record, ...res_list.data.list.reverse()]
					}
				} else {
					// 没有缺失数据，这段数据直接合并到历史数据中
					console.log('没有缺失数据，直接合并');
					roomRecord.record = [...roomRecord.record, ...list]
				}
			} else {}
			
		} else {
			// 没有房间数据，直接在本地记录中进行添加
			roomRecord = {
				roomId: keys,
				record: []
			}
			roomRecord.record = [...roomRecord.record, ...list]
		}
	})
}

// export function checkChatHistory(roomId, page = 1, pageSize = 20, loaded = false) {
// 	const loadSuccess = true // 是否正常读取服务端历史数据
// 	const history = uni.getStorageSync('CHATHISTORYDATA')
// 	const serviceInfo = $store.state.login.setServiceInfo
// 	return new Project(async (resolve, reject) => {
// 		// 进来界面直接服务端拉取全部的历史记录直接
// 		if (!loaded) {
// 			// 是否有选中房间的数据
// 			const findRoomInfo = history.filter(item => item.roomId === roomId)
// 			let roomRecord = {}
// 			// 有选中房间的数据 先获取所有的历史数据
// 			if (findRoomInfo[0]) { 
// 				const params = {
// 					uid: serviceInfo.id,
// 					uType: serviceInfo.uType,
// 					platform: serviceInfo.platform,
// 					roomId: roomId,
// 					minTime: '0',
// 					maxTime: '0'
// 				}
// 				const res = await chat.getRoomChatHistoryCount(params)
// 				const total = res.data.code === 200 && res.data.total ? res.data.total : 0
// 				// 如果中间有相应缺失数据，就把这些数据给请求回来，然后合并到历史记录中
// 				if (total) {
// 					console.log(`总共${total}条`);
// 					const params_list = {
// 						firstSendUid: roomInfo.firstSendUid,
// 						firstSendUuidType: roomInfo.firstSendUidType,
// 						page: 1,
// 						pageSize: total,
// 						platform: serviceInfo.platform,
// 						roomId: roomId,
// 						sendTime: listLastTime_maxTime,
// 						uType: serviceInfo.uType,
// 						uid: serviceInfo.id
// 					}
// 					const res_list = await chat.getRoomChatHistory(params_list)
// 					if (res_list.data.code === 200) {
// 						console.log('拿到缺失的部分, 合并历史数据');
// 						// 缺失的数据和历史数据组合到一起
// 						roomRecord.record = filterHistorySameData('sendTime', [...roomRecord.record, ...res_list.data.list.reverse()])
// 						sortByKey(roomRecord.record, 'sendTime')
// 					}
// 				} else {
// 					// 没有缺失数据，这段数据直接合并到历史数据中
// 					// 直接显示历史记录的前pageSize条
// 					roomRecord.record = [...roomRecord.record, ...list]
// 				}
// 			} else {
				
// 			}
// 		}
// 	})
// }
function filterHistorySameData(filterKey, list) {
	var obj = {}
	list = list.reduce((newArr, next) => {
		// eslint-disable-next-line
		obj[next[filterKey]] ? '' : (obj[next[filterKey]] = true && newArr.push(next))
		return newArr
	}, [])
	return list
}