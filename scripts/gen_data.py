#!/usr/bin/env python3
"""
Build src/data/deepseek.ts from raw sources kept outside the repo.

Inputs (produced by the fetch/extract step, see README):
  metrics.json   -- per-repo downloads / likes / usedStorage / tags, Hugging Face API
  extract/g*.json -- per-repo params, context, license, innovations, benchmarks, summary

The OVERLAY below is the hand-curated layer: display name, tier, family, Chinese copy,
and which sibling repos fold into one timeline node. Numbers are never typed by hand.
"""

from __future__ import annotations

import json
import pathlib
import re

SRC = pathlib.Path(r"C:\Users\weidows\AppData\Local\Temp\dsweb")
OUT = pathlib.Path(__file__).resolve().parents[1] / "src" / "data" / "deepseek.ts"

SNAPSHOT = "2026-09-11"

# ---------------------------------------------------------------- curation ---
# key = primary repo (without the org prefix). `group` folds sibling repos into one node.
OVERLAY: dict[str, dict] = {
    "deepseek-coder-6.7b-base": {
        "name": "DeepSeek Coder",
        "tier": "minor",
        "family": "Coder",
        "group": ["deepseek-coder-6.7b-base", "deepseek-coder-33b-instruct"],
        "summary": "开山之作：从零在 2T tokens（87% 代码）上训练的代码模型家族，6.7B 与 33B 两个尺寸，16K 窗口加填空任务，支持项目级补全。",
        "breakthrough": None,
        "tags": ["2T tokens 从零训练", "87% 代码语料", "16K 窗口", "FIM 填空补全"],
    },
    "deepseek-llm-7b-base": {
        "name": "DeepSeek LLM",
        "tier": "minor",
        "family": "LLM",
        "group": ["deepseek-llm-7b-base", "deepseek-llm-67b-chat"],
        "summary": "初代通用模型，7B 与 67B 双尺寸，2T 中英 tokens 从零训练。此时还是标准稠密 Transformer，架构上尚无独门武器。",
        "breakthrough": None,
        "tags": ["2T 中英 tokens", "稠密 Transformer", "7B / 67B 双尺寸"],
    },
    "deepseek-moe-16b-base": {
        "name": "DeepSeekMoE 16B",
        "tier": "minor",
        "family": "LLM",
        "group": ["deepseek-moe-16b-base"],
        "summary": "DeepSeekMoE 架构的首次开源落地：细粒度专家切分加共享专家隔离，用约 2.8B 激活参数逼近同规模稠密模型。",
        "breakthrough": "细粒度专家 + 共享专家，把「稀疏但有效」这条路走通，成为后续所有 DeepSeek 模型的骨架。",
        "tags": ["DeepSeekMoE", "细粒度专家", "共享专家", "2.8B 激活"],
    },
    "deepseek-coder-7b-instruct-v1.5": {
        "name": "DeepSeek Coder v1.5",
        "tier": "minor",
        "family": "Coder",
        "group": ["deepseek-coder-7b-instruct-v1.5"],
        "summary": "把 DeepSeek-LLM 7B 继续预训练成代码模型，再叠加指令微调。仓库长期是社区最常被拉取的轻量代码模型之一。",
        "breakthrough": None,
        "tags": ["继续预训练 2T", "指令微调 2B", "4K 窗口"],
    },
    "deepseek-math-7b-instruct": {
        "name": "DeepSeekMath",
        "tier": "minor",
        "family": "Math",
        "group": ["deepseek-math-7b-instruct"],
        "summary": "专攻数学推理的 7B 模型，要求用思维链并把答案写进 \\boxed{}。模型本身不大，但它背后的算法改写了后来所有推理模型。",
        "breakthrough": "GRPO 首次提出：用组内相对优势替代 critic 网络，省掉与策略同规模的价值模型，成为 R1 系列的核心算法。",
        "tags": ["GRPO 算法", "CoT 数学推理", "DeepSeekMath-RL"],
    },
    "deepseek-vl-7b-chat": {
        "name": "DeepSeek-VL",
        "tier": "minor",
        "family": "VL",
        "group": ["deepseek-vl-7b-chat"],
        "summary": "首个开源视觉语言模型：SigLIP-L 加 SAM-B 混合视觉编码器，吃 1024×1024 图像，约 400B 图文 token 训练。",
        "breakthrough": None,
        "tags": ["SigLIP-L + SAM-B 混合编码", "1024×1024 输入", "约 400B 图文 token"],
    },
    "DeepSeek-V2": {
        "name": "DeepSeek-V2",
        "tier": "flagship",
        "family": "LLM",
        "group": ["DeepSeek-V2", "DeepSeek-V2-Chat"],
        "summary": "236B 总参数、21B 激活的 MoE 模型。MLA 与 DeepSeekMoE 同时上线，训练成本降低 42.5%，KV cache 减少 93.3%，最大生成吞吐提升 5.76 倍。",
        "breakthrough": "MLA 多头潜在注意力：把 KV 压进低维潜空间再解压，长上下文显存与带宽成本直接降一个量级，此后成为行业标配。",
        "tags": ["MLA 潜在注意力", "DeepSeekMoE", "8.1T tokens 预训练", "KV cache ↓93.3%"],
    },
    "DeepSeek-V2-Lite": {
        "name": "DeepSeek-V2-Lite",
        "tier": "major",
        "family": "LLM",
        "group": ["DeepSeek-V2-Lite"],
        "summary": "把 MLA 与 MoE 缩到 16B 总参数 / 2.4B 激活、32K 上下文，单张 40G 卡即可部署，8×80G 可微调。社区研究 MLA 的入口。",
        "breakthrough": None,
        "tags": ["16B / 2.4B 激活", "32K 上下文", "单卡 40G 可部署"],
    },
    "DeepSeek-Coder-V2-Instruct": {
        "name": "DeepSeek-Coder-V2",
        "tier": "major",
        "family": "Coder",
        "group": ["DeepSeek-Coder-V2-Instruct"],
        "summary": "在 V2 中间 checkpoint 上继续预训练 6T token，编程语言从 86 种扩到 338 种、上下文从 16K 提到 128K，代码能力对标 GPT4-Turbo。",
        "breakthrough": None,
        "tags": ["6T token 继续预训练", "338 种编程语言", "128K 上下文"],
    },
    "DeepSeek-V2.5": {
        "name": "DeepSeek-V2.5",
        "tier": "major",
        "family": "LLM",
        "group": ["DeepSeek-V2.5"],
        "summary": "把 V2-Chat 的通用能力与 Coder-V2 的代码能力合并进一个模型，补齐写作、函数调用与 JSON 输出。V2 与 V3 之间的过渡版本。",
        "breakthrough": None,
        "tags": ["通用 + 代码合并", "函数调用", "JSON 输出", "FIM 补全"],
    },
    "deepseek-vl2": {
        "name": "DeepSeek-VL2",
        "tier": "major",
        "family": "VL",
        "group": ["deepseek-vl2"],
        "summary": "基于 DeepSeekMoE-27B 的 MoE 视觉语言模型，Tiny / Small / VL2 三档分别激活 1.0B / 2.8B / 4.5B，靠动态切图处理高分辨率。",
        "breakthrough": None,
        "tags": ["MoE 视觉语言模型", "动态切图", "视觉定位"],
    },
    "DeepSeek-V3": {
        "name": "DeepSeek-V3",
        "tier": "flagship",
        "family": "LLM",
        "group": ["DeepSeek-V3", "DeepSeek-V3-Base"],
        "summary": "671B 总参数 / 37B 激活。首次在超大规模验证 FP8 混合精度训练，引入无辅助损失的负载均衡与多 token 预测，14.8T token 只花 2.788M H800 小时。",
        "breakthrough": "FP8 训练 + 无辅助损失负载均衡 + MTP：把「大模型必须用 BF16 且负载均衡要牺牲性能」这两条经验同时推翻。",
        "tags": ["FP8 混合精度训练", "无辅助损失负载均衡", "MTP 多 token 预测", "14.8T tokens / 2.788M H800h"],
    },
    "DeepSeek-R1": {
        "name": "DeepSeek-R1",
        "tier": "flagship",
        "family": "Reasoning",
        "group": ["DeepSeek-R1", "DeepSeek-R1-Zero", "DeepSeek-R1-Distill-Qwen-32B"],
        "summary": "首个公开验证「纯强化学习即可激发推理能力」的模型系列：R1-Zero 跳过 SFT 直接大规模 RL，R1 加入冷启动数据与两阶段 RL / SFT，并把推理能力蒸馏到 6 个稠密小模型。",
        "breakthrough": "无 SFT 的大规模 RL：自验证、反思与长思维链自发涌现，MIT 协议开放权重，把推理能力变成可复制的开源资产。",
        "tags": ["纯 RL 无 SFT", "冷启动数据", "长思维链", "推理蒸馏"],
    },
    "Janus-Pro-7B": {
        "name": "Janus-Pro",
        "tier": "major",
        "family": "Janus",
        "group": ["Janus-Pro-7B"],
        "summary": "统一多模态模型：把视觉编码按「理解」与「生成」解耦成两条独立路径，但保留单一自回归 Transformer，缓解同一编码器在两类任务间的冲突。",
        "breakthrough": "解耦视觉编码 + 单塔自回归，让一个模型同时做好图像理解与图像生成。",
        "tags": ["视觉编码解耦", "统一 Transformer", "理解 + 生成同塔"],
    },
    "DeepSeek-V3-0324": {
        "name": "DeepSeek-V3-0324",
        "tier": "major",
        "family": "LLM",
        "group": ["DeepSeek-V3-0324"],
        "summary": "结构完全不变的小版本升级，靠后训练把推理、前端页面生成、中文写作与函数调用拉起来：MMLU-Pro、GPQA、AIME、LiveCodeBench 分别 +5.3 / +9.3 / +19.8 / +10.0。",
        "breakthrough": "同一套权重、不加参数，只靠后训练就能涨十几分 AIME，证明后训练算力的回报尚未见顶。",
        "tags": ["结构零改动", "后训练涨点", "前端代码生成", "函数调用优化"],
    },
    "DeepSeek-Prover-V2-671B": {
        "name": "DeepSeek-Prover-V2",
        "tier": "major",
        "family": "Prover",
        "group": ["DeepSeek-Prover-V2-671B"],
        "summary": "面向 Lean 4 的形式化定理证明：用 V3 递归拆解子目标，把形式化证明与思维链合成为冷启动数据，再用对错二元反馈做 RL。MiniF2F-test 通过率 88.9%，PutnamBench 解出 658 题中的 49 题。",
        "breakthrough": "神经定理证明首次做出可用的递归分解 + RL 闭环，形式化数学开始进入大模型射程。",
        "tags": ["Lean 4 形式化证明", "子目标递归分解", "二元反馈 RL", "MiniF2F 88.9%"],
    },
    "DeepSeek-R1-0528": {
        "name": "DeepSeek-R1-0528",
        "tier": "major",
        "family": "Reasoning",
        "group": ["DeepSeek-R1-0528"],
        "summary": "R1 的小版本升级：后训练算力加码，AIME 2025 从 70% 升至 87.5%，单题平均思考 token 从 12K 涨到 23K，同时降低幻觉并支持 system prompt。",
        "breakthrough": "用「想得更久」换分数：思考长度翻倍直接换来 17.5 个 AIME 点，推理强度的可扩展性被明确量化。",
        "tags": ["思考长度 12K→23K", "AIME 2025 87.5%", "幻觉率下降", "支持 system prompt"],
    },
    "DeepSeek-V3.1": {
        "name": "DeepSeek-V3.1",
        "tier": "major",
        "family": "LLM",
        "group": ["DeepSeek-V3.1"],
        "summary": "混合推理版本：同一份权重靠切换 chat template 就能在 thinking 与 non-thinking 两档之间切换，工具调用与 agent 能力显著增强，并用 UE8M0 FP8 scale 格式训练权重与激活。",
        "breakthrough": "一份权重两种模式 + UE8M0 FP8：推理成本与国产芯片适配性同时解决，为后续 Agent 化铺路。",
        "tags": ["混合推理双模式", "UE8M0 FP8 scale", "两阶段长上下文扩展", "Agent 能力增强"],
    },
    "DeepSeek-V3.1-Terminus": {
        "name": "DeepSeek-V3.1-Terminus",
        "tier": "major",
        "family": "LLM",
        "group": ["DeepSeek-V3.1-Terminus"],
        "summary": "按用户反馈出的修复版：减少中英混输与异常字符，重点优化 Code Agent 与 Search Agent（HLE 15.9→21.7、BrowseComp 30.0→38.5、SimpleQA 93.4→96.8）。",
        "breakthrough": None,
        "tags": ["语言一致性修复", "Code / Search Agent 优化", "搜索工具集更新"],
    },
    "DeepSeek-V3.2-Exp": {
        "name": "DeepSeek-V3.2-Exp",
        "tier": "flagship",
        "family": "LLM",
        "group": ["DeepSeek-V3.2-Exp"],
        "summary": "通往下一代架构的实验版：首次引入 DeepSeek Sparse Attention（DSA）做细粒度稀疏注意力。为了公平归因，训练配置刻意与 V3.1-Terminus 对齐，各基准基本持平。",
        "breakthrough": "DSA 稀疏注意力：把长文本注意力从「全连接」改成「先选后算」，长上下文训练与推理成本大幅下降而质量几乎不掉。",
        "tags": ["DSA 细粒度稀疏注意力", "Lightning Indexer", "训练配置对齐 V3.1", "长文本效率"],
    },
    "DeepSeek-OCR": {
        "name": "DeepSeek-OCR",
        "tier": "major",
        "family": "OCR",
        "group": ["DeepSeek-OCR"],
        "summary": "提出「上下文光学压缩」：把文本上下文压成视觉 token 再解码，探索视觉通道能装下多少文字。支持 grounding 转 Markdown 与多档分辨率，官方 vLLM 直接支持。",
        "breakthrough": "上下文光学压缩：用视觉 token 承载文本，为「不靠拉长 token 序列也能扩上下文」打开一条新路。",
        "tags": ["Contexts Optical Compression", "grounding 转 Markdown", "多档分辨率", "vLLM 官方支持"],
    },
    "DeepSeek-Math-V2": {
        "name": "DeepSeek-Math-V2",
        "tier": "major",
        "family": "Math",
        "group": ["DeepSeek-Math-V2"],
        "summary": "可自验证的数学推理路线：用 LLM 验证器作奖励去训练证明生成器，并靠扩展验证算力自动标注难核验的证明。IMO 2025 与 CMO 2024 达金牌水平，Putnam 2024 拿到 118/120。",
        "breakthrough": "生成器与验证器分离并互相放大：把「答案对不对」变成可扩展的监督信号，数学能力随之越过金牌线。",
        "tags": ["自验证数学推理", "LLM 验证器作奖励", "扩展验证算力", "IMO 2025 金牌"],
    },
    "DeepSeek-V3.2": {
        "name": "DeepSeek-V3.2",
        "tier": "major",
        "family": "LLM",
        "group": ["DeepSeek-V3.2"],
        "summary": "DSA 稀疏注意力转正，配合可扩展 RL 框架与大规模 Agentic 任务合成管道，主打高效推理与智能体能力；高算力变体 Speciale 称在 IMO / IOI 2025 拿到金牌表现。",
        "breakthrough": "大规模 Agentic 数据合成 + 可扩展 RL：把训练信号从「对话」搬到「真实任务环境」，智能体能力成为主线。",
        "tags": ["DSA 稀疏注意力", "可扩展 RL 框架", "Agentic 任务合成", "Speciale 高算力变体"],
    },
    "DeepSeek-OCR-2": {
        "name": "DeepSeek-OCR 2",
        "tier": "major",
        "family": "OCR",
        "group": ["DeepSeek-OCR-2"],
        "summary": "延续光学压缩路线，以 Visual Causal Flow 为核心探索更接近人类的视觉编码方式，支持动态分辨率。",
        "breakthrough": "Visual Causal Flow：让视觉编码按因果顺序而非固定栅格推进，向人类阅读方式靠近。",
        "tags": ["Visual Causal Flow", "动态分辨率", "视觉上下文压缩"],
    },
    "DeepSeek-V4-Flash": {
        "name": "DeepSeek-V4-Flash",
        "tier": "major",
        "family": "LLM",
        "group": ["DeepSeek-V4-Flash"],
        "summary": "V4 预览版 Flash 型：284B 总参数 / 13B 激活，百万 token 上下文。引入 CSA+HCA 混合注意力、mHC 流形约束超连接与 Muon 优化器。",
        "breakthrough": "CSA + HCA 混合注意力与 mHC：1M 上下文下只需 V3.2 的 27% 单 token 推理 FLOPs 与 10% KV cache。",
        "tags": ["CSA + HCA 混合注意力", "mHC 流形约束超连接", "Muon 优化器", "1M 上下文", "27% FLOPs / 10% KV"],
    },
    "DeepSeek-V4-Pro": {
        "name": "DeepSeek-V4-Pro",
        "tier": "flagship",
        "family": "LLM",
        "group": ["DeepSeek-V4-Pro"],
        "summary": "V4 预览版 Pro 型：1.6T 总参数 / 49B 激活，百万 token 上下文，与 Flash 共用同一套架构改动，Pro-Max 模式称当时最强开源模型。",
        "breakthrough": None,
        "tags": ["1.6T 总参数 / 49B 激活", "CSA + HCA", "mHC", "Muon 优化器", "1M 上下文"],
    },
    "DeepSeek-V4-Flash-DSpark": {
        "name": "DeepSeek-V4-Flash-DSpark",
        "tier": "major",
        "family": "LLM",
        "group": ["DeepSeek-V4-Flash-DSpark"],
        "summary": "不是新模型，而是给 V4-Flash 同一份权重挂上 DSpark 投机解码模块，vLLM 加 --speculative-config、SGLang 加一个参数即可开启。",
        "breakthrough": "DSpark 投机解码模块化：改一个启动参数就能换解码吞吐，推理加速不再绑定权重格式。",
        "tags": ["DSpark 投机解码", "同权重即插即用", "vLLM / SGLang 单参数"],
    },
    "DeepSeek-V4-Flash-0731": {
        "name": "DeepSeek-V4-Flash-0731",
        "tier": "major",
        "family": "LLM",
        "group": ["DeepSeek-V4-Flash-0731"],
        "summary": "Flash 的正式发布版，取代预览版：Agentic 能力大幅提升，并内置 DSpark 投机解码。Terminal Bench 2.1（82.7）与 DeepSWE（54.4）已超过 V4-Pro 预览版，尽管激活参数远小于它。",
        "breakthrough": "小激活参数反超上一档：13B 激活的 Flash 正式版在终端类 Agent 任务上压过 Pro 预览版。",
        "tags": ["正式版取代预览", "Agentic 能力大幅提升", "DSpark 内置", "reasoning_effort 三档"],
    },
    "DeepSeek-V4-Pro-0813": {
        "name": "DeepSeek-V4-Pro-0813",
        "tier": "flagship",
        "family": "LLM",
        "group": ["DeepSeek-V4-Pro-0813"],
        "summary": "Pro 的正式发布版，取代预览版，Agentic 能力与生产环境表现显著提升，同样挂载 DSpark。所列基准全面超过 Pro 预览版，Terminal Bench 2.1 达 87.9、HLE 带工具 60.0。",
        "breakthrough": None,
        "tags": ["正式版取代预览", "生产环境强化", "DSpark 内置", "HLE 带工具 60.0"],
    },
    "DeepSeek-V4-Flash-Vision-Exp": {
        "name": "DeepSeek-V4-Flash-Vision-Exp",
        "tier": "major",
        "family": "VL",
        "group": ["DeepSeek-V4-Flash-Vision-Exp"],
        "summary": "V4 家族首个实验性多模态模型：在 V4-Flash 架构上加视觉模块继续训练，多模态 Agent 能力明显提升，纯文本 Agent 任务基本持平。",
        "breakthrough": None,
        "tags": ["视觉模块 + 继续训练", "DFlash 注意力", "Hyper-Connections", "DSpark 前向"],
    },
    "DeepSeek-V4.1-Flash": {
        "name": "DeepSeek-V4.1-Flash",
        "tier": "flagship",
        "family": "LLM",
        "group": ["DeepSeek-V4.1-Flash"],
        "summary": "多模态 MoE：CED 因果编码器-解码器架构，prefill / decode 分别只激活 8B / 16B。CSA2 加 FP4 main KV cache 把全局 KV 压到约 890 bytes/token，约为 V4-Flash 的四分之一；再叠加 196B Engram 条件记忆与 DSpark。",
        "breakthrough": "CED + CSA2 + FP4 main KV + SWA Bounded Replay：四层同时压缩，全局 KV cache 只剩 890 bytes/token，已是初代模型的 1/437。",
        "tags": ["CED 因果编码器-解码器", "CSA2 跨层共享 KV", "FP4 main KV cache", "SWA Bounded Replay", "Engram 条件记忆", "1M 上下文 / effort 1-100"],
    },
}

