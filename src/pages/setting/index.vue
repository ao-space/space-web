<!--
  ~ Copyright (c) 2022 Institute of Software Chinese Academy of Sciences (ISCAS)
  ~
  ~ Licensed under the Apache License, Version 2.0 (the "License");
  ~ you may not use this file except in compliance with the License.
  ~ You may obtain a copy of the License at
  ~
  ~     http://www.apache.org/licenses/LICENSE-2.0
  ~
  ~ Unless required by applicable law or agreed to in writing, software
  ~ distributed under the License is distributed on an "AS IS" BASIS,
  ~ WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  ~ See the License for the specific language governing permissions and
  ~ limitations under the License.
-->

<template>
	<el-container>
		<el-header style="display: inline-flex">
			<div class="y-center ml-auto">
				<DownUpCover></DownUpCover>
				<NotificationCenter class="ml20 mr20" />
				<more></more>
			</div>
		</el-header>

		<el-main class="container">
			<PersonInfo @personIconChange="personIconChange"></PersonInfo>

			<div class="mt20" id="devices">
				<div class="info">{{ $t("router.device") }}</div>
				<div class="flex">
					<div class="y-center device">
						<div v-if="deviceModelNumber === 0" class="zhanwei"></div>
						<img src="@/assets/device.png" />
						<div style="">
							<div class="fw-b font-16 mt-5 mb-12">
								{{ `${$t("router.ao_space")}（${$t("setting.open_source")}）` }}
							</div>
							<div class="color-85899c lh-20" style="width: 220px">
								<div class="font-12">{{ $t("setting.product_sn") }}</div>
								<div class="color-333333 fw-b">
									{{ deviceVersion.snNumber ? deviceVersion.snNumber : "- -" }}
								</div>
							</div>
							<div class="flex">
								<div class="color-85899c lh-20">
									<div class="font-12">{{ $t("setting.total") }}</div>
									<div class="color-333333 fw-b">{{ spaceSizeTotal }}</div>
								</div>
								<el-divider
									direction="vertical"
									style="height: 38px; margin-right: 30px; margin-left: 30px"
								/>
								<div class="color-85899c lh-20">
									<div class="font-12">{{ $t("setting.used") }}</div>
									<div class="color-333333 fw-b">{{ spaceSizeUsed }}</div>
								</div>
								<el-divider
									direction="vertical"
									style="height: 38px; margin-right: 30px; margin-left: 30px"
								/>
								<div class="color-85899c lh-20">
									<div class="font-12">{{ $t("setting.unused") }}</div>
									<div class="color-333333 fw-b">{{ spaceSizeUnsed }}</div>
								</div>
							</div>
							<div class="flex mt-10">
								<div class="color-85899c lh-20">
									<div class="font-12">{{ $t("setting.bound_device") }}</div>
									<div class="color-333333 fw-b">{{ user.phoneModel }}</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<ClientList />
			<SafeSetting class="mt-40 mb-40"> </SafeSetting>
		</el-main>
	</el-container>
</template>

<script lang="ts">
import {
	getStorage,
	getMemberList,
	getDeviceVersion,
	getMemberUsedStorage,
	getImage,
	getServiceConfig,
} from "@/api/index"
import SafeSetting from "./component/SafeSetting.vue"
import iconimg from "@/assets/touxiang.png"
import more from "@/components/more.vue"
import DownUpCover from "../../components/DownUpCover.vue"
import NotificationCenter from "../../components/NotificationCenter.vue"
import ClientList from "./component/ClientList.vue"
import { dealSpace } from "./component/diskCommon"
import PersonInfo from "./component/PersonInfo.vue"
import { getDeviceAbilityWithCache } from "@/api/disk"
import { keyMap } from "@/utils/constant"
import localforage from "localforage"
import { getPersonalCache, getAoid } from "@/business/login/loginUtils"

