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
	<div class="flex-y-center flex-column full" v-if="isMobile()">
		<div class="flex-y-center flex-column mt-100">
			<div style="width: 150px; height: 150px" v-request="loading">
				<QrcodeVue :size="150" v-show="qrcode" :value="qrcode"></QrcodeVue>
			</div>
			<div class="mt-40 black-16 fw-b">
				<i18n-t keypath="login.please_use_phone" scope="global">
					<template v-slot:app>
						<span class="blue-16">{{ $t("router.ao_space") }} App</span>
					</template>
				</i18n-t>
			</div>
			<div class="mt-26 gray-14">{{ $t("login.version") }}</div>
		</div>
	</div>
	<div v-else class="flex-y-center login-container full">
		<img
			alt=""
			:class="choose('logo', 'logo-en')"
			class="pointer"
			:src="choose(zhLogo, enLogo)"
			@click="go('https://ao.space/', 'https://ao.space/en/')"
		/>
		<div class="core-div">
			<div class="title flex">
				<div class="subTitle">
					<div class="font-18 fw-b" style="height: 61px; line-height: 62px">
						{{ $t("login.scan_code") }}
					</div>
				</div>
			</div>
			<div class="flex-xy-center flex-column">
				<div
					class="mt-37"
					style="width: 240px; height: 240px"
					v-request="loading"
				>
					<QrcodeVue :size="240" v-show="qrcode" :value="qrcode"></QrcodeVue>
				</div>
				<div class="mt-30 black-20">
					<i18n-t keypath="login.use_scan" scope="global">
						<template v-slot:app>
							<span class="blue-20">{{ $t("router.ao_space") }} App</span>
						</template>
					</i18n-t>
				</div>
				<div class="mt-22 gray-20">{{ $t("login.web_needs") }}</div>
			</div>
		</div>
		<div class="font-20 color-1 div-one">
			<div class="mb10 tac">
				<span
					class="pointer"
					@click="go('https://ao.space/privacy', 'https://ao.space/en/privacy')"
					>{{ $t("login.privacy") }}</span
				>
				<span class="ml19 mr-19">|</span>
				<span
					class="pointer"
					@click="
						go('https://ao.space/agreement', 'https://ao.space/en/agreement')
					"
					>{{ $t("login.user") }}</span
				>
			</div>
			<div>{{ $t("login.copyright") }}</div>
		</div>
	</div>
</template>

<script>
import QrcodeVue from "qrcode.vue"
import { isMobile, chooseByLanguage } from "@/utils/help"
import zhLogo from "@/assets/new_logo.png"
import enLogo from "@/assets/英文登录页@2x.png"
import { loginUtils } from "@/api/LoginUtils"
import { getParamsFromUrl } from "../../utils/help"
import { setLanguage } from "../../language"
import IscasInput from "@/components/IscasInput.vue"
import IscasButton from "@/components/IscasButton.vue"
import { ElMessage } from "element-plus"
import networkListener from "@/album/NetworkListener"

let bkeyInterval, pollInterval

