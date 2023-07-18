# Copyright (c) 2022 Institute of Software Chinese Academy of Sciences (ISCAS)
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

#FROM nginx:1.21.3-alpine
FROM openresty/openresty:1.21.4.1-4-bullseye-fat

ARG CI_COMMIT_SHA
ARG CI_PIPELINE_ID
ENV CI_COMMIT_SHA=${CI_COMMIT_SHA}
ENV CI_PIPELINE_ID=${CI_PIPELINE_ID}
ENV TZ=Asia/Shanghai

# RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors-ssl.aliyuncs.com/g' /etc/apk/repositories \
#     && apk --no-cache add tzdata \
#     && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
#     && echo "Asia/Shanghai" > /etc/timezone 
RUN rm -rf /etc/nginx/conf.d
RUN mkdir -p /var/log/nginx/
#COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx.conf.template  /nginx.conf.template
COPY verify_access_token.lua /etc/nginx/verify_access_token.lua
COPY cert.crt /etc/nginx/certs/cert.pem
COPY private.key /etc/nginx/certs/cert.key

RUn mkdir -p /opt/eulixspace-web/space/ /opt/eulixspace-web/share/

ADD dist/ /opt/eulixspace-web/space/
ADD shareDist/ /opt/eulixspace-web/share/

COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]