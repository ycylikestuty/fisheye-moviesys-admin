<template>
	<div class="main-class">
		<el-row :gutter="20">
			<!--标签数据-->
			<el-col :span="24" :xs="24">
				<el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
					<el-form-item label="标签名" prop="name">
						<el-input v-model="queryParams.name" placeholder="请输入标签" clearable size="small"
							style="width: 140px" @keyup.enter.native="handleQuery" />
					</el-form-item>
					<el-form-item label="标签类型" prop="kind">
						<el-select v-model="queryParams.kind" placeholder="类型" clearable @change="$forceUpdate()"
							size="small" style="width: 100px">
							<el-option :key="3" label="风格" :value="3" />
							<el-option :key="1" label="年份" :value="1" />
							<el-option :key="2" label="地区" :value="2" />
						</el-select>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
						<el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
					</el-form-item>
				</el-form>
				<!--按钮-->
				<el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple"
					@click="handleDelete" v-permission="['label:delete']">删除</el-button>
				<!--表格-->
				<el-table v-loading="loading" :data="labelList" @selection-change="handleSelectionChange">
					<el-table-column type="selection" width="50" align="center" />
					<el-table-column label="标签名" align="center" key="name" prop="name" />
					<el-table-column label="标签类型" align="center" key="kind" prop="kind">
						<template slot-scope="scope">
							<span v-if="scope.row.kind == 1">年份</span>
							<span v-else-if="scope.row.kind == 2">地区</span>
							<span v-else-if="scope.row.kind == 3">风格</span>
						</template>
					</el-table-column>
					<el-table-column label="操作" align="center" width="250" class-name="small-padding fixed-width">
						<template slot-scope="scope">
							<el-button size="mini" type="text" icon="el-icon-pie-chart"
								@click="showLabelCharts(JSON.stringify(scope.row))">查看
							</el-button>
							<el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
								v-permission="['label:delete']">删除</el-button>
						</template>
					</el-table-column>
				</el-table>
			</el-col>
			<Pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum"
				:limit.sync="queryParams.pageSize" @pagination="getLabelList" />
		</el-row>
		<!-- 显示标签图形化对话框-->
		<el-dialog :title="title" :visible.sync="open" width="550px" append-to-body>
			<el-form ref="form" :model="form" :rules="rules" label-width="80px">
				<el-row>
					<div id="myChart" style="width:500px;height:400px;padding-top:40px"></div>
				</el-row>
			</el-form>
		</el-dialog>
	</div>
</template>

