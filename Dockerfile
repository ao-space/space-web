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

COPY . .
RUN npm install && npm run build && npm run buildsingle

FROM openresty/openresty:1.21.4.1-4-bullseye-fat

ENV TZ=Asia/Shanghai

RUN rm -rf /etc/nginx/conf.d
RUN mkdir -p /var/log/nginx/
COPY --from=builder nginx.conf.template  /nginx.conf.template
COPY --from=builder verify_access_token.lua /etc/nginx/verify_access_token.lua
COPY --from=builder cert.crt /etc/nginx/certs/cert.pem
COPY --from=builder private.key /etc/nginx/certs/cert.key
RUN mkdir -p /opt/eulixspace-web/space/ /opt/eulixspace-web/share/
COPY --from=builder dist /opt/eulixspace-web/space
COPY --from=builder docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]