import { ArrowUpRight, Database, FileText } from 'lucide-react'

import type { Dataset } from '../data/types'
import { fmtDate } from '../lib/format'
import { HudLabel } from './ui/primitives'

export function Footer({ data }: { data: Dataset }) {
  return (
    <footer className="relative border-t border-edge/60 px-5 py-12 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col gap-3">
            <HudLabel>数据出处</HudLabel>
            <ul className="flex flex-col gap-2 text-xs leading-relaxed text-fog">
              <li className="flex items-start gap-2">
                <Database className="mt-0.5 size-3.5 shrink-0 text-cyan/70" strokeWidth={1.7} />
                <span>
                  Hugging Face 官方 API 快照（{fmtDate(data.snapshot)}）：{data.repoCount} 个仓库的
                  下载量、点赞数与创建时间。
                </span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="mt-0.5 size-3.5 shrink-0 text-cyan/70" strokeWidth={1.7} />
                <span>
                  参数、上下文、技术描述取自各代官方模型卡；分数取自模型卡与官方技术报告，未做换算或加权。
                </span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <HudLabel>口径说明</HudLabel>
            <ul className="flex flex-col gap-2 text-xs leading-relaxed text-fog">
              <li>下载量为 Hugging Face 统计的仓库下载次数，与真实部署量不等价，仅供参考。</li>
              <li>同一代模型的多分支仓库（Base / Chat / Distill）合并为一个发布节点。</li>
              <li>分数条按各自单位原样展示，跨代比较请注意评测口径差异。</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <HudLabel>跳转</HudLabel>
            <ul className="flex flex-col gap-2 text-xs">
              {[
                { href: `https://huggingface.co/${data.org}`, label: `huggingface.co/${data.org}` },
                { href: '#timeline', label: '回到时间轴' },
                { href: '#analytics', label: '下载与点赞分析' },
              ].map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target={l.href.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 text-fog transition hover:text-cyan"
                  >
                    {l.label}
                    <ArrowUpRight className="size-3" strokeWidth={1.8} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-edge/50 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono text-[10px] tracking-widest text-fog/60">
            MODEL CHRONICLE · BUILT WITH REACT + TAILWIND + MOTION
          </span>
          <span className="font-mono text-[10px] tracking-widest text-fog/50">
            非官方整理，与各模型厂商均无隶属关系
          </span>
        </div>
      </div>
    </footer>
  )
}
