导入

`
	import dropList from '@/components/drop-menu/index.vue'
`
引入插件

`
components:{
			dropList
		},
`

导入图片至/static/img下 PS：根据自行目录修改位置

例子：

`
<drop-menu :menus="menus" selected="1" @click="choise"></drop-menu>
`


| 参数   |      类型      |  说明 |
|----------|:-------------:|------:|
| menus|  Array | [{icon:'',text:'',value:''}] |
| selected |    String   |   选中项的值 |
| click | function |    点击项事件 返回 Object对象{icon:'',text:'',value:''} |

其他需求可自行更改