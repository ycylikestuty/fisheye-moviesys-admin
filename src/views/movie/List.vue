<template>
	<div class="main-class">
		<el-row :gutter="20">
			<!--电影数据-->
			<el-col :span="24" :xs="24">
				<el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
					<el-form-item label="电影名" prop="name">
						<el-input v-model="queryParams.name" placeholder="请输入电影名" clearable size="small"
							style="width: 140px" @keyup.enter.native="handleQuery" />
					</el-form-item>
					<el-form-item label="导演姓名" prop="director">
						<el-input v-model="queryParams.director" placeholder="请输入导演姓名" clearable size="small"
							style="width: 140px" @keyup.enter.native="handleQuery" />
					</el-form-item>
					<el-form-item label="主演姓名" prop="starring">
						<el-input v-model="queryParams.starring" placeholder="请输入主演姓名" clearable size="small"
							style="width: 140px" @keyup.enter.native="handleQuery" />
					</el-form-item>
					<el-form-item label="地区" prop="area">
						<el-select v-model="queryParams.area" placeholder="地区" clearable @change="$forceUpdate()"
							size="small" style="width: 100px">
							<el-option :key="1" label="内地" :value="1" />
							<el-option :key="2" label="港台" :value="2" />
							<el-option :key="3" label="欧美" :value="3" />
							<el-option :key="4" label="韩国" :value="4" />
							<el-option :key="5" label="日本" :value="5" />
							<el-option :key="6" label="其他" :value="6" />
						</el-select>
					</el-form-item>
					<el-form-item label="类型" prop="type">
						<el-select v-model="queryParams.type" placeholder="电影类型" clearable multiple
							@change="controllerType" size="small" style="width: 200px">
							<template v-for="item in typeOptions">
								<el-option :label="item.name" :value="item.name"></el-option>
								<!-- <template v-for="child in item.children">
					                <el-option :label="child.deptName" :value="child.deptId">
					                    <span>{{ "- " + child.deptName }}</span>
					                </el-option>
					            </template> -->
							</template>
						</el-select>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
						<el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
					</el-form-item>
				</el-form>
				<!--按钮-->
				<el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
					v-permission="['movie:add']">新增</el-button>
				<el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple"
					@click="handleDelete" v-permission="['movie:delete']">删除</el-button>
				<!--表格-->
				<el-table v-loading="loading" :data="movieList" @selection-change="handleSelectionChange">
					<el-table-column type="selection" width="50" align="center" />
					<el-table-column label="电影海报" align="center" key="img" prop="img">
						<template slot-scope="scope">
							<img :src="scope.row.img" min-width="50" height="50" />
						</template>
					</el-table-column>
					<el-table-column label="电影名" align="center" key="name" prop="name" />
					<el-table-column label="导演" align="center" key="director" prop="director" />
					<el-table-column label="主演" align="center" key="starring" prop="starring">
						<template slot-scope="scope">
							<span>{{ scope.row.starring | ellipsis(15) }}</span>
						</template>
					</el-table-column>
					<el-table-column label="地区" align="center" key="area" prop="area">
						<template slot-scope="scope">
							<span v-if="scope.row.area == 1">内地</span>
							<span v-else-if="scope.row.area == 2">港台</span>
							<span v-else-if="scope.row.area == 3">欧美</span>
							<span v-else-if="scope.row.area == 4">韩国</span>
							<span v-else-if="scope.row.area == 5">日本</span>
							<span v-else>其他</span>
						</template>
					</el-table-column>
					<el-table-column label="类型" align="center" key="type" prop="type">
						<template slot-scope="scope">
							<span v-for="(item,idx) in scope.row.type">
								{{item}}{{idx === scope.row.type.length-1 ? "":"、"}}
							</span>
						</template>
					</el-table-column>
					<el-table-column label="上映年份" align="center" key="year" prop="year" />
					<!-- <el-table-column label="剧情简介" align="center" key="synopsis" prop="synopsis"> -->
					<!-- 超出长度限制的文本显示为省略号，并且鼠标移动上去也不显示-->
					<!-- <template slot-scope="scope">
					  	<span>{{ scope.row.synopsis | ellipsis(20) }}</span>
					  </template>
					</el-table-column> -->
					<el-table-column label="操作" align="center" width="250" class-name="small-padding fixed-width">
						<template slot-scope="scope">
							<el-button size="mini" type="text" icon="el-icon-edit"
								@click="handleUpdate(JSON.stringify(scope.row))" v-permission="['movie:update']">修改
							</el-button>
							<el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
								v-permission="['movie:delete']">删除</el-button>
						</template>
					</el-table-column>
				</el-table>
			</el-col>
			<Pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum"
				:limit.sync="queryParams.pageSize" @pagination="getMovieList" />
		</el-row>
		<!-- 添加或修改电影配置对话框 -->
		<el-dialog :title="title" :visible.sync="open" width="650px" append-to-body>
			<el-form ref="form" :model="form" :rules="rules" label-width="80px">
				<el-row>
					<el-col :span="12">
						<el-form-item label="电影名" prop="name">
							<el-input v-model="form.name" placeholder="请输入电影名" maxlength="50" />
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="导演" prop="director">
							<el-input v-model="form.director" placeholder="请输入导演姓名" maxlength="30" />
						</el-form-item>
					</el-col>
				</el-row>
				<el-row>
					<el-col :span="12">
						<el-form-item label="主演" prop="starring">
							<el-input v-model="form.starring" placeholder="请输入主演姓名" maxlength="30" />
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="上映年份" prop="year">
							<el-input v-model="form.year" placeholder="请输入上映年份" maxlength="30" />
						</el-form-item>
					</el-col>
				</el-row>
				<el-row>
					<el-col :span="12">
						<el-form-item label="时长" prop="duration">
							<el-input v-model="form.duration" placeholder="请输入时长" maxlength="30" />
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="类型" prop="type">
							<el-select v-model="form.type" placeholder="请选择类型" multiple clearable
								@change="controllerType">
								<template v-for="item in typeOptions">
									<el-option :label="item.name" :value="item.name">
										<!--label:选项的标签 即 在网页上显示的内容-->
										<!--value:点击某个label(option)后，将对应的值传给v-model绑定的值 即 需要往后端发送的内容/接收后端的内容-->
										<!--若是向后端传送Long类型的数据，需要将:value改为item.id-->
									</el-option>
								</template>
							</el-select>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row>
					<el-col :span="12">
						<el-form-item label="地区" prop="area">
							<el-select v-model="form.area" placeholder="地区" @change="$forceUpdate()" clearable>
								<el-option :key="1" label="内地" :value="1" />
								<el-option :key="2" label="港台" :value="2" />
								<el-option :key="3" label="欧美" :value="3" />
								<el-option :key="4" label="韩国" :value="4" />
								<el-option :key="5" label="日本" :value="5" />
								<el-option :key="6" label="其他" :value="6" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="海报" prop="img">
							<!--两个div默认情况下是垂直排列的-->
							<!--两个div水平排列只需设置这两个div的style="float: left”属性即可-->
							<div style="text-align:center;margin-left:25px;float:left">
								<img :src="form.img" min-width="70" height="70" />
							</div>
							<div style="text-align:center;margin-left:25px;float:left;margin-top:18px;">
								<el-button size="mini" type="primary" plain @click="mmm"
									v-permission="['movie:update']">
									上传海报
								</el-button>
							</div>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row>
					<el-col :span="24">
						<el-form-item label="剧情简介" prop="synopsis" style="margin-top:-15px">
							<el-input v-model="form.synopsis" type="textarea" placeholder="请输入剧情简介" maxlength="30"
								:rows="5" />
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
				// 类型选项
				typeOptions: undefined,
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
					name: undefined,
					director: undefined,
					starring: undefined,
					type: undefined
				},
				showSearch: true,
				// 非多个禁用
				multiple: true,
				// 总条数
				total: 0,
				// 用户表格数据
				movieList: null,
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
				flag: true,
				// 表单校验
				rules: {
					name: [{
							required: true,
							message: "电影名不能为空",
							trigger: "blur"
						}
						// { min:1, message: '用户名必须为12位', trigger: 'blur' }
					],
					director: [{
							required: true,
							message: "导演名字不能为空",
							trigger: "blur"
						}
						// { min: 2, max: 12, message: '昵称长度必须介于 2 和 12之间', trigger: 'blur' }
					],
					starring: [{
						required: true,
						message: "主演名字不能为空",
						trigger: "blur"
					}],
					year: [{
							required: true,
							message: "上映年份不能为空",
							trigger: "blur"
						},
						{
							min: 4,
							max: 4,
							message: '年份必须为4位',
							trigger: 'blur'
						}
					],
					duration: [
						//ransform：向验证规则添加一个函数，该属性在验证之前进行转换，并重新分配给源对象，以便在适当的位置改变属性的类型
						{
							type: 'string',
							required: true,
							message: "时长不能为空",
							trigger: "blur",
							transform: (value) => String(value)
						},
						{
							max: 3,
							message: '昵称长度必须介于 1 和 3之间',
							trigger: 'blur'
						}
					],
					area: [{
						required: true,
						message: "地区不能为空",
						trigger: "blur"
					}],
					type: [{
						required: true,
						message: "类型不能为空",
						trigger: "blur"
					}]
				}
			}
		},
		methods: {
			getTypeList() {
				this.$axios.get("/type/list").then(res => {
					this.typeOptions = res.data.result
				})
			},
			getMovieList() {
				this.loading = true
				this.$axios.post("/movie/list", this.queryParams).then(res => {
					this.movieList = res.data.result.rows
					this.total = res.data.result.total
					this.loading = false
				})
			},
			//控制选择电影类型操作
			controllerType(e) {
				this.$forceUpdate();
				if (e.length > 3) {
					this.$message.warning("最多只能选择三个电影类型");
					this.queryParams.type.splice(-1);
					this.form.type.splice(-1);
				}
			},
			/** 搜索按钮操作 */
			handleQuery() {
				this.queryParams.pageNum = 1;
				this.getMovieList()
				this.getTypeList()
			},
			/** 重置按钮操作 */
			resetQuery() {
				this.queryParams = {
					pageNum: 1,
					pageSize: 10,
					name: undefined,
					director: undefined,
					starring: undefined,
					type: undefined
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
					director: undefined,
					starring: undefined,
					year: undefined,
					type: undefined
				}

				this.resetForm("form")
			},
			handleAdd() {
				this.reset()
				this.getTypeList()
				this.open = true
				this.title = "添加电影"
			},
			// 取消按钮
			cancel() {
				this.open = false
				this.reset()
			},
			submitForm(formName) {
				this.$refs[formName].validate((valid) => {
					if (valid) {
						if (this.title === "添加电影") {
							var longD = Number(this.form.duration)
							this.form.duration = longD
							this.form.img =
								"https://img2.doubanio.com/view/photo/s_ratio_poster/public/p2545472803.webp"
							this.$axios.post("/movie/add", this.form).then(res => {
								if (res.data.code === 200) {
									this.modal.notifySuccess(res.data.result)
								}
								this.getMovieList()
							})
						} else if (this.title === "修改电影") {
							//将String类型转化为Number类型，因为js没有Long类型
							var longD = Number(this.form.duration)
							console.log("type:" + this.form.type)
							this.form.duration = longD
							this.$axios.post("/movie/update", this.form).then(res => {
								console.log("type4:" + this.form.type)
								if (res.data.code === 200) {
									this.modal.notifySuccess(res.data.result)
								}
								this.getMovieList()
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
				//for…in输出的是数组索引,所以改为普通的for循环或者forEach
				//普通的for
				// for(var i=0;i<this.typeOptions.length;i++){
				// 	console.log("itemName:"+this.typeOptions[i].name)
				// }
				//forEach
				// this.typeOptions.forEach(
				// 	item=>console.log("itemNeam:"+item.name)
				// )

				//JSON.parse(row)：解析传入的json
				//Select选项值动态从后台接口获取的实现方法1
				//向后端发送数据，获取该电影的type
				// this.$axios.post("/type/getTypeById",JSON.parse(row).id).then(res=>{
				// 	if(res.data.code == 200){
				// 		var movieType=res.data.result
				// 		movieType.forEach(
				// 		 item=>{
				// 			 console.log("movieItem:"+item.id)
				// 			 this.typeOptions.push({
				// 				 value:item.name,
				// 				 label:item.name
				// 			 })
				// 		 }
				// 		)
				// 	}//code==200				
				// })//then=>res
				this.reset()
				this.form = JSON.parse(row)
				//方法2
				//直接使用row传入的type值
				this.form.type.forEach(
					item => {
						this.typeOptions.push({
							value: item.name,
							label: item.id
						})
					}
				)
				//也可以不使用上面的方法，反正能成功
				this.open = true
				this.title = "修改电影"
			},
			handleDelete(row) {
				const movieIds = row.id || this.ids
				this.modal.confirm('确定要删除电影吗？').then(function() {}).then(() => {
					this.$axios.delete("/movie/delete?ids=" + movieIds).then(res => {
						if (res.data.code === 200) {
							this.modal.notifySuccess(res.data.result)
							this.getMovieList()
						}
					})
				}).catch(() => {
					this.getMovieList()
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
			this.getMovieList()
			this.getTypeList()
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
