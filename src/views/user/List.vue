<template>
	<div class="main-class">
		<el-row :gutter="20">
			<!--用户数据-->
			<el-col :span="24" :xs="24">
				<el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
					<el-form-item label="用户名" prop="username">
						<el-input v-model="queryParams.username" placeholder="请输入用户名" clearable size="small"
							style="width: 180px" @keyup.enter.native="handleQuery" />
					</el-form-item>
					<el-form-item label="昵称" prop="nickname">
						<el-input v-model="queryParams.nickname" placeholder="请输入昵称" clearable size="small"
							style="width: 180px" @keyup.enter.native="handleQuery" />
					</el-form-item>
					<el-form-item label="状态" prop="status">
						<el-select v-model="queryParams.status" placeholder="角色状态" clearable size="small"
							style="width: 150px">
							<el-option :key="1" label="禁言" :value="1" />
							<el-option :key="0" label="正常" :value="0" />
						</el-select>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
						<el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
					</el-form-item>
				</el-form>
				<el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple"
					@click="handleDelete" v-permission="['user:delete']">删除</el-button>
				<!--表格-->
				<el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
					<el-table-column type="selection" width="50" align="center" />
					<el-table-column label="用户头像" align="center" key="img" prop="img">
						<template slot-scope="scope">
							<img :src="scope.row.img" min-width="50" height="50" />
						</template>
					</el-table-column>
					<el-table-column label="用户名称" align="center" key="username" prop="username" />
					<el-table-column label="用户昵称" align="center" key="nickname" prop="nickname" />
					<el-table-column label="用户等级" align="center" key="grade" prop="grade" />
					<el-table-column label="状态" align="center" key="status">
						<template slot-scope="scope">
							<el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0"
								@change="handleStatusChange(scope.row)"></el-switch>
						</template>
					</el-table-column>
					<el-table-column label="创建时间" align="center" prop="createTime" width="160">
						<template slot-scope="scope">
							<span v-if="scope.row.createTime">{{ scope.row.createTime }}</span>
							<span v-else>无</span>
						</template>
					</el-table-column>
					<el-table-column label="操作" align="center" width="250" class-name="small-padding fixed-width">
						<template slot-scope="scope">
							<el-button size="mini" type="text" icon="el-icon-edit"
								@click="handleUpdate(JSON.stringify(scope.row))" v-permission="['user:update']">修改
							</el-button>
							<el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
								v-permission="['user:delete']">删除</el-button>
						</template>
					</el-table-column>
				</el-table>
			</el-col>
			<Pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum"
				:limit.sync="queryParams.pageSize" @pagination="getUserList" />
		</el-row>
		<!-- 修改用户配置对话框 -->
		<el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
			<el-form ref="form" :model="form" :rules="rules" label-width="80px">
				<el-row>
					<el-col :span="12">
						<el-form-item label="用户名" prop="username">
							<el-input v-model="form.username" placeholder="请输入用户名" maxlength="30" />
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="昵称" prop="nickname">
							<el-input v-model="form.nickname" placeholder="请输入昵称" maxlength="50" />
						</el-form-item>
					</el-col>
				</el-row>
				<el-row>
					<el-col :span="12">
						<el-form-item label="状态">
							<el-radio-group v-model="form.status">
								<el-radio :label=1><span style="font-weight: normal">禁言</span></el-radio>
								<el-radio :label=0><span style="font-weight: normal">正常</span></el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
				</el-row>

			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button type="primary" @click="submitForm('form')">确 定</el-button>
				<el-button @click="cancel">取 消</el-button>
			</div>
		</el-dialog>
		<!-- 分配权限对话框 -->
	</div>
</template>

