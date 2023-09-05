#!/bin/bash
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

# vim:sw=4:ts=4:et

set -e

if [ "x$APP_RUN_NETWORK_MODE" == "xbridge" ] ; then
    GATEWAY_HOST="aospace-gateway.ao-space"
    FILEAPI_HOST="aospace-fileapi.ao-space"
    MEDIA_VOD_HOST="aospace-media-vod.ao-space"
    sed -i "s/#resolver/resolver/g" /nginx.conf.template
else
    GATEWAY_HOST="127.0.0.1"
    FILEAPI_HOST="127.0.0.1"
    MEDIA_VOD_HOST="127.0.0.1"
fi

sed -i "s#ENV_GATEWAY_HOST#$GATEWAY_HOST#g" /nginx.conf.template
sed -i "s#ENV_FILEAPI_HOST#$FILEAPI_HOST#g" /nginx.conf.template
sed -i "s#ENV_MEDIA_VOD_HOST#$MEDIA_VOD_HOST#g" /nginx.conf.template

ENV_NGINX_CONFIG=`cat /nginx.conf.template`

echo "$ENV_NGINX_CONFIG" > /usr/local/openresty/nginx/conf/nginx.conf

cat > /opt/eulixspace-web/space/config.json << EOF
{
  "webUrl": "${CONFIG_WEBURL:-https://ao.space}"
}
EOF

exec "/usr/bin/openresty" "-g" "daemon off;"