export default {
	name: "qrLogin",
	components: {
		IscasInput,
		QrcodeVue,
		IscasButton,
	},
	data() {
		return {
			zhLogo,
			enLogo,
			bkey: "",
			qrcode: "",
			loading: true,
			nextLoading: false,
			subDomain: "",
			isOpensource: "0",
		}
	},
	mounted() {
		let language = this.$route.query.language
		if (!language) {
			language = getParamsFromUrl("language")
		}
		if (language) {
			setLanguage(language)
		}
		let isOpensource = getParamsFromUrl("isOpensource")
		if (isOpensource) {
			this.isOpensource = isOpensource
		}

		this.genBkey()
		pollInterval = setInterval(this.pollBkey, 5000)
	},
	methods: {
		genBkey() {
			loginUtils
				.genBkeyByLan()
				.then((result) => {
					if (result.code === "GW-200") {
						this.loading = false
						this.bkey = result.results
						this.qrcode = "p=aospace&bt=box-login&v=" + result.results
						if (this.isMobile()) {
							this.qrcode = `${this.qrcode}&isApp=1`
						}
						if (this.isOpensource == "1") {
							this.qrcode = `${this.qrcode}&isOpensource=1`
						}
						bkeyInterval = setTimeout(this.genBkey, 120 * 1000)
					} else {
						bkeyInterval = setTimeout(this.genBkey, 3000)
					}
				})
				.catch(() => {
					bkeyInterval = setTimeout(this.genBkey, 3000)
				})
		},
		pollBkey() {
			loginUtils.pollBkeyByLan(this.bkey).then((data) => {
				console.log("pollBkey", data)

				if (data.code === "GW-200" && data.results.result !== false) {
					clearInterval(bkeyInterval)
					clearInterval(pollInterval)
					this.gotoIp(data.results.boxLanInfo)
				}
			})
		},
		gotoIp(data) {
			console.log("gotoIp", data)

			networkListener
				.ping(data.lanDomain, data.port, data.tlsPort)
				.then(() => {
					window.location.href =
						"https://" +
						data.lanDomain +
						":" +
						data.tlsPort +
						"/space/index.html?bkey=" +
						this.bkey +
						"&publickey=" +
						encodeURIComponent(data.publicKey) +
						"&version=v2#/login"
				})
				.catch(() => {
					networkListener
						.ping(data.lanIp, data.port, data.tlsPort)
						.then(() => {
							window.location.href =
								"http://" +
								data.lanIp +
								":" +
								data.port +
								"/space/index.html?bkey=" +
								this.bkey +
								"&publickey=" +
								encodeURIComponent(data.publicKey) +
								"&version=v2#/login"
						})
						.catch(() => {
							window.location.href =
								"https://" +
								data.userDomain +
								"/space/index.html?bkey=" +
								this.bkey +
								"&publickey=" +
								encodeURIComponent(data.publicKey) +
								"&version=v2#/login"
						})
				})
		},
		isMobile() {
			return isMobile()
		},
		go(zhPath, enPath) {
			const path = chooseByLanguage(zhPath, enPath)
			window.open(path, "_blank")
		},
		choose(zh, en) {
			return chooseByLanguage(zh, en)
		},
		errorMessage(message, mobileMessage) {
			if (isMobile()) {
				ElMessage({
					"custom-class": "messageMobile",
					offset: 350,
					dangerouslyUseHTMLString: true,
					message: mobileMessage ? this.$t(mobileMessage) : this.$t(message),
				})
			} else {
				ElMessage.error(this.$t(message))
			}
		},
	},
}
</script>

<style scoped lang="scss">
.pc ::v-deep(.iscasInput) {
	width: 500px;
	height: 50px;
}
.mobile ::v-deep(.iscasInput) {
	height: 22px;
	background-color: #ffffff;
	border: none;
	padding: 0;
	input {
		background-color: #ffffff;
	}
}
.subTitle {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	cursor: pointer;
	flex: 1;
	.checkLine {
		width: 40px;
		height: 2px;
		background: #337aff;
	}
	div {
		color: #333333;
	}
}
.subTitle2 {
	div {
		color: #b9b9b9;
	}
	.checkLine {
		background: none;
	}
	@extend .subTitle;
}

.title {
	height: 65px;
	border-bottom: 2px solid #eceef4;
}
.relative {
	position: relative;
}
.logo {
	width: 133px;
	height: 32px;
	top: 30px;
	left: 37px;
	position: absolute;
}

.logo-en {
	width: 356px;
	top: 30px;
	left: 37px;
	position: absolute;
}

.color-1 {
	color: #b9b9b9;
}

.div-one {
	margin-top: 133px;
}
.core-div {
	width: 600px;
	height: 480px;
	background: #ffffff;
	border-radius: 6px;
}
.login-container {
	background: url("@/assets/bg@2x.png");
	background-size: 100% 100%;
	justify-content: center;
	flex-direction: column;
	position: relative;
}
</style>