<script>
	export default {
		name: "List",
		data() {
			return {
				// 部门树选项
				// deptOptions: undefined,
				// 表单参数
				form: {},
				// roleProps: {
				//     children: "children",
				//     label: "name"
				// },
				// 查询参数
				queryParams: {
					pageNum: 1,
					pageSize: 10,
					username: undefined,
					nickname: undefined,
					status: undefined
				},
				showSearch: true,
				// 非多个禁用
				multiple: true,
				// 总条数
				total: 0,
				// 用户表格数据
				userList: null,
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
				// roleOpen: false,
				userId: undefined,
				// 表单校验
				rules: {
					username: [{
							required: true,
							message: "用户名不能为空",
							trigger: "blur"
						},
						{
							min: 12,
							message: '用户名必须为12位',
							trigger: 'blur'
						}
					],
					nickname: [{
							required: true,
							message: "昵称不能为空",
							trigger: "blur"
						},
						{
							min: 2,
							max: 12,
							message: '昵称长度必须介于 2 和 12之间',
							trigger: 'blur'
						}
					]
				}
			}
		},
		methods: {

			getUserList() {
				this.loading = true
				this.$axios.post("/user/list", this.queryParams).then(res => {
					this.userList = res.data.result.rows
					this.total = res.data.result.total
					this.loading = false
				})
			},
			/** 搜索按钮操作 */
			handleQuery() {
				this.queryParams.pageNum = 1;
				this.getUserList()
			},
			/** 重置按钮操作 */
			resetQuery() {
				this.queryParams = {
					pageNum: 1,
					pageSize: 10,
					username: undefined,
					nickname: undefined,
					status: undefined
				}
				this.resetForm("queryForm");
				this.handleQuery();
			},
			handleStatusChange(row) {
				let text = row.status === 1 ? "禁言" : "解禁"
				this.modal.confirm('确认要"' + text + '""' + row.username + '"用户吗？').then(function() {}).then(() => {
					var date = new Date();
					var year = date.getFullYear(); //月份从0~11，所以加一
					var dateArr = [date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date
						.getSeconds()
					];
					for (var i = 0; i < dateArr.length; i++) {
						if (dateArr[i] >= 1 && dateArr[i] <= 9) {
							dateArr[i] = "0" + dateArr[i];
						}
					}
					var strDate = year + '-' + dateArr[0] + '-' + dateArr[1] + ' ' + dateArr[2] + ':' + dateArr[
						3] + ':' + dateArr[4];
					row.modifyTime = strDate;
					this.$axios.post("/user/update", row).then(res => {
						if (res.data.code === 200) {
							this.modal.msgSuccess(text + "成功")
						} else {
							row.status = row.status === 0 ? 1 : 0
						}
						this.getUserList()
					})
				}).catch(() => {
					row.status = row.status === 0 ? 1 : 0
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
					username: undefined,
					nickname: undefined,
					status: 1
				}
				this.resetForm("form")
			},
			// handleAdd(){
			//     this.reset()
			//     this.getDeptList()
			//     this.open = true
			//     this.title = "添加用户"
			// },
			// 取消按钮
			cancel() {
				this.open = false
				this.reset()
			},
			submitForm(formName) {
				this.$refs[formName].validate((valid) => {
					if (valid) {
						// if (this.title === "添加用户"){
						//     this.$axios.post("/sys/user", this.form).then(res => {
						//         if (res.data.code === 200){
						//             this.modal.notifySuccess(res.data.data)
						//         }
						//         this.getUserList()
						//     })
						// }
						if (this.title === "修改用户") {
							var date = new Date();
							var year = date.getFullYear(); //月份从0~11，所以加一
							var dateArr = [date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(),
								date.getSeconds()
							];
							for (var i = 0; i < dateArr.length; i++) {
								if (dateArr[i] >= 1 && dateArr[i] <= 9) {
									dateArr[i] = "0" + dateArr[i];
								}
							}
							var strDate = year + '-' + dateArr[0] + '-' + dateArr[1] + ' ' + dateArr[2] + ':' +
								dateArr[3] + ':' + dateArr[4];
							this.form.modifyTime = strDate
							this.$axios.post("/user/update", this.form).then(res => {
								if (res.data.code === 200) {
									this.modal.notifySuccess(res.data.result)
								}
								this.getUserList()
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
				this.title = "修改用户"
			},
			/** 重置密码按钮操作 */
			// handleResetPwd(row) {
			//     this.$prompt('请输入"' + row.username + '"的新密码', "提示", {
			//         confirmButtonText: "确定",
			//         cancelButtonText: "取消",
			//         closeOnClickModal: false,
			//         inputPattern: /^.{5,20}$/,
			//         inputErrorMessage: "用户密码长度必须介于 5 和 20 之间",
			//     }).then(({ value }) => {
			//         row.password = value
			//         this.$axios.post("/sys/user/reset", row).then(res => {
			//             if (res.data.code === 200){
			//                 this.modal.notifySuccess("修改成功，新密码是：" + value)
			//             }
			//         })
			//         this.getUserList()
			//     }).catch(() => {});
			// },
			// 更多操作触发
			// handleCommand(command, row) {
			//     switch (command) {
			//         case "handleResetPwd":
			//             this.handleResetPwd(row);
			//             break;
			//         // case "roleHandle":
			//         //     this.roleHandle(row)
			//         //     break;
			//         default:
			//             break;
			//     }
			// },
			handleDelete(row) {
				const userIds = row.id || this.ids
				// if (userIds.length > 1 && userIds.indexOf(1) !== -1){
				//     this.modal.notifyWarning("不可以删除管理员")
				// }
				// else{
				this.modal.confirm('确定要删除用户吗？').then(function() {}).then(() => {
					this.$axios.delete("/user/delete?ids=" + userIds).then(res => {
						if (res.data.code === 200) {
							this.modal.notifySuccess(res.data.result)
							this.getUserList()
						}
					})
				}).catch(() => {
					this.getUserList()
				})
				// }

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
			// roleHandle(row){
			//     this.roleOpen = true
			//     this.userId = row.id
			//     this.$axios.get("/sys/role/list").then(res => {
			//         this.roleTreeData = res.data.data.records
			//     })
			//     this.$axios.get("/sys/user/info/" + row.id).then(res => {
			//         let roleIds = []
			//         res.data.data.forEach(result => {
			//             roleIds.push(result.roleId)
			//         })
			//         this.$refs.roleTree.setCheckedKeys(roleIds)
			//     })
			// },
			// roleSubmit(){
			//     this.roleForm.roleIds = this.getMenuAllCheckedKeys()
			//     this.$axios.post("/sys/user/userRole/" + this.userId, this.roleForm.roleIds).then(res => {
			//         if (res.data.code === 200){
			//             this.modal.notifySuccess(res.data.data)
			//         }
			//         this.getUserList()
			//     })
			//     this.roleOpen = false
			// }
		},
		created() {
			this.getUserList()
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
</style>
