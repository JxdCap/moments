# 个人朋友圈 SPA

一个浏览器端单页面个人朋友圈骨架，使用 React + Vite + TypeScript + CSS Modules + PocketBase。项目不包含公开用户注册、点赞、私信、后台大面板或 SSR。

## 运行

```bash
npm install
npm run dev
npm run build
```

默认未配置 PocketBase 时会读取本地 demo 数据，方便直接打开预览。接入 PocketBase 后创建 `.env.local`：

```bash
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

不要把 PocketBase superuser 凭证放进前端。网页作者登录使用 `owners` collection 的普通 auth record。

## PocketBase Collection 建议

`posts`

- `type`: select/string, values: `image`, `video`, `article`, `music`
- `content`: text
- `images`: file multiple 或 json
- `video`, `video_cover`, `article_cover`, `music_cover`: file/url
- `video_duration`: number
- `article_title`, `article_desc`, `article_url`, `article_site`: text/url
- `music_title`, `music_artist`, `music_url`, `music_source`: text/url
- `tags`: json/string array
- `is_pinned`: bool
- `pinned_at`, `published_at`, `updated_at`: date
- `source`: text

`comments`

- `post`: relation -> `posts`
- `name`: text
- `email`: email/text，不在公开界面展示
- `gravatar_hash`: text
- `website`: url，可空
- `content`: text
- `status`: select/string, values: `pending`, `approved`, `spam`
- `created`: PocketBase 默认字段

`owners`

- 使用 PocketBase auth collection
- `email`, `password`
- 可增加 `role`

## iOS 快捷指令对接点

iOS 快捷指令后续应直接写入 PocketBase 的 `posts` collection，或者接入一个受保护的外部接口后再由该接口写入 PocketBase。前端对应的读取与更新服务层在 `src/services/posts.ts`，字段映射在 `src/services/mappers.ts`。

建议快捷指令提交字段：`type`、`content`、媒体字段、`tags`、`published_at`、`source`。不要让快捷指令调用公开前端保存 superuser token。

## 当前边界

- 时间流排序：置顶优先，其次发布时间倒序
- 游客可评论，前端做长度、邮箱、网址和 30 秒频率校验
- 评论默认按 `pending` 提交给 PocketBase，demo 模式下为方便预览直接显示
- 作者登录后可以编辑正文/标签、删除、置顶或取消置顶
- 网页端不提供发布窗口
- 音乐仅有占位卡片，不包含复杂播放器
