import { motion, useReducedMotion } from 'motion/react'
import { BarChart3, Heart, Layers, TrendingUp } from 'lucide-react'

import type { Dataset } from '../data/types'
import { CapabilityCurve } from './charts/CapabilityCurve'
import { DownloadPulse } from './charts/DownloadPulse'
import { LikesBoard } from './charts/LikesBoard'
import { ScaleLadder } from './charts/ScaleLadder'
import { HudLabel, Panel, SectionHeading } from './ui/primitives'

function PanelBody({
  icon,
  kicker,
  title,
  children,
  span,
  delay = 0,
}: {
  icon: React.ReactNode
  kicker: string
  title: string
  children: React.ReactNode
  span?: boolean
  delay?: number
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
      className={span ? 'lg:col-span-2' : undefined}
    >
      <Panel className="flex h-full flex-col gap-5 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <HudLabel tone="fog">{kicker}</HudLabel>
            <h3 className="font-display text-lg tracking-wide text-snow">{title}</h3>
          </div>
          <span className="text-fog/45">{icon}</span>
        </div>
        <div className="flex flex-1 flex-col justify-center">{children}</div>
      </Panel>
    </motion.div>
  )
}

export function Analytics({ data }: { data: Dataset }) {
  const totalDownloads = data.releases.reduce((a, r) => a + r.downloads, 0)
  const totalLikes = data.releases.reduce((a, r) => a + r.likes, 0)

  return (
    <section id="data" className="relative mx-auto w-full max-w-[1400px] px-6 py-24 lg:px-10 lg:py-32">
      <SectionHeading
        index="03"
        kicker="TELEMETRY"
        title={
          <>
            把 {data.releases.length} 个节点
            <br className="hidden sm:block" />
            摊成四条曲线
          </>
        }
        lede={
          <>
            同一条时间轴换四种刻度来看：下载热度（近 30 天）、收藏口碑（累计点赞）、
            跨代能力（模型卡共同汇报的那一项测评）、以及参数量与激活量的裂口。
            全部数值来自 Hugging Face 官方 API 快照与官方模型卡，未做任何平滑或补值。
          </>
        }
      />

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        <PanelBody
          icon={<BarChart3 size={16} />}
          kicker="DOWNLOADS · 30D"
          title="下载脉冲"
          delay={0}
        >
          <DownloadPulse releases={data.releases} />
        </PanelBody>

        <PanelBody icon={<Heart size={16} />} kicker="LIKES · ALL TIME" title="收藏口碑榜" delay={0.08}>
          <LikesBoard releases={data.releases} />
        </PanelBody>

        <PanelBody
          icon={<TrendingUp size={16} />}
          kicker="CAPABILITY"
          title="跨代能力曲线"
          span
          delay={0.12}
        >
          <CapabilityCurve releases={data.releases} />
        </PanelBody>

        <PanelBody icon={<Layers size={16} />} kicker="SCALE" title="参数量阶梯" span delay={0.16}>
          <ScaleLadder releases={data.releases} />
        </PanelBody>
      </div>

      <div className="mt-10 grid gap-4 border-t border-edge/40 pt-6 text-[11px] leading-relaxed text-fog/70 sm:grid-cols-3">
        <p>
          <span className="text-snow">下载量口径</span>
          {` · Hugging Face 近 30 天滚动统计，快照于 ${data.snapshot}。`}
          刚发布的模型必然偏低，因此另设点赞榜作为长期热度参照。
        </p>
        <p>
          <span className="text-snow">合计</span>
          {` · 本页 ${data.releases.length} 个节点合计近 30 天下载 ${(totalDownloads / 1e6).toFixed(2)}M 次、累计点赞 ${(totalLikes / 1000).toFixed(1)}k 次；`}
          该组织公开仓库共 {data.repoCount} 个，其余为衍生权重与量化/部署产物。
        </p>
        <p>
          <span className="text-snow">存疑处</span>
          {` · 模型卡未标注的参数或体积在页面上一律显示为“未标注”，不做推测填充。`}
        </p>
      </div>
    </section>
  )
}
