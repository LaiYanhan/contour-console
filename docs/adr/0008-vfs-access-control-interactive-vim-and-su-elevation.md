# 0008: 采用 VFS 双维文件权限与密码挑战、三模态可编辑 Vim 及终端内 su 提权机制

我们决定在纯前端虚拟文件系统（VFS）中引入双维度访问控制（管理员 `LV.5 ROOT` 保护锁与交互式密码挑战锁），将内置 Vim 升级为支持 `NORMAL / INSERT / COMMAND` 的完整可写编辑器，并在终端中实施严格的管理员密码拦截与 `su` 原地提权指令。

## Context

1. 终端此前仅能查看文件，无法修改保存，限制了玩家在终端内改写配置或记录解密笔记的交互深度。
2. 虚拟文件系统的权限字符串此前仅作展示，缺乏真实的删除拦截与密码质询机制，无法支撑“关键系统文件仅管理员可删”及“机密文件需验证用户登录密码或专属口令”的解密设计。
3. 开屏登录输入 `admin` 但密码错误时，此前逻辑错误地将其降级为同名普通访客放行；且普通用户登录后缺乏 `su` 切换管理员的途径。
4. 全局 CRT 滤镜此前层级（`z-30`）低于顶栏与弹窗，且子面板缺少组件级显像管内阴影与内嵌扫描线。

## Consequences

- `VfsNode` 新增 `owner: 'root' | 'user'`、`protectedByRoot?: boolean`、`passwordLock?: 'user' | 'cipher'` 与 `cipherKey?: string` 属性，在 `rm`、`cat`、`vim` 与 `writeFile` 时执行严格权限校验。
- `BootTerminal` 增加 `passwordChallenge` 中间态：当操作受密码保护的文件或执行 `su` 提权时，终端就地挂起并掩码读取密码，验证通过后自动续行原操作。
- `VimModal` 支持 `i/a/o` 进入插入模式编辑多行文本、`dd` 删行、`:w` 写回 VFS、`:wq` 保存退出及未保存修改时的 `:q` 拦截提示（`E37`）。
- 全局 CRT 光栅与暗角移至 DOM 末尾并提升至 `z-[999]`，所有子面板（`HeaderHUD`、`ArcNavDeck`、`TelemetryPanel`、`TacticalSurface`、`BreachProtocol`）统一注入 `.crt-panel` 显像管内屏材质。
