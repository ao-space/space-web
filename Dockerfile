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

FROM node:16.14.2 as builder

WORKDIR /work
COPY . .

RUN apt update && apt install dos2unix -y && apt clean all
RUN find . -type f -exec dos2unix {} \;

RUN npm install && npm run build && npm run buildsingle

FROM xfan1024/openeuler:23.03-light

RUN yum install openresty -y

ENV TZ=Asia/Shanghai

RUN rm -rf /etc/nginx/conf.d
RUN mkdir -p /var/log/nginx/
COPY --from=builder /work/nginx.conf.template  /nginx.conf.template
COPY --from=builder /work/verify_access_token.lua /etc/nginx/verify_access_token.lua
COPY --from=builder /work/cert.crt /etc/nginx/certs/cert.pem
COPY --from=builder /work/private.key /etc/nginx/certs/cert.key
RUN mkdir -p /opt/eulixspace-web/space/ /opt/eulixspace-web/share/
COPY --from=builder /work/dist /opt/eulixspace-web/space
COPY --from=builder /work/docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
