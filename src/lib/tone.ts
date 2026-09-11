import type { Family, Tier } from '../data/types'

/** Colour language: one hue per model family, one weight per tier. */
export const familyTone: Record<Family, { text: string; bg: string; ring: string; dot: string; hex: string }> = {
  LLM: {
    text: 'text-cyan',
    bg: 'bg-cyan/12',
    ring: 'ring-cyan/40',
    dot: 'bg-cyan',
    hex: '#38e2ff',
  },
  Coder: {
    text: 'text-mint',
    bg: 'bg-mint/12',
    ring: 'ring-mint/40',
    dot: 'bg-mint',
    hex: '#2fe6a8',
  },
  Math: {
    text: 'text-violet',
    bg: 'bg-violet/14',
    ring: 'ring-violet/40',
    dot: 'bg-violet',
    hex: '#9270ff',
  },
  Prover: {
    text: 'text-violet',
    bg: 'bg-violet/14',
    ring: 'ring-violet/40',
    dot: 'bg-violet',
    hex: '#9270ff',
  },
  VL: {
    text: 'text-amber',
    bg: 'bg-amber/12',
    ring: 'ring-amber/40',
    dot: 'bg-amber',
    hex: '#ffb545',
  },
  Janus: {
    text: 'text-amber',
    bg: 'bg-amber/12',
    ring: 'ring-amber/40',
    dot: 'bg-amber',
    hex: '#ffb545',
  },
  OCR: {
    text: 'text-rose',
    bg: 'bg-rose/12',
    ring: 'ring-rose/40',
    dot: 'bg-rose',
    hex: '#ff5d73',
  },
  Reasoning: {
    text: 'text-rose',
    bg: 'bg-rose/12',
    ring: 'ring-rose/40',
    dot: 'bg-rose',
    hex: '#ff5d73',
  },
}

export const tierTone: Record<Tier, { label: string; size: number; glow: number }> = {
  flagship: { label: '旗舰', size: 22, glow: 1 },
  major: { label: '主要', size: 15, glow: 0.6 },
  minor: { label: '迭代', size: 10, glow: 0.32 },
}

export const familyLabel: Record<Family, string> = {
  LLM: '通用语言',
  Coder: '代码',
  Math: '数学',
  Prover: '定理证明',
  VL: '视觉语言',
  Janus: '统一多模态',
  OCR: '文档视觉',
  Reasoning: '推理',
}