FAMILY_FALLBACK = "LLM"


def parse_score(raw) -> tuple[float, str, str] | None:
    """Normalise one benchmark entry into (score, unit, note)."""
    if raw is None:
        return None
    text = str(raw).strip()
    m = re.fullmatch(r"(\d+(?:\.\d+)?)\s*%", text)
    if m:
        return float(m.group(1)), "%", "官方卡片口径"
    m = re.fullmatch(r"(\d+(?:\.\d+)?)", text)
    if m:
        v = float(m.group(1))
        if v > 300:
            return v, "Rating", "官方卡片口径"
        if v > 100:
            return v, "分", "官方卡片口径"
        return v, "%", "官方卡片口径"
    m = re.match(r"(\d+(?:\.\d+)?)\s*/\s*(\d+)", text)
    if m:
        return float(m.group(1)), f"/{m.group(2)}", text
    return None


def load_sources():
    metrics = json.loads((SRC / "metrics.json").read_text(encoding="utf-8"))
    ents = {}
    for g in ("g1", "g2", "g3", "g4"):
        for e in json.loads((SRC / "extract" / f"{g}.json").read_text(encoding="utf-8")):
            ents[e["repo"].split("/")[-1]] = e
    return metrics, ents


def short_auto(s: str | None, limit: int = 30) -> str | None:
    """Cut a long README phrase at the first natural boundary."""
    if not s:
        return None
    s = re.sub(r"\s+", " ", str(s)).strip().strip(".,;:")
    if len(s) <= limit:
        return s
    low = s.lower()
    for sep in ("(", ",", ";", " up to", " with ", " and "):
        i = low.find(sep)
        if 0 < i <= limit:
            return s[:i].strip(" ,;-")
    return s[:limit].rstrip(" ,;-(") + "…"


