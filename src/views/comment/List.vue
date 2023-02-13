<template>
	<div class="main-class">
		<el-row :gutter="20">
			<!--评论数据-->
			<el-col :span="24" :xs="24">
				<el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
					<el-form-item label="用户名" prop="userName">
						<el-input v-model="queryParams.userName" placeholder="请输入用户名" clearable size="small"
							style="width: 140px" @keyup.enter.native="handleQuery" />
					</el-form-item>
					<el-form-item label="电影名" prop="movieName">
						<el-input v-model="queryParams.movieName" placeholder="请输入电影名" clearable size="small"
							style="width: 140px" @keyup.enter.native="handleQuery" />
					</el-form-item>
					<el-form-item label="评论详情" prop="detail">
						<el-input v-model="queryParams.detail" placeholder="请输入评论详情" clearable size="small"
							style="width: 140px" @keyup.enter.native="handleQuery" />
					</el-form-item>
					<el-form-item label="状态" prop="status">
						<el-select v-model="queryParams.status" placeholder="状态" clearable size="small"
							style="width: 100px">
							<el-option :key="0" label="正常" :value="0" />
							<el-option :key="1" label="加精" :value="1" />
							<el-option :key="2" label="被举报" :value="2" />
						</el-select>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
						<el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
					</el-form-item>
				</el-form>
				<!--按钮-->
				<el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple"
					@click="handleDelete" v-permission="['comment:delete']">删除</el-button>
				<!--表格-->
				<el-table v-loading="loading" :data="commentList" @selection-change="handleSelectionChange">
					<el-table-column type="selection" width="50" align="center" />
					<el-table-column label="用户名" align="center" key="userName" prop="userName" />
					<el-table-column label="电影名" align="center" key="movieName" prop="movieName" />
					<el-table-column label="点赞数" align="center" key="star" prop="star" />
					<el-table-column label="收藏数" align="center" key="collect" prop="collect" />

					<el-table-column label="状态" align="center" key="status">
						<template slot-scope="scope">
							<el-button size="mini" v-if="scope.row.status == 0" type="text" icon="el-icon-star-off"
								@click="handleUpdate(scope.row)" v-permission="['comment:update']">加精
							</el-button>
							<el-button size="mini" v-if="scope.row.status == 1" type="text" icon="el-icon-star-on"
								@click="handleUpdate(scope.row)" v-permission="['comment:update']">已加精
							</el-button>
							<el-button size="mini" v-if="scope.row.status == 2" type="text" icon="el-icon-warning"
								@click="handleUpdate(scope.row)" v-permission="['comment:update']">被举报
							</el-button>
						</template>
					</el-table-column>
					<el-table-column label="评论详情" align="center" key="detail" prop="detail">
						<template slot-scope="scope">
							<span @click="showCommentDetail(scope.row.detail)">{{ scope.row.detail | ellipsis(15) }}</span>
						</template>
					</el-table-column>
					<el-table-column label="操作" align="center" width="250" class-name="small-padding fixed-width">
						<template slot-scope="scope">
							<el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
								v-permission="['comment:delete']">删除</el-button>
						</template>
					</el-table-column>
				</el-table>
			</el-col>
			<Pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum"
				:limit.sync="queryParams.pageSize" @pagination="getCommentList" />
		</el-row>
		<!-- 显示评论内容详情对话框-->
		<el-dialog :title="title" :visible.sync="open" width="650px" append-to-body>
			<el-form ref="form" :model="form" :rules="rules" label-width="80px">
				<el-row>
					<el-col :span="24">
						<el-form-item label="影评详情" prop="detail" style="margin-top:-15px">
							<!--readonly属性保证了input输入框只读不写 -->
							<el-input v-model="form.detail" type="textarea" maxlength="30" readonly="true"
								:rows="5" />
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
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
					pageSize: 10,
					userName: undefined,
					movieName: undefined,
					detail: undefined,
					status: undefined
				},
				showSearch: true,
				// 非多个禁用
				multiple: true,
				// 总条数
				total: 0,
				// 用户表格数据
				commentList: null,
				//加载动画
				loading: false,
				// 选中数组
				ids: [],
				title: undefined,
				open: false
			}
		},
		methods: {
			getCommentList() {
				this.loading = true
				this.$axios.post("/comment/list", this.queryParams).then(res => {
					this.commentList = res.data.result.rows
					this.total = res.data.result.total
					this.loading = false
				})
			},
			/** 搜索按钮操作 */
			handleQuery() {
				this.queryParams.pageNum = 1;
				this.getCommentList()
			},
			/** 重置按钮操作 */
			resetQuery() {
				this.queryParams = {
					pageNum: 1,
					pageSize: 10,
					userName: undefined,
					movieName: undefined,
					detail: undefined,
					status: undefined
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
					userName: undefined,
					movieName: undefined,
					detail: undefined,
					status: undefined
				}

				this.resetForm("form")
			},
			handleUpdate(row) {
				console.log(row)
				this.$axios.post("/comment/update", row).then(res => {
					if (res.data.code === 200) {
						this.modal.notifySuccess(res.data.result)
					}
					this.getCommentList()
				})
			},
			showCommentDetail(detail) {
				this.reset()
				this.form.detail = detail
				this.open = true
				this.title = "显示详情"
			},
			handleDelete(row) {
				const movieIds = row.id || this.ids
				this.modal.confirm('确定要删除评论吗？').then(function() {}).then(() => {
					this.$axios.delete("/comment/delete?ids=" + movieIds).then(res => {
						if (res.data.code === 200) {
							this.modal.notifySuccess(res.data.result)
							this.getCommentList()
						}
					})
				}).catch(() => {
					this.getCommentList()
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
		//设置过滤器,当文本长度超过limit使用省略号
		filters: {
			ellipsis(value, limit) {
				if (!value) return ''
				if (value.length > limit) {
					return value.slice(0, limit) + '...'
				}
				return value
			},
		},
		created() {
			this.getCommentList()
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
