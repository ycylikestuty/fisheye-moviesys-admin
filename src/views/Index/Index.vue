<template>
	<div class="main-class">
		<el-row :gutter="20">
			<el-col :span="8" :xs="24">
				<div class="num graph">
					<!-- 首页用户信息 -->
					<el-card style="width:400px;height: 220px">
						<div class="list-group-item">
							<p class="important-font">{{ user.nickname }}</p>
							<p class="secondary-font">管理员</p>
							<p class="secondary-font">创建时间: {{ user.createTime }}</p>
						</div>
						<div class="login-info">
						</div>
					</el-card>
				</div>
			</el-col>
			<el-col :span="16" :xs="24">
				<div class="num graph">
					<!--饼图-->
					<!-- <el-card style="width: 34%;height: 265px;marginRight: 1%">
						<div style="width: 100%;height: 265px;" ref="pieEcharts">{{initPieEcharts()}}</div>
					</el-card> -->
					<el-card style="width:650px;height: 500px">
						<div style="el-calendar-table .el-calendar-day">
							<el-calendar v-model="value"></el-calendar>
						</div>
					</el-card>
				</div>
			</el-col>
		</el-row>
	</div>
</template>

<script>
	import * as echarts from 'echarts';

	export default {
		name: "Index",
		data() {
			return {
				user: {},
				value: new Date()
			}
		},
		created() {
			this.getUserInfo()
		},
		methods: {
			getUserInfo() {
				this.$axios.get("/userInfo").then(res => {
					this.user = res.data.data.user
				})
			},
			//饼图
			initPieEcharts() {
				let p = new Promise((resolve) => {
					resolve()
				})
				//然后异步执行echarts的初始化函数
				p.then(() => {
					let myChart = echarts.init(this.$refs.pieEcharts);
					let option = {
						tooltip: {
							trigger: 'item'
						},
						legend: {
							top: '0%',
							left: 'left'
						},
						series: [{
							name: '订单信息',
							type: 'pie',
							radius: ['20%', '65%'],
							avoidLabelOverlap: false,
							label: {
								show: false,
								position: 'left'
							},
							labelLine: {
								show: false,
							},
							data: [{
									value: 1048,
									name: '成交订单量'
								},
								{
									value: 735,
									name: '退款订单量'
								},
								{
									value: 580,
									name: '浏览量'
								},
								{
									value: 484,
									name: '加购量'
								},
								{
									value: 300,
									name: '预购量'
								}
							]
						}]
					}
					myChart.setOption(option);
				})
			}
		}
	}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
	.el-card__body {
		padding: 10px;
	}

	.userCard {
		height: 180px;
		display: flex;
		border-bottom: 2px solid #DCDFE6;
		border-radius: 2px;
	}

	.userInfo {
		width: auto;
		padding: 6% 0 0 6%;
	}

	.important-font {
		font-weight: 900;
		font-size: 25px;
	}

	.secondary-font {
		color: #909399;
	}

	.el-card {
		border: none;
	}

	.graph {
		margin: 20px 0 0 20px;
	}

	.list-group-item {
		border-bottom: 1px solid #e7eaec;
		padding: 11px 0;
	}
</style>
<style>
	.el-calendar-table .el-calendar-day {
		height: 50px;
		padding: 20% 0 0 40%;
	}
</style>