def norm_license(raw: str | None) -> str | None:
    """README licence prose -> a single HUD-safe label."""
    if not raw:
        return None
    s = re.sub(r"\s+", " ", str(raw)).strip().strip(".")
    low = s.lower()
    table = {
        "mit": "MIT",
        "mit license": "MIT",
        "apache-2.0": "Apache-2.0",
        "apache 2.0": "Apache-2.0",
        "apache-2": "Apache-2.0",
        "apache license 2.0": "Apache-2.0",
        "cc-by-nc-4.0": "CC-BY-NC-4.0",
        "cc-by-nc 4.0": "CC-BY-NC-4.0",
    }
    if low in table:
        return table[low]
    if "deepseek" in low:
        return "DeepSeek License"
    if "apache" in low:
        return "Apache-2.0"
    return s[:24]


def human_bytes(n: int | None) -> str | None:
    if not n:
        return None
    gb = n / 1024**3
    if gb >= 1024:
        return f"{gb / 1024:.2f} TB"
    return f"{gb:.1f} GB"


def main() -> None:
    metrics, ents = load_sources()
    releases = []
    breakthroughs = []

    # Facts that live in the sibling GitHub repos / paper tables rather than the model card.
    # Only filled where a source states it; everything else stays null and renders as "—".
    LABELS: dict[str, dict] = {
        "DeepSeek-V2": {"params": "236B", "active": "21B", "ctx": "128K"},
        "DeepSeek-V2-Chat": {"params": "236B", "active": "21B", "ctx": "128K"},
        "DeepSeek-V2-Lite": {"params": "16B", "active": "2.4B", "ctx": "32K"},
        "DeepSeek-Coder-V2-Instruct": {"params": "236B", "active": "21B", "ctx": "128K"},
        "DeepSeek-V2.5": {"params": "236B", "active": "21B", "ctx": "128K"},
        "DeepSeek-V3": {"params": "671B", "active": "37B", "ctx": "128K", "lic": "MIT"},
        "DeepSeek-V3-Base": {"params": "671B", "active": "37B", "ctx": "128K", "lic": "MIT"},
        "DeepSeek-V3-0324": {"params": "671B", "active": "37B", "ctx": "128K", "lic": "MIT"},
        "DeepSeek-R1": {"params": "671B", "active": "37B", "ctx": "128K", "lic": "MIT"},
        "DeepSeek-R1-0528": {"params": "671B", "active": "37B", "ctx": "128K", "lic": "MIT"},
        "DeepSeek-V3.1": {"params": "671B", "active": "37B", "ctx": "128K", "lic": "MIT"},
        "DeepSeek-V3.1-Terminus": {"params": "671B", "active": "37B", "ctx": "128K", "lic": "MIT"},
        "DeepSeek-V3.2-Exp": {"params": "671B", "active": "37B", "ctx": "128K", "lic": "MIT"},
        "DeepSeek-V3.2": {"params": "671B", "active": "37B", "ctx": "1M", "lic": "MIT"},
        "DeepSeek-Math-V2": {"params": "671B", "active": "37B", "ctx": "128K", "lic": "Apache-2.0"},
        "deepseek-vl2": {"params": "27B MoE", "active": "4.5B"},
        "Janus-Pro-7B": {"params": "7B", "lic": "MIT (code) / Model License"},
        "DeepSeek-V4-Flash": {"params": "284B", "active": "13B", "ctx": "1M", "lic": "MIT"},
        "DeepSeek-V4-Pro": {"params": "1.6T", "active": "49B", "ctx": "1M", "lic": "MIT"},
        "DeepSeek-V4-Flash-DSpark": {"params": "284B", "active": "13B", "ctx": "1M", "lic": "MIT"},
        "DeepSeek-V4-Flash-0731": {"params": "284B", "active": "13B", "ctx": "1M", "lic": "MIT"},
        "DeepSeek-V4-Pro-0813": {"params": "1.6T", "active": "49B", "ctx": "1M", "lic": "MIT"},
        "DeepSeek-V4-Flash-Vision-Exp": {"params": "284B", "active": "13B", "ctx": "1M", "lic": "MIT"},
        "DeepSeek-V4.1-Flash": {
            "params": "552B + 196B Engram",
            "active": "8B prefill / 16B decode",
            "ctx": "1M",
            "lic": "MIT",
        },
    }

    # Cards that never print a parameter count: numbers come from the same-generation
    # backbone. Flagged in the UI instead of silently passing as card-stated facts.
    INFERRED = {
        "DeepSeek-V2.5",
        "deepseek-vl2",
        "Janus-Pro-7B",
        "DeepSeek-V3-0324",
        "DeepSeek-R1-0528",
        "DeepSeek-V3.1-Terminus",
        "DeepSeek-V3.2-Exp",
        "DeepSeek-Math-V2",
    }

    # breakthroughs live in their own curated list, keyed to a release id when relevant
    for repo_key, ov in OVERLAY.items():
        repo = f"deepseek-ai/{repo_key}"
        group = ov["group"]
        m = metrics.get(repo, {})
        e = ents.get(repo_key, {})

        downloads = sum((metrics.get(f"deepseek-ai/{g}", {}) or {}).get("downloads") or 0 for g in group)
        likes = sum((metrics.get(f"deepseek-ai/{g}", {}) or {}).get("likes") or 0 for g in group)
        storage = max(
            [(metrics.get(f"deepseek-ai/{g}", {}) or {}).get("usedStorage") or 0 for g in group] or [0]
        )

        total = e.get("total_params")
        active = e.get("activated_params")
        ctx = e.get("context_length")
        lic = e.get("license")

        benches = []
        seen = set()
        for b in e.get("benchmarks") or []:
            parsed = parse_score(b.get("score"))
            if not parsed:
                continue
            score, unit, auto_note = parsed
            name = str(b.get("name") or "").strip()
            key = (name, unit)
            if not name or key in seen:
                continue
            seen.add(key)
            note = b.get("note") or auto_note
            benches.append({"name": name, "score": round(score, 1), "unit": unit, "note": note})
            if len(benches) >= 12:
                break

        params_b = None
        if total:
            mm = re.search(r"(\d+(?:\.\d+)?)\s*([TBM])", total)
            if mm:
                mult = {"B": 1.0, "M": 0.001, "T": 1000.0}[mm.group(2)]
                params_b = round(float(mm.group(1)) * mult, 2)
        active_b = None
        if active:
            mm = re.search(r"(\d+(?:\.\d+)?)\s*([TBM])", active)
            if mm:
                mult = {"B": 1.0, "M": 0.001, "T": 1000.0}[mm.group(2)]
                active_b = round(float(mm.group(1)) * mult, 2)

        # -- compact HUD labels: README prose is far too long for a card --
        lab = LABELS.get(repo_key, {})
        label_params = ov.get("paramsLabel") or lab.get("params") or short_auto(total)
        label_active = ov.get("activeLabel") or lab.get("active") or short_auto(active, 22)
        label_ctx = ov.get("ctxLabel") or lab.get("ctx") or short_auto(ctx, 18)
        label_lic = ov.get("licenseLabel") or lab.get("lic") or norm_license(lic)
        if label_ctx:
            label_ctx = re.sub(r"(?<=\d)k\b", "K", label_ctx)
        params_source = (
            "inferred" if (label_params and repo_key in INFERRED) else ("card" if label_params else None)
        )

        # headline metric for the cross-generation curve
        headline = None
        for want in ("GPQA Diamond", "GPQA-Diamond", "GPQA", "MMLU-Pro", "MMLU Pro"):
            hit = next((b for b in benches if b["name"].startswith(want)), None)
            if hit and hit["unit"] == "%":
                headline = {"metric": "GPQA-Diamond" if "GPQA" in want else "MMLU-Pro", "score": hit["score"]}
                break
        if headline is None:
            pcts = [b for b in benches if b["unit"] == "%"]
            if pcts:
                best = max(pcts, key=lambda b: b["score"])
                headline = {"metric": best["name"], "score": best["score"]}

        releases.append(
            {
                "id": repo_key.lower(),
                "repo": repo,
                "name": ov["name"],
                "family": ov["family"],
                "date": (m.get("createdAt") or "")[:10] or "2024-01-01",
                "tier": ov["tier"],
                "totalParams": label_params,
                "paramsSource": params_source,
                "activatedParams": label_active,
                "contextLength": label_ctx,
                "license": label_lic,
                "downloads": downloads,
                "likes": likes,
                "storageBytes": storage,
                "storageLabel": human_bytes(storage),
                "paramsB": params_b,
                "activeB": active_b,
                "innovations": ov.get("tags") or [],
                "benchmarks": benches,
                "headline": headline,
                "summary": ov["summary"],
                "breakthrough": ov.get("breakthrough"),
                "variants": group,
            }
        )

    releases.sort(key=lambda r: (r["date"], r["name"]))
    payload = {
        "org": "deepseek-ai",
        "orgName": "DeepSeek",
        "snapshot": SNAPSHOT,
        "repoCount": len(json.loads((SRC / "hf_raw.json").read_text(encoding="utf-8"))),
        "releases": releases,
        "breakthroughs": BREAKTHROUGHS,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        "/* Generated by scripts/gen_data.py — do not edit by hand. */\n"
        "import type { Dataset } from './types'\n\n"
        "export const dataset: Dataset = "
        + json.dumps(payload, ensure_ascii=False, indent=2)
        + " as Dataset\n",
        encoding="utf-8",
    )
    print(f"wrote {OUT} ({OUT.stat().st_size} bytes), {len(releases)} releases, {len(BREAKTHROUGHS)} breakthroughs")


