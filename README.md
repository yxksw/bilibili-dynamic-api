# Bilibili Dynamic API

一个部署在 Cloudflare Worker 上的哔哩哔哩动态数据 API，将 B站动态数据转换为 JSON 格式返回。

## 功能特性

- 🚀 部署在 Cloudflare Worker，全球快速访问
- 📦 无需服务器，零成本部署
- 🌐 支持 CORS，可在浏览器直接调用
- 📄 返回标准 JSON 格式数据
- 🔍 支持多种动态相关接口

## API 端点

### 基础信息

访问根路径 `/` 可以查看所有可用的 API 端点。

### 1. 获取动态详情

```
GET /dynamic/detail?dynamic_id={动态ID}
```

**参数：**
- `dynamic_id` (必需): 动态ID

**示例：**
```
/dynamic/detail?dynamic_id=123456789
```

### 2. 获取用户动态列表

```
GET /user/dynamics?host_mid={用户ID}
```

**参数：**
- `host_mid` 或 `uid` (必需): 用户ID
- `page` (可选): 页码，默认 1
- `page_size` (可选): 每页数量，默认 20，最大 20
- `offset` (可选): 偏移值，用于分页

**示例：**
```
/user/dynamics?host_mid=208259&page=1&page_size=10
```

### 3. 获取用户空间动态 (旧版API)

```
GET /user/space?host_uid={用户ID}
```

**参数：**
- `host_uid` 或 `uid` (必需): 用户ID
- `offset_dynamic_id` (可选): 偏移动态ID，默认 0
- `need_top` (可选): 是否需要置顶动态，默认 1

**示例：**
```
/user/space?host_uid=208259&need_top=1
```

### 4. 获取动态点赞列表

```
GET /dynamic/likes?dynamic_id={动态ID}
```

**参数：**
- `dynamic_id` 或 `id` (必需): 动态ID
- `page` (可选): 页码，默认 1
- `page_size` (可选): 每页数量，默认 20，最大 50
- `offset` (可选): 偏移值

**示例：**
```
/dynamic/likes?dynamic_id=123456789&page=1
```

### 5. 获取动态转发列表

```
GET /dynamic/reposts?dynamic_id={动态ID}
```

**参数：**
- `dynamic_id` 或 `id` (必需): 动态ID
- `page` (可选): 页码，默认 1
- `page_size` (可选): 每页数量，默认 20，最大 20
- `offset` (可选): 偏移值

**示例：**
```
/dynamic/reposts?dynamic_id=123456789&page=1
```

### 6. 获取动态评论列表

```
GET /dynamic/comments?dynamic_id={动态ID}
```

**参数：**
- `dynamic_id` 或 `oid` (必需): 动态ID
- `type` (可选): 类型，默认 11 (动态)
- `page` (可选): 页码，默认 1
- `page_size` (可选): 每页数量，默认 20，最大 20
- `sort` (可选): 排序方式，0=按时间，2=按热度，默认 0

**示例：**
```
/dynamic/comments?dynamic_id=123456789&sort=2
```

### 7. 获取正在直播的用户列表

```
GET /live/users
```

**参数：**
- `page` (可选): 页码，默认 1
- `page_size` (可选): 每页数量，默认 20，最大 50

**示例：**
```
/live/users?page=1&page_size=20
```

### 8. 获取最新动态用户列表

```
GET /new/users
```

**参数：**
- `page` (可选): 页码，默认 1
- `page_size` (可选): 每页数量，默认 20，最大 50

**示例：**
```
/new/users?page=1&page_size=20
```

## 响应格式

所有 API 返回统一的 JSON 格式：

```json
{
  "success": true,
  "code": 0,
  "message": "0",
  "data": { ... }
}
```

## 部署方法

### 1. 克隆仓库

```bash
git clone https://github.com/yxksw/bilibili-dynamic-api.git
cd bilibili-dynamic-api
```

### 2. 安装依赖

```bash
npm install
```

### 3. 登录 Cloudflare

```bash
npx wrangler login
```

### 4. 本地开发

```bash
npm run dev
```

### 5. 部署到 Cloudflare

```bash
npm run deploy
```

## 技术参考

- [bilibili-api 文档](https://nemo2011.github.io/bilibili-api/#/modules/dynamic)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)

## 注意事项

1. 本 API 仅供学习研究使用
2. 请遵守 Bilibili 的相关使用条款
3. 建议添加适当的缓存策略以减少对 B站 API 的请求频率
4. 部分接口可能需要登录凭证才能访问完整数据

## License

MIT