export default {
	name: "setting",
	components: {
		PersonInfo,
		ClientList,
		SafeSetting,
		more,
		DownUpCover,
		NotificationCenter,
	},
	data() {
		return {
			iconimg: iconimg,
			activeName: "notify",
			spaceSizeTotal: 0,
			spaceSizeUsed: 0,
			spaceSizeUnsed: 0,
			file: "",
			test: "",

			memberList: [],
			deviceVersion: {},
			point: "",
			deviceModelNumber: 0,
			user: {},
			isTrial: false,
		}
	},

	beforeMount() {
		let modelNum = JSON.parse(localStorage.getItem(keyMap.deviceModelNumber))
		if (modelNum >= -299 && modelNum <= -200) {
			this.isTrial = true
		}

		this.user = getPersonalCache().results[0]

		if (!this.isTrial) {
			this.storapi()
		}
		this.getMemberList()
		this.getDeviceVersion()

		getDeviceAbilityWithCache().then((res) => {
			this.deviceModelNumber = res.results.deviceModelNumber
			localStorage.setItem(
				keyMap.deviceModelNumber,
				res.results.deviceModelNumber
			)
		})
		const aoid = getAoid()
		const clientUUID = localStorage.getItem("clientUUID")
		// getServiceConfig(clientUUID, aoid).then((res) => {
		// 	if (res.code === "200") {
		// 		localStorage.setItem("serviceConfig", JSON.stringify(res.results))
		// 	}
        //     console.log("serviceConfig", res)
		// })
	},
	mounted() {
		let point = this.$route.query.p
		if (point) {
			this.point = point
		}
	},
	methods: {
		personIconChange() {
			this.getMemberList()
		},
		gotoPoint() {
			if (this.point) {
				document.querySelector("#" + this.point).scrollIntoView()
			}
		},
		uploadImg(e, num) {
			//上传图片
			// this.option.img
			var file = e.target.files[0]

			if (!/\.(gif|jpg|jpeg|png|bmp|GIF|JPG|PNG)$/.test(e.target.value)) {
				alert("图片类型必须是.gif,jpeg,jpg,png,bmp中的一种")
				return false
			}
			var reader = new FileReader()
			reader.onload = (e) => {
				let data
				if (typeof e.target.result === "object") {
					// 把Array Buffer转化为blob 如果是base64不需要
					data = window.URL.createObjectURL(new Blob([e.target.result]))
				} else {
					data = e.target.result
				}
				if (num === 1) {
					this.option.img = data
				} else if (num === 2) {
					this.example2.img = data
				}
			}
			// 转化为base64
			// reader.readAsDataURL(file)
			// 转化为blob
			reader.readAsArrayBuffer(file)
		},
		onClearAll() {},
		onPrintImg(res) {},
		cutDown(res) {
			return res
		},
		storapi() {
			getStorage().then((data) => {
				this.spaceSizeTotal = dealSpace(data.spaceSizeTotal)
				this.spaceSizeUsed = dealSpace(data.spaceSizeUsed)
				this.spaceSizeUnsed = dealSpace(
					data.spaceSizeTotal - data.spaceSizeUsed
				)
			})
		},

		getMemberList() {
			setTimeout(this.gotoPoint, 500)
			localforage.getItem("__memberList__").then((result) => {
				console.log("from catch memberlist", result)
				if (result) {
					this.memberList = result
				}
			})
			getMemberList().then(async (result) => {
				if (result.code == "ACC-200") {
					let memberList = []
					for (let member of result.results) {
						let [storage, blob] = await Promise.all([
							getMemberUsedStorage(member.aoId),
							getImage(member.aoId),
						])
						console.log("user storage", storage)
						if (storage.code === "200") {
							member.storage = dealSpace(storage.results.userStorage)
						}
						member.iconUrl = window.URL.createObjectURL(blob)
						memberList.push(member)
						if (this.isTrial && member.aoId === this.user.aoId) {
							this.spaceSizeTotal = dealSpace(storage.results.totalStorage)
							this.spaceSizeUsed = member.storage
							this.spaceSizeUnsed = dealSpace(
								storage.results.totalStorage - storage.results.userStorage
							)
						}
					}
					localforage.setItem("__memberList__", memberList)
					this.memberList = memberList
				}
			})
		},
		getDeviceVersion() {
			getDeviceVersion().then((result) => {
				if (result.code == "AG-200") {
					let device = {}
					device.deviceName = result.results.deviceName
					device.productModel = result.results.productModel
					device.snNumber = result.results.snNumber
					this.deviceVersion = device
				}
			})
		},
	},
}
</script>

<style lang="scss" scoped>
.family {
	width: 320px;
	min-width: 320px;
	height: 148px;
	background: #f9fafd;
	border-radius: 6px;
	padding: 20px;
	margin-right: 20px;
	margin-bottom: 20px;
	display: inline-flex;
	line-height: 20px;
	img {
		width: 40px;
		height: 40px;
		border-radius: 50%;
	}
	.icon {
		width: 40px;
		height: 40px;
		margin-right: 20px;
	}
	.adminIcon {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 16px;
		height: 16px;
	}
	.nickName {
		width: 220px;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}
}
.info {
	font-weight: bolder;
	color: #464956;
	font-size: 20px;
	margin-bottom: 20px;
}
.device {
	min-width: 700px;
	min-height: 182px;
	background: #eff4ff;
	border-radius: 6px;
	padding: 20px 30px;
	img {
		width: 110px;
		height: 93px;
		margin-right: 30px;
	}
	.zhanwei {
		width: 110px;
		height: 93px;
		margin-right: 30px;
	}
}
.container {
	overflow-x: hidden;
	overflow-y: auto;
	border-top: 1px solid #f5f6fa;
	padding: 20px 40px;
	text-align: left;
	font-size: 14px;
	color: #464956;
	min-width: 950px;
}
</style>