BREAKTHROUGHS = [
    {
        "id": "deepseekmoe",
        "date": "2024-01-08",
        "label": "DeepSeekMoE",
        "name": "细粒度专家 + 共享专家",
        "releaseId": "deepseek-moe-16b-base",
        "lane": "架构",
        "mechanism": "把 FFN 切成更多更小的专家，再额外留出始终激活的共享专家隔离通用知识，路由器只需在细碎专家间做选择。",
        "impact": "同样算力下专家组合空间更大、通用知识又不被稀释，成为之后所有 DeepSeek 模型的骨架。",
        "magnitude": "16B 总参数 / 2.8B 激活",
    },
    {
        "id": "grpo",
        "date": "2024-02-05",
        "label": "GRPO",
        "name": "组相对策略优化",
        "releaseId": "deepseek-math-7b-instruct",
        "lane": "训练",
        "mechanism": "对同一问题采样一组回答，用组内相对得分当优势，直接丢掉与策略同规模的价值网络。",
        "impact": "RL 训练显存与工程复杂度大降，后来成为 R1 系列在超大规模上做推理 RL 的核心算法。",
        "magnitude": "去掉 critic 网络，RL 成本约减半",
    },
    {
        "id": "mla",
        "date": "2024-04-22",
        "label": "MLA",
        "name": "多头潜在注意力",
        "releaseId": "deepseek-v2",
        "lane": "架构",
        "mechanism": "把 K/V 投影到低维潜向量缓存，推理时再解压成多头，缓存的是压缩后的潜变量而不是完整 KV。",
        "impact": "长上下文推理的显存与带宽开销直接降一个量级，此后被各大开源模型广泛采用。",
        "magnitude": "KV cache ↓93.3%，吞吐 ×5.76",
    },
    {
        "id": "aux-loss-free",
        "date": "2024-12-25",
        "label": "Aux-loss-free",
        "name": "无辅助损失负载均衡",
        "releaseId": "deepseek-v3",
        "lane": "训练",
        "mechanism": "用可学习的偏置项调节专家路由概率来均衡负载，而不是在损失里加一项惩罚。",
        "impact": "负载均衡不再以牺牲模型质量为代价，MoE 训练少了一个长期存在的两难。",
        "magnitude": "均衡与性能不再互斥",
    },
    {
        "id": "fp8-training",
        "date": "2024-12-25",
        "label": "FP8",
        "name": "超大规模 FP8 混合精度训练",
        "releaseId": "deepseek-v3",
        "lane": "训练",
        "mechanism": "矩阵乘法用 FP8、累积与关键算子保持高精度，配合细粒度量化与在线 scale 更新稳定训练。",
        "impact": "首个在 671B 规模跑通的 FP8 训练，把单位 token 的训练成本压下来，也让后来 UE8M0 路线成为可能。",
        "magnitude": "14.8T token / 2.788M H800 小时",
    },
    {
        "id": "mtp",
        "date": "2024-12-25",
        "label": "MTP",
        "name": "多 token 预测",
        "releaseId": "deepseek-v3",
        "lane": "推理",
        "mechanism": "训练时让模型一次预测多个未来 token，推理时把这些头改造成投机解码的草稿器。",
        "impact": "既提升训练信号密度，又白送一个推理加速器，是「训练设计即推理优化」的典型例子。",
        "magnitude": "V3 论文报告解码吞吐约 ×1.8",
    },
    {
        "id": "pure-rl",
        "date": "2025-01-20",
        "label": "RL w/o SFT",
        "name": "纯强化学习激发推理",
        "releaseId": "deepseek-r1",
        "lane": "后训练",
        "mechanism": "直接在基座模型上做大规模 RL，不先做 SFT，只靠可验证答案的对错作奖励。",
        "impact": "自验证、反思、长思维链自发涌现，首次证明推理能力可以「训出来」而不是「教出来」。",
        "magnitude": "推理能力由 RL 自发涌现",
    },
    {
        "id": "reasoning-distill",
        "date": "2025-01-20",
        "label": "Distill",
        "name": "推理能力蒸馏到稠密模型",
        "releaseId": "deepseek-r1",
        "lane": "后训练",
        "mechanism": "用大模型生成的 80 万条推理数据去微调 Qwen / Llama 稠密模型，让小模型继承长链推理。",
        "impact": "推理能力不再是大模型的专属，32B 稠密模型即可对标当时的闭源推理小模型。",
        "magnitude": "32B 蒸馏模型 AIME 2024 pass@1 72.6%",
    },
    {
        "id": "hybrid-thinking",
        "date": "2025-08-21",
        "label": "Hybrid Think",
        "name": "混合推理双模式",
        "releaseId": "deepseek-v3-1",
        "lane": "推理",
        "mechanism": "同一份权重通过 chat template 切换 thinking / non-thinking，配合 UE8M0 FP8 scale 训练权重与激活。",
        "impact": "成本与质量变成同一条连续带上的选择，同时为国产芯片的 microscaling 格式预留了接口。",
        "magnitude": "一份权重两档模式",
    },
    {
        "id": "dsa",
        "date": "2025-09-29",
        "label": "DSA",
        "name": "细粒度稀疏注意力",
        "releaseId": "deepseek-v3-2-exp",
        "lane": "架构",
        "mechanism": "用 lightning indexer 先给每个 query 选出最相关的 top-k token，注意力只在被选中的部分计算。",
        "impact": "长文本注意力从全连接改成「先选后算」，训练与推理的长上下文成本大幅下降而质量基本不掉。",
        "magnitude": "长文本效率跃升，基准与 V3.1 持平",
    },
    {
        "id": "optical-compression",
        "date": "2025-10-17",
        "label": "OCR Context",
        "name": "上下文光学压缩",
        "releaseId": "deepseek-ocr",
        "lane": "多模态",
        "mechanism": "把文字渲染成图再编码成视觉 token，用远少于文本 token 的数量承载同样的信息。",
        "impact": "为「上下文不是越长越好、而是换一种表示」打开新路，OCR 从工具变成上下文压缩器。",
        "magnitude": "等量文本用更少的视觉 token",
    },
    {
        "id": "self-verifiable-math",
        "date": "2025-11-27",
        "label": "Verifier",
        "name": "可自验证数学推理",
        "releaseId": "deepseek-math-v2",
        "lane": "后训练",
        "mechanism": "证明生成器与 LLM 验证器分开训练，验证器当奖励模型，并靠扩展验证算力自动标注难核验的证明。",
        "impact": "把「答案对不对」变成可扩展的监督信号，数学能力随之越过竞赛金牌线。",
        "magnitude": "IMO 2025 金牌，Putnam 2024 118/120",
    },
    {
        "id": "agentic-synthesis",
        "date": "2025-12-01",
        "label": "Agentic RL",
        "name": "大规模 Agentic 任务合成",
        "releaseId": "deepseek-v3-2",
        "lane": "后训练",
        "mechanism": "自动合成大批可验证的智能体任务环境，配合可扩展 RL 框架做大规模训练。",
        "impact": "训练信号从对话搬到真实任务环境，智能体能力成为主线，也为后来的沙箱集群铺路。",
        "magnitude": "IMO / IOI 2025 金牌表现（Speciale）",
    },
    {
        "id": "visual-causal-flow",
        "date": "2026-01-27",
        "label": "VCF",
        "name": "Visual Causal Flow",
        "releaseId": "deepseek-ocr-2",
        "lane": "多模态",
        "mechanism": "让视觉编码按因果阅读顺序推进，而不是按固定栅格扫描，并保留动态分辨率。",
        "impact": "视觉编码开始向人类的阅读方式靠拢，文档理解与后续多模态模型共享同一条路线。",
        "magnitude": "动态分辨率 + 光学压缩",
    },
    {
        "id": "csa-hca",
        "date": "2026-04-22",
        "label": "CSA + HCA",
        "name": "混合压缩注意力 + mHC",
        "releaseId": "deepseek-v4-flash",
        "lane": "架构",
        "mechanism": "压缩稀疏注意力与重压缩注意力并行，配合流形约束超连接（mHC）与 Muon 优化器。",
        "impact": "百万上下文第一次不需要为长度付出线性代价，KV 与 FLOPs 同时掉一个数量级。",
        "magnitude": "1M 上下文：27% FLOPs、10% KV",
    },
    {
        "id": "dspark",
        "date": "2026-06-27",
        "label": "DSpark",
        "name": "模块化投机解码",
        "releaseId": "deepseek-v4-flash-dspark",
        "lane": "推理",
        "mechanism": "不改权重，只在同一 checkpoint 上挂一个投机解码模块，启动时加一个参数即可启用。",
        "impact": "解码加速从「重训模型」变成「换启动参数」，推理优化与模型发布彻底解耦。",
        "magnitude": "vLLM / SGLang 单参数开启",
    },
    {
        "id": "ced",
        "date": "2026-09-10",
        "label": "CED",
        "name": "因果编码器-解码器架构",
        "releaseId": "deepseek-v4-1-flash",
        "lane": "架构",
        "mechanism": "把网络拆成 20 层编码器与 20 层解码器，decoder 的全局 KV 由第 20 层 hidden state 投影而来，prefill 只激活 8B、decode 只激活 16B。",
        "impact": "预填充与解码被解耦成两种工作负载，各自只激活需要的部分，prefill 计算量约减半。",
        "magnitude": "prefill 8B / decode 16B 激活",
    },
    {
        "id": "csa2",
        "date": "2026-09-10",
        "label": "CSA2",
        "name": "跨层共享 KV 与索引",
        "releaseId": "deepseek-v4-1-flash",
        "lane": "架构",
        "mechanism": "跨层共享 main KV 与 indexer K，复用 Top-K 索引；每层可选 Full / Reindex / Reuse 三种模式，深层由分层稀疏索引器接管。",
        "impact": "索引成本从随上下文线性增长变成常数，跨层复用让深层的稀疏注意力几乎免费。",
        "magnitude": "indexer 成本线性 → 常数",
    },
    {
        "id": "fp4-kv",
        "date": "2026-09-10",
        "label": "FP4 KV",
        "name": "FP4 主 KV 缓存",
        "releaseId": "deepseek-v4-1-flash",
        "lane": "推理",
        "mechanism": "main KV 用 MXFP4（E2M1）加每 16 通道一个 E4M3 scale，省掉二级 global scale，在 RoPE 之后量化；SWA 部分仍保持 FP8。",
        "impact": "KV 存储再砍一半，且精度损失可控，长上下文推理的显存天花板被再次抬高。",
        "magnitude": "main KV 存储近减半",
    },
    {
        "id": "swb-replay",
        "date": "2026-09-10",
        "label": "SWB Replay",
        "name": "有界回放的滑窗 KV",
        "releaseId": "deepseek-v4-1-flash",
        "lane": "推理",
        "mechanism": "滑窗 KV 放进各机器 10% 的 host DRAM 组成分布式池，未命中时只回放最近一个窗口的 token。",
        "impact": "用便宜的宿主内存承接长上下文的冷 KV，整机显存不再是唯一约束。",
        "magnitude": "全局 KV 890 bytes/token，约 V4-Flash 的 1/4",
    },
    {
        "id": "engram",
        "date": "2026-09-10",
        "label": "Engram",
        "name": "条件记忆模块",
        "releaseId": "deepseek-v4-1-flash",
        "lane": "架构",
        "mechanism": "用 n-gram（2/3/4）查表式的条件记忆挂在第 1 与第 14 层，8 个 hash head，196B 参数以 FP8 存放。",
        "impact": "把「记住常见片段」这件事从注意力里外包出去，注意力可以专注在真正需要推理的位置。",
        "magnitude": "196B 参数的条件记忆",
    },
    {
        "id": "single-pass-mhc",
        "date": "2026-09-10",
        "label": "mHC",
        "name": "单遍残差混流",
        "releaseId": "deepseek-v4-1-flash",
        "lane": "训练",
        "mechanism": "把残差更新、输入混合与系数预测融合成一次单遍计算，残差读写降到理论下界 (2n+2)d。",
        "impact": "激活值的内存流量减半，长序列训练的带宽瓶颈被松开，训练与推理都直接受益。",
        "magnitude": "残差读写 (3n+2)d → (2n+2)d",
    },
    {
        "id": "effort-dial",
        "date": "2026-09-10",
        "label": "Effort 1-100",
        "name": "可控推理强度",
        "releaseId": "deepseek-v4-1-flash",
        "lane": "推理",
        "mechanism": "推理强度做成 1 到 100 的标量，公开 API 对应 low=50 / high=75 / max=100。",
        "impact": "同一模型按任务价值分配算力：effort 从 25 提到 100，8 项推理基准均分从 67.1% 涨到 76.3%。",
        "magnitude": "effort 25→100：67.1% → 76.3%",
    },
    {
        "id": "dsec",
        "date": "2026-09-10",
        "label": "DSec",
        "name": "百万级并发沙箱",
        "releaseId": "deepseek-v4-1-flash",
        "lane": "后训练",
        "mechanism": "自研安全沙箱，用 AppArmor 与 eBPF 做隔离，单机容器密度从 1,000 提到 2,500 以上。",
        "impact": "Agentic RL 的数据瓶颈从「任务不够」变成「环境不够」，这一步把环境供给做成了基础设施。",
        "magnitude": "单机密度 1k → 2,500+",
    },
]

# releaseId slugs must match the generated `id` field (lower-cased repo name)
FIX = {
    "deepseek-v3-1": "deepseek-v3.1",
    "deepseek-v3-2-exp": "deepseek-v3.2-exp",
    "deepseek-v3-2": "deepseek-v3.2",
    "deepseek-v4-1-flash": "deepseek-v4.1-flash",
}

if __name__ == "__main__":
    for b in BREAKTHROUGHS:
        rid = b.get("releaseId")
        if rid in FIX:
            b["releaseId"] = FIX[rid]
    main()
