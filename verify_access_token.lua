-- Copyright (c) 2022 Institute of Software Chinese Academy of Sciences (ISCAS)
--
-- Licensed under the Apache License, Version 2.0 (the "License");
-- you may not use this file except in compliance with the License.
-- You may obtain a copy of the License at
--
--     http://www.apache.org/licenses/LICENSE-2.0
--
-- Unless required by applicable law or agreed to in writing, software
-- distributed under the License is distributed on an "AS IS" BASIS,
-- WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
-- See the License for the specific language governing permissions and
-- limitations under the License.


local redis = require "resty.redis"
local cjson = require "cjson"
local red = redis:new()

-- local host = ngx.var.http_host
local host = string.lower(ngx.var.http_host)

red:set_timeouts(1000, 1000, 1000) -- 1 sec

-- or connect to a unix domain socket file listened
-- by a redis server:
--     local ok, err = red:connect("unix:/path/to/redis.sock")

local ok, err = red:connect(ngx.var.redis_host, tonumber(ngx.var.redis_port))
if not ok then
    ngx.log(ngx.ERR, " host:", host, " ngx.var.redis_host:", ngx.var.redis_host, " ngx.var.redis_port:",
        ngx.var.redis_port, " msg:failed to connect redis. err:", err)

    ngx.status = ngx.HTTP_INTERNAL_SERVER_ERROR
    ngx.say("failed to connect(redis): ", err)

    ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
    return
end

local res, err = red:auth(ngx.var.redis_password)
if not res then
    ngx.log(ngx.ERR, " host:", host, " ngx.var.redis_host:", ngx.var.redis_host, " ngx.var.redis_port:",
        ngx.var.redis_port, " msg: failed to redis auth. err:", err)

    ngx.status = ngx.HTTP_INTERNAL_SERVER_ERROR
    ngx.say("failed to authenticate(redis): ", err)
    ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
    return
end

-- 查询 Token

local header = ngx.req.get_headers()

ngx.log(ngx.INFO, " token:", header.token, " uri:", ngx.var.uri, "  query:", ngx.var.query_string)

local res, err = red:get(string.format("TOKEN-%s", header.token))
if err ~= nil or res == ngx.null or not res then
    ngx.log(ngx.ERR, " redis get| res:", res, " token:", header.token, " err:", err)
    ngx.status = ngx.HTTP_UNAUTHORIZED
    ngx.say("not found token")
    ngx.exit(ngx.HTTP_UNAUTHORIZED)
    return
end

ngx.log(ngx.INFO, " userinfo:", res)

local jsonUserInfo = cjson.decode(res)
if jsonUserInfo == nil or jsonUserInfo.userId == nil then
    ngx.log(ngx.ERR, " failed to decode json: ", res, " token:", header.token)
    ngx.status = ngx.HTTP_INTERNAL_SERVER_ERROR
    ngx.say(" failed to decode json: ", res)
    ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
    return
end


if ngx.var.query_string == nil then
    ngx.req.set_uri_args("userId=" .. jsonUserInfo.userId)
else
    local args = ngx.req.get_uri_args()
    args.userId = jsonUserInfo.userId
    ngx.req.set_uri_args(args)
end


ngx.log(ngx.INFO, " query:", ngx.var.query_string)
