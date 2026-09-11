# 模型编年史 · Model Chronicle

把一家实验室的开源发布史摊在一条**横轴**上：发布日期、关键突破技术、官方测评分数、参数量、下载量与仓库体积，全部来自 Hugging Face 官方 API 快照与官方模型卡。

首卷：**DeepSeek（2023.10 → 2026.09，31 个节点）**。

在线预览：<https://weidows.github.io/model-chronicle/>

## 它长什么样

- **星图式滚动时间轴**：竖向滚动驱动横向平移，时间轴是一条发光光束，节点是带轨道的球；
  上方是发布卡片（按时间自动错行排布，永不重叠），下方是对数刻度的下载量光柱。
- **聚焦读数**：视口中心的播放头会自动锁定最近的版本，右下角 HUD 实时显示该版本的
  参数、上下文、下载量、突破点与标签，点“完整档案”展开全部评测分数。
- **技术突破轨**：24 项关键技术（MLA、GRPO、FP8、MTP、DSA、CED、CSA2、FP4 KV、DSpark…）
  以琥珀色菱形钉在同一根时间轴上，独立成区还有甘特条展示“从提出沿用至今”。
- **数据面板**：下载脉冲（对数柱 + 网格刻度）、收藏口碑榜、跨代能力曲线（模型卡共同汇报的
  同一项 benchmark）、参数量阶梯（总参数量实心、激活量中心缺口）。

动效全部走 `motion`（framer-motion 后继），并遵守 `prefers-reduced-motion`。

## 技术栈

| 层 | 选择 |
| --- | --- |
| 框架 | React 19 + TypeScript + Vite |
| 样式 | Tailwind CSS v4（`@theme` token + `@utility` HUD 原语，无 UI 框架皮肤） |
| 交互原语 | Radix UI（Dialog / Tabs / Slider / Tooltip，无样式，全部自定义外观） |
| 动效 | motion（滚动驱动平移、入场编排、路径绘线、数字滚动） |
| 图标 / 字体 | lucide-react；Orbitron + Inter Variable + JetBrains Mono（自托管） |

## 本地开发

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # 产物在 dist/
npm run preview      # 预览构建产物
```

## 数据从哪来

两份原始事实源，**没有一条编造或补值**：

1. `https://huggingface.co/api/models?author=deepseek-ai` 组织列表（105 个仓库）与逐仓库详情
   → `downloads`（**近 30 天滚动**）、`likes`（累计）、`createdAt`、`usedStorage`、`trendingScore`
2. 各仓库模型卡 README → 参数量、激活量、上下文、许可协议、官方评测分数

```bash
python scripts/fetch_raw.py     # 抓原始数据到 scripts/raw/（需要本机代理，见脚本注释）
python scripts/gen_data.py      # 合并人工策展层，生成 src/data/deepseek.ts
```

- `scripts/gen_data.py` 里有两块**人工策展**：`OVERLAY`（中文摘要、突破点、家族/分级、benchmark 取舍）
  与 `LABELS`（模型卡没写、只存在于论文或兄弟仓库的参数与许可）。数值一律从原始数据读，
  策展只负责措辞与归类。
- 模型卡未标注的字段一律 `null`，页面显示“未标注”，不做推测。
- 下载量口径：HF 报告的是**滚动 30 天**，刚发布的模型天然偏低，因此另设累计点赞榜做长期热度参照。

## 目录结构

```
src/
  data/deepseek.ts      生成的数据（勿手改）
  data/types.ts         Dataset / Release / Breakthrough 类型
  components/
    Starfield.tsx       分层星野 canvas（视差 + 闪烁）
    Hero.tsx            头部：口径说明 + KPI + 轨道图
    Timeline.tsx        时间轴引擎（滚动驱动平移、错行排布、聚焦读数、全览条、缩放）
    TechRibbon.tsx      技术突破轨（按泳道筛选 + 甘特条）
    Analytics.tsx       数据面板装配
    charts/             四个独立图表（对数柱 / 榜单 / 曲线 / 阶梯）
    ui/primitives.tsx   HUD 原语（面板、角标、标签、数字滚动）
scripts/                fetch + generate（可重跑）
```

## 部署

**GitHub Pages**（当前线上）：`.github/workflows/deploy.yml` 在 `main` 分支推送时
用 `VITE_BASE=/<repo>/` 构建并发布到 Pages。

**Cloudflare Pages**（可选）：项目根目录 `base` 走 `VITE_BASE` 环境变量，根域名部署直接用默认值：

```bash
npm run build && npx wrangler pages deploy dist --project-name model-chronicle
```

## 免责声明

非官方整理，与 DeepSeek 无隶属关系。数据快照时间见页面顶部与页脚（当前 2026-09-11）。
模型权重与评测口径的最终解释权归发布方所有。