<script>
	import echarts from 'echarts'

	export default {
		name: "List",
		data() {
			return {
				// 表单参数
				form: {},
				// 查询参数
				queryParams: {
					pageNum: 1,
					pageSize: 5,
					name: undefined,
					kind: undefined
				},
				// 分布数组
				countList: null,
				showSearch: true,
				// 非多个禁用
				multiple: true,
				// 总条数
				total: 0,
				// 用户表格数据
				labelList: null,
				//加载动画
				loading: false,
				// roleForm: {
				//     roleIds: undefined
				// },
				// roleTreeData: [],
				// 选中数组
				ids: [],
				title: undefined,
				open: false,
				// 表单校验
				rules: {
					name: [{
							required: true,
							message: "标签名不能为空",
							trigger: "blur"
						}
						// { min:1, message: '用户名必须为12位', trigger: 'blur' }
					],
					kind: [{
						required: true,
						message: "标签类型不能为空",
						trigger: "blur"
					}]
				}
			}
		},
		methods: {
			getLabelList() {
				this.loading = true
				this.$axios.post("/label/list", this.queryParams).then(res => {
					this.labelList = res.data.result.rows
					this.total = res.data.result.total
					this.loading = false
				})
			},
			initEcharts() {
				// 基于准备好的dom，初始化echarts实例
				let myChart = echarts.init(document.getElementById('myChart'));
				// 绘制图表
				const option = {
					tooltip: {
						tigger: 'item',
						formatter: '标签：{b}<br />占比: {c}'
					},
					series: [{
						type: 'pie',
						radius: '55%', // 饼图的半径，外半径为可视区尺寸（容器高宽中较小一项）的 55% 长度。
						// data: [ // 数据数组，name 为数据项名称，value 为数据项值
						// 	{
						// 		value: 5,
						// 		name: '视频广告'
						// 	},
						// 	{
						// 		value: 4,
						// 		name: '联盟广告'
						// 	},
						// 	{
						// 		value: 10,
						// 		name: '邮件营销'
						// 	}
						// ]
						data: this.countList
					}]
				};
				myChart.setOption(option)
			},
			/** 搜索按钮操作 */
			handleQuery() {
				this.queryParams.pageNum = 1;
				this.getLabelList()
			},
			/** 重置按钮操作 */
			resetQuery() {
				this.queryParams = {
					pageNum: 1,
					pageSize: 5,
					name: undefined,
					kind: undefined
				}
				this.resetForm("queryForm");
				this.handleQuery();
			},
			resetForm(formName) {
				if (this.$refs[formName]) {
					this.$refs[formName].resetFields();
				}
			},
			// 表单重置
			reset() {
				this.form = {
					name: undefined,
					kind: undefined
				}
				this.resetForm("form")
			},
			// 取消按钮
			cancel() {
				this.open = false
				this.reset()
			},
			// submitForm(formName) {
			// 	this.$refs[formName].validate((valid) => {
			// 		if (valid) {
			// 			if (this.title === "添加标签") {
			// 				var longD = Number(this.form.duration)
			// 				// this.form.duration = longD
			// 				// this.form.img =
			// 				// 	"https://img2.doubanio.com/view/photo/s_ratio_poster/public/p2545472803.webp"
			// 				this.$axios.post("/label/add", this.form).then(res => {
			// 					if (res.data.code === 200) {
			// 						this.modal.notifySuccess(res.data.result)
			// 					}
			// 					this.getLabelList()
			// 				})
			// 			} else if (this.title === "修改标签") {
			// 				//将String类型转化为Number类型，因为js没有Long类型
			// 				var longD = Number(this.form.duration)
			// 				// console.log("type:" + this.form.type)
			// 				// this.form.duration = longD
			// 				this.$axios.post("/label/update", this.form).then(res => {
			// 					if (res.data.code === 200) {
			// 						this.modal.notifySuccess(res.data.result)
			// 					}
			// 					this.getLabelList()
			// 				})
			// 			}
			// 		} else {
			// 			this.modal.msgError('数据格式不正确，请重新输入！')
			// 			return false
			// 		}
			// 	})
			// 	this.open = false
			// },
			showLabelCharts(row) {
				this.reset()
				this.form = JSON.parse(row)
				//直接使用row传入的type值
				// this.form.type.forEach(
				// 	item => {
				// 		this.typeOptions.push({
				// 			value: item.name,
				// 			label: item.id
				// 		})
				// 	}
				// )
				this.$axios.post("/label/count", this.form).then(res => {
					if (res.data.code === 200) {
						//使用push方法前需要初始化数组，否则会报错
						this.countList = []
						res.data.result.forEach(
							item => {
								this.countList.push({
									value: item.rate,
									name: item.name
								})
							}
						)
						this.$nextTick(() => {
							// 执行echarts方法
							this.initEcharts()
						})
					}
				})
				this.open = true
				this.title = "标签占比情况"
			},
			handleDelete(row) {
				const labelIds = row.id || this.ids
				this.modal.confirm('确定要删除标签吗？').then(function() {}).then(() => {
					this.$axios.delete("/label/delete?ids=" + labelIds).then(res => {
						if (res.data.code === 200) {
							this.modal.notifySuccess(res.data.result)
							this.getLabelList()
						}
					})
				}).catch(() => {
					this.getLabelList()
				})
			},
			// 多选框选中数据
			handleSelectionChange(selection) {
				this.ids = selection.map(item => item.id)
				this.multiple = !selection.length
			},
			// 所有菜单节点数据
			getMenuAllCheckedKeys() {
				// 目前被选中的菜单节点
				let checkedKeys = this.$refs.roleTree.getCheckedKeys();
				// 半选中的菜单节点
				let halfCheckedKeys = this.$refs.roleTree.getHalfCheckedKeys();
				checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
				return checkedKeys;
			},
		},
		created() {
			this.getLabelList()
		}
	}
</script>

<style lang="scss">
	.el-table .el-dropdown-link {
		cursor: pointer;
		color: #409EFF;
		margin-left: 5px;
	}

	.el-table .el-dropdown,
	.el-icon-arrow-down {
		font-size: 12px;
	}

	.el-dialog {
		display: flex;
		flex-direction: column;
		margin: 0 !important;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.el-dialog .el-dialog__body {
		flex: 1;
		overflow: auto;
	}
</style>
