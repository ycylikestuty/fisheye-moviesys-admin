<template>
	<div class="main-class">
		<el-row :gutter="20">
			<!--违禁词数据-->
			<el-col :span="24" :xs="24">
				<!--按钮-->
				<el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
					v-permission="['prohibited:add']">新增</el-button>
				<el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple"
					@click="handleDelete" v-permission="['prohibited:delete']">删除</el-button>
				<!--表格-->
				<el-table v-loading="loading" :data="sensitiveWordList" @selection-change="handleSelectionChange">
					<el-table-column type="selection" width="50" align="center" />
					<el-table-column label="创建时间" align="center" prop="createTime" width="160">
						<template slot-scope="scope">
							<span v-if="scope.row.createTime">{{ scope.row.createTime }}</span>
							<span v-else>无</span>
						</template>
					</el-table-column>
					<el-table-column label="违禁词" align="center" key="word" prop="word" />
					<el-table-column label="操作" align="center" width="250" class-name="small-padding fixed-width">
						<template slot-scope="scope">
							<el-button size="mini" type="text" icon="el-icon-edit"
								@click="handleUpdate(JSON.stringify(scope.row))" v-permission="['prohibited:update']">修改
							</el-button>
							<el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
								v-permission="['prohibited:delete']">删除</el-button>
						</template>
					</el-table-column>
				</el-table>
			</el-col>
			<Pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum"
				:limit.sync="queryParams.pageSize" @pagination="getSensitiveWordList" />
		</el-row>
		<!-- 添加或修改违禁词配置对话框 -->
		<el-dialog :title="title" :visible.sync="open" width="650px" append-to-body>
			<el-form ref="form" :model="form" :rules="rules" label-width="80px">
				<el-row>
					<el-col :span="12">
						<el-form-item label="违禁词" prop="word">
							<el-input v-model="form.word" placeholder="请输入违禁词" maxlength="50" />
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button type="primary" @click="submitForm('form')">确 定</el-button>
				<el-button @click="cancel">取 消</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
	export default {
		name: "List",
		data() {
			return {
				// 表单参数
				form: {},
				// 查询参数
				queryParams: {
					pageNum: 1,
					pageSize: 5
				},
				showSearch: true,
				// 非多个禁用
				multiple: true,
				// 总条数
				total: 0,
				// 用户表格数据
				sensitiveWordList: null,
				//加载动画
				loading: false,
				// 选中数组
				ids: [],
				title: undefined,
				open: false,
				flag: true,
				// 表单校验
				rules: {
					word: [{
						required: true,
						message: "违禁词不能为空",
						trigger: "blur"
					}]
				}
			}
		},
		methods: {
			getSensitiveWordList() {
				this.loading = true
				this.$axios.post("/sensitiveWord/list", this.queryParams).then(res => {
					this.sensitiveWordList = res.data.result.rows
					this.total = res.data.result.total
					this.loading = false
				})
			},
			resetForm(formName) {
				if (this.$refs[formName]) {
					this.$refs[formName].resetFields();
				}
			},
			// 表单重置
			reset() {
				this.form = {
					word: undefined
				}
				this.resetForm("form")
			},
			handleAdd() {
				this.reset()
				this.open = true
				this.title = "添加违禁词"
			},
			// 取消按钮
			cancel() {
				this.open = false
				this.reset()
			},
			submitForm(formName) {
				this.$refs[formName].validate((valid) => {
					if (valid) {
						if (this.title === "添加违禁词") {
							this.$axios.post("/sensitiveWord/add", this.form).then(res => {
								if (res.data.code === 200) {
									this.modal.notifySuccess(res.data.result)
								}
								this.getSensitiveWordList()
							})
						} else if (this.title === "修改违禁词") {
							this.$axios.post("/sensitiveWord/update", this.form).then(res => {
								if (res.data.code === 200) {
									this.modal.notifySuccess(res.data.result)
								}
								this.getSensitiveWordList()
							})
						}
					} else {
						this.modal.msgError('数据格式不正确，请重新输入！')
						return false
					}
				})
				this.open = false
			},
			handleUpdate(row) {
				this.reset()
				this.form = JSON.parse(row)
				this.open = true
				this.title = "修改违禁词"
			},
			handleDelete(row) {
				const sensitiveWordIds = row.id || this.ids
				this.modal.confirm('确定要删除违禁词吗？').then(function() {}).then(() => {
					this.$axios.delete("/sensitiveWord/delete?ids=" + sensitiveWordIds).then(res => {
						if (res.data.code === 200) {
							this.modal.notifySuccess(res.data.result)
							this.getSensitiveWordList()
						}
					})
				}).catch(() => {
					this.getSensitiveWordList()
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
			this.getSensitiveWordList()
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
