# -*- coding: utf-8 -*-
"""Extract structured info from 9 local DeepSeek model-card READMEs."""
import json, os, re, sys, io

SRC = "C:/Users/weidows/AppData/Local/Temp/dsweb/readmes"
OUT = "C:/Users/weidows/AppData/Local/Temp/dsweb/extract/g3.json"

def load(name):
    with io.open(os.path.join(SRC, name), encoding="utf-8") as f:
        return f.read()

def lines_of(text):
    return text.split("\n")

class Card:
    def __init__(self, fname):
        self.fname = fname
        self.text = load(fname)
        self.lines = lines_of(self.text)
    def ln(self, *nums):
        """verbatim full lines joined by newline (1-indexed)"""
        return "\n".join(self.lines[n - 1] for n in nums)
    def sub(self, num, start, end):
        """verbatim contiguous substring of line `num` from start (inclusive) to end (inclusive)"""
        l = self.lines[num - 1]
        i = l.index(start)
        j = l.index(end, i) + len(end)
        return l[i:j]
    def has(self, s):
        return s in self.text

def num_in(text, s):
    """verify a numeric score literally appears in the source file"""
    s = s.replace("*", "").replace("$", "").replace("%", "")
    toks = re.findall(r"\d+(?:\.\d+)?", s)
    return all(t in text for t in toks)

REPOS = {}

# ---------------- 1. DeepSeek-R1-Distill-Qwen-32B ----------------
c = Card("DeepSeek-R1-Distill-Qwen-32B.md")
ev = c.sub(82, "We open-source distilled", "checkpoints") + "\n" + c.ln(169)
REPOS["DeepSeek-R1-Distill-Qwen-32B"] = dict(
    total_params="32B",
    activated_params=None,
    context_length=None,
    license="MIT",
    key_innovations=[
        "Reasoning distillation: fine-tuned on 800k samples curated with DeepSeek-R1",
        "Large-scale reinforcement learning (RL) without SFT as a preliminary step (DeepSeek-R1-Zero)",
        "Cold-start data before RL (DeepSeek-R1 pipeline: 2 RL stages + 2 SFT stages)",
        "Dense 32B model outperforms OpenAI-o1-mini / achieves SOTA for dense models",
    ],
    benchmarks=[
        {"name": "AIME 2024 (pass@1)", "score": "72.6", "note": "AIME 2024 cons@64 83.3"},
        {"name": "MATH-500 (pass@1)", "score": "94.3", "note": None},
        {"name": "GPQA Diamond (pass@1)", "score": "62.1", "note": None},
        {"name": "LiveCodeBench (pass@1)", "score": "57.2", "note": None},
        {"name": "CodeForces (rating)", "score": "1691", "note": None},
    ],
    summary="该 README 实为 DeepSeek-R1 系列总卡片（DeepSeek-R1-Distill-Qwen-32B 是其中基于 Qwen2.5-32B 的蒸馏模型）。蒸馏版用 DeepSeek-R1 生成的数据（800k 样本）微调，32B 稠密模型在多项基准上超过 OpenAI-o1-mini。",
    evidence=ev,
)

# ---------------- 2. Janus-Pro-7B ----------------
c = Card("Janus-Pro-7B.md")
ev = c.ln(33, 34)
REPOS["Janus-Pro-7B"] = dict(
    total_params=None,
    activated_params=None,
    context_length=None,
    license="MIT (code) / DeepSeek Model License (model)",
    key_innovations=[
        "Decoupled visual encoding into separate pathways for multimodal understanding and generation",
        "Single unified autoregressive transformer handling both understanding and generation",
        "SigLIP-L vision encoder supporting 384 x 384 image input",
        "Image generation tokenizer with a downsample rate of 16",
    ],
    benchmarks=[],
    summary="Janus-Pro 把视觉编码解耦为理解与生成两条独立路径，同时仍使用单一统一 Transformer，缓解了同一视觉编码器在两类任务间的冲突。它是 DeepSeek 的统一多模态模型，7B 版基于 DeepSeek-LLM-7b-base 构建。",
    evidence=ev,
)

# ---------------- 3. DeepSeek-V3-0324 ----------------
c = Card("DeepSeek-V3-0324.md")
ev = c.ln(46, 53, 54, 55, 56)
REPOS["DeepSeek-V3-0324"] = dict(
    total_params=None,
    activated_params=None,
    context_length=None,
    license="MIT",
    key_innovations=[
        "Reasoning gains without architecture change (model structure exactly the same as DeepSeek-V3)",
        "Front-end web development: more executable code and better-looking pages",
        "Chinese writing aligned with the R1 writing style, better medium-to-long-form writing",
        "Function calling accuracy improvements and enhanced Chinese search",
        "API temperature mapping T_model = T_api * 0.3 (T_api <= 1)",
    ],
    benchmarks=[
        {"name": "MMLU-Pro", "score": "81.2", "note": "up from 75.9 (+5.3)"},
        {"name": "GPQA", "score": "68.4", "note": "up from 59.1 (+9.3)"},
        {"name": "AIME", "score": "59.4", "note": "up from 39.6 (+19.8)"},
        {"name": "LiveCodeBench", "score": "49.2", "note": "up from 39.2 (+10.0)"},
    ],
    summary="DeepSeek-V3-0324 是 DeepSeek-V3 的小版本升级，模型结构完全不变，但推理、前端网页开发、中文写作与函数调用能力明显增强。MMLU-Pro、GPQA、AIME、LiveCodeBench 四个基准分别提升 5.3 / 9.3 / 19.8 / 10.0 分。",
    evidence=ev,
)

# ---------------- 4. DeepSeek-Prover-V2-671B ----------------
c = Card("DeepSeek-Prover-V2-671B.md")
ev = c.sub(98, "We release DeepSeek-Prover-V2", "parameters.") + "\n" + \
     c.sub(70, "reaching", "PutnamBench")
REPOS["DeepSeek-Prover-V2-671B"] = dict(
    total_params="671B",
    activated_params=None,
    context_length=None,
    license="DeepSeek Model License",
    key_innovations=[
        "Recursive theorem proving pipeline powered by DeepSeek-V3 (subgoal decomposition + Lean 4 formalization)",
        "Synthetic cold-start data pairing complete formal proof with DeepSeek-V3 chain-of-thought",
        "Reinforcement learning with binary correct-or-incorrect reward feedback",
        "7B subgoal prover used to reduce proof-search compute",
        "ProverBench: 325 formalized AIME / textbook problems",
    ],
    benchmarks=[
        {"name": "MiniF2F-test (pass ratio)", "score": "88.9%", "note": "state-of-the-art in neural theorem proving"},
        {"name": "PutnamBench", "score": "49 out of 658 problems solved", "note": None},
    ],
    summary="DeepSeek-Prover-V2-671B 面向 Lean 4 形式化定理证明：用 DeepSeek-V3 递归分解子目标并把形式化证明与 CoT 合成为冷启动数据，再用二元对错反馈做强化学习。它在 MiniF2F-test 达到 88.9% 通过率，并解出 PutnamBench 658 题中的 49 题。",
    evidence=ev,
)

# ---------------- 5. DeepSeek-R1-0528 ----------------
c = Card("DeepSeek-R1-0528.md")
ev = c.sub(58, "in the AIME 2025 test", "in the current version") + "\n" + c.ln(84)
REPOS["DeepSeek-R1-0528"] = dict(
    total_params=None,
    activated_params=None,
    context_length=None,
    license="MIT",
    key_innovations=[
        "Increased thinking depth via more post-training compute (12K -> 23K tokens per AIME question)",
        "Algorithmic optimization mechanisms during post-training",
        "Reduced hallucination rate",
        "Enhanced function calling / tools (BFCL_v3_MultiTurn, Tau-Bench)",
        "System prompt is supported now; no need to force '\\<think\\>\\n' prefix",
    ],
    benchmarks=[
        {"name": "MMLU-Redux (EM)", "score": "93.4", "note": "DeepSeek R1: 92.9"},
        {"name": "MMLU-Pro (EM)", "score": "85.0", "note": "DeepSeek R1: 84.0"},
        {"name": "GPQA-Diamond (Pass@1)", "score": "81.0", "note": "DeepSeek R1: 71.5"},
        {"name": "SimpleQA (Correct)", "score": "27.8", "note": "DeepSeek R1: 30.1"},
        {"name": "FRAMES (Acc.)", "score": "83.0", "note": "DeepSeek R1: 82.5"},
        {"name": "Humanity's Last Exam (Pass@1)", "score": "17.7", "note": "DeepSeek R1: 8.5; text-only subset"},
        {"name": "LiveCodeBench (2408-2505) (Pass@1)", "score": "73.3", "note": "DeepSeek R1: 63.5"},
        {"name": "Codeforces-Div1 (Rating)", "score": "1930", "note": "DeepSeek R1: 1530"},
        {"name": "SWE Verified (Resolved)", "score": "57.6", "note": "DeepSeek R1: 49.2; Agentless framework"},
        {"name": "Aider-Polyglot (Acc.)", "score": "71.6", "note": "DeepSeek R1: 53.3"},
        {"name": "AIME 2024 (Pass@1)", "score": "91.4", "note": "DeepSeek R1: 79.8"},
        {"name": "AIME 2025 (Pass@1)", "score": "87.5", "note": "DeepSeek R1: 70.0"},
        {"name": "HMMT 2025 (Pass@1)", "score": "79.4", "note": "DeepSeek R1: 41.7"},
        {"name": "CNMO 2024 (Pass@1)", "score": "86.9", "note": "DeepSeek R1: 78.8"},
        {"name": "BFCL_v3_MultiTurn (Acc)", "score": "37.0", "note": None},
        {"name": "Tau-Bench (Pass@1)", "score": "53.5(Airline)/63.9(Retail)", "note": "GPT-4.1 acts as user role"},
    ],
    summary="DeepSeek-R1 的小版本升级：通过增加后训练算力与算法优化显著提升推理深度，AIME 2025 准确率从 70% 升至 87.5%，单题平均思考 token 从 12K 增至 23K。同时降低幻觉率、增强函数调用，并开始支持 system prompt。",
    evidence=ev,
)

# ---------------- 6. DeepSeek-V3.1 ----------------
c = Card("DeepSeek-V3.1.md")
ev = c.ln(68, 159)
REPOS["DeepSeek-V3.1"] = dict(
    total_params="671B",
    activated_params="37B",
    context_length="128K",
    license="MIT",
    key_innovations=[
        "Hybrid thinking mode: one model supports thinking mode and non-thinking mode by changing the chat template",
        "UE8M0 FP8 scale data format on both model weights and activations (microscaling, DeepGEMM)",
        "Two-phase long context extension: 32K phase 10x to 630B tokens, 128K phase 3.3x to 209B tokens",
        "Smarter tool calling / agent tasks (Code-Agent, Search-Agent formats)",
        "Thinking efficiency: DeepSeek-V3.1-Think answers comparable to DeepSeek-R1-0528, but faster",
    ],
    benchmarks=[
        {"name": "MMLU-Redux (EM)", "score": "93.7", "note": "V3.1-Thinking; NonThinking 91.8, V3-0324 90.5, R1-0528 93.4"},
        {"name": "MMLU-Pro (EM)", "score": "84.8", "note": "V3.1-Thinking; NonThinking 83.7, V3-0324 81.2, R1-0528 85.0"},
        {"name": "GPQA-Diamond (Pass@1)", "score": "80.1", "note": "V3.1-Thinking; NonThinking 74.9, V3-0324 68.4, R1-0528 81.0"},
        {"name": "Humanity's Last Exam (Pass@1)", "score": "15.9", "note": "V3.1-Thinking; R1-0528 17.7"},
        {"name": "BrowseComp", "score": "30.0", "note": "V3.1-Thinking; R1-0528 8.9; internal search framework"},
        {"name": "BrowseComp_zh", "score": "49.2", "note": "V3.1-Thinking; R1-0528 35.7"},
        {"name": "Humanity's Last Exam (Python + Search)", "score": "29.8", "note": "V3.1-Thinking; R1-0528 24.8"},
        {"name": "SimpleQA", "score": "93.4", "note": "V3.1-Thinking; R1-0528 92.3"},
        {"name": "LiveCodeBench (2408-2505) (Pass@1)", "score": "74.8", "note": "V3.1-Thinking; NonThinking 56.4, V3-0324 43.0, R1-0528 73.3"},
        {"name": "Codeforces-Div1 (Rating)", "score": "2091", "note": "V3.1-Thinking; R1-0528 1930"},
        {"name": "Aider-Polyglot (Acc.)", "score": "76.3", "note": "V3.1-Thinking; NonThinking 68.4, V3-0324 55.1, R1-0528 71.6"},
        {"name": "SWE Verified (Agent mode)", "score": "66.0", "note": "V3.1-NonThinking; V3-0324 45.4, R1-0528 44.6; internal code agent framework"},
        {"name": "SWE-bench Multilingual (Agent mode)", "score": "54.5", "note": "V3.1-NonThinking; V3-0324 29.3, R1-0528 30.5"},
        {"name": "Terminal-bench (Terminus 1 framework)", "score": "31.3", "note": "V3.1-NonThinking; V3-0324 13.3, R1-0528 5.7"},
        {"name": "AIME 2024 (Pass@1)", "score": "93.1", "note": "V3.1-Thinking; NonThinking 66.3, V3-0324 59.4, R1-0528 91.4"},
        {"name": "AIME 2025 (Pass@1)", "score": "88.4", "note": "V3.1-Thinking; NonThinking 49.8, V3-0324 51.3, R1-0528 87.5"},
        {"name": "HMMT 2025 (Pass@1)", "score": "84.2", "note": "V3.1-Thinking; NonThinking 33.5, V3-0324 29.2, R1-0528 79.4"},
    ],
    summary="DeepSeek-V3.1 是混合推理模型：一份权重通过切换 chat template 同时支持 thinking mode 与 non-thinking mode，工具调用与 agent 能力显著增强。它还用 UE8M0 FP8 scale 格式训练权重与激活，以适配 microscaling 数据格式。",
    evidence=ev,
)

# ---------------- 7. DeepSeek-V3.1-Terminus ----------------
c = Card("DeepSeek-V3.1-Terminus.md")
ev = c.ln(57, 58, 59, 60, 64, 66, 67)
REPOS["DeepSeek-V3.1-Terminus"] = dict(
    total_params=None,
    activated_params=None,
    context_length=None,
    license="MIT",
    key_innovations=[
        "Language consistency: fewer instances of mixed Chinese-English text and abnormal characters",
        "Agent capabilities: further optimized Code Agent and Search Agent",
        "Updated search agent template and tool-set",
        "Keeps original model structure of DeepSeek-V3.1",
    ],
    benchmarks=[
        {"name": "MMLU-Pro", "score": "85.0", "note": "DeepSeek-V3.1: 84.8"},
        {"name": "GPQA-Diamond", "score": "80.7", "note": "DeepSeek-V3.1: 80.1"},
        {"name": "Humanity's Last Exam", "score": "21.7", "note": "DeepSeek-V3.1: 15.9"},
        {"name": "LiveCodeBench", "score": "74.9", "note": "DeepSeek-V3.1: 74.8"},
        {"name": "Codeforces", "score": "2046", "note": "DeepSeek-V3.1: 2091"},
        {"name": "Aider-Polyglot", "score": "76.1", "note": "DeepSeek-V3.1: 76.3"},
        {"name": "BrowseComp", "score": "38.5", "note": "DeepSeek-V3.1: 30.0"},
        {"name": "BrowseComp-zh", "score": "45.0", "note": "DeepSeek-V3.1: 49.2"},
        {"name": "SimpleQA", "score": "96.8", "note": "DeepSeek-V3.1: 93.4"},
        {"name": "SWE Verified", "score": "68.4", "note": "DeepSeek-V3.1: 66.0"},
        {"name": "SWE-bench Multilingual", "score": "57.8", "note": "DeepSeek-V3.1: 54.5"},
        {"name": "Terminal-bench", "score": "36.7", "note": "DeepSeek-V3.1: 31.3"},
    ],
    summary="V3.1-Terminus 是针对用户反馈的修复版：保持原有能力的同时减少中英混输与异常字符，并进一步优化 Code Agent 与 Search Agent（HLE 15.9→21.7、BrowseComp 30.0→38.5、SimpleQA 93.4→96.8）。",
    evidence=ev,
)

# ---------------- 8. DeepSeek-V3.2-Exp ----------------
c = Card("DeepSeek-V3.2-Exp.md")
ev = c.sub(49, "DeepSeek Sparse Attention", "long-context scenarios") + "\n" + c.ln(66, 67)
REPOS["DeepSeek-V3.2-Exp"] = dict(
    total_params=None,
    activated_params=None,
    context_length=None,
    license="MIT",
    key_innovations=[
        "DeepSeek Sparse Attention (DSA): fine-grained sparse attention for long-context efficiency",
        "Training configurations deliberately aligned with V3.1-Terminus to isolate the effect of sparse attention",
        "Improves long-context training and inference efficiency while maintaining virtually identical output quality",
        "Open-source kernels: TileLang examples, DeepGEMM indexer logit kernels, FlashMLA sparse attention kernels",
        "Indexer RoPE layout fix (non-interleaved vs interleaved) announced 2025.11.17",
    ],
    benchmarks=[
        {"name": "MMLU-Pro", "score": "85.0", "note": "V3.1-Terminus: 85.0"},
        {"name": "GPQA-Diamond", "score": "79.9", "note": "V3.1-Terminus: 80.7"},
        {"name": "Humanity's Last Exam", "score": "19.8", "note": "V3.1-Terminus: 21.7"},
        {"name": "LiveCodeBench", "score": "74.1", "note": "V3.1-Terminus: 74.9"},
        {"name": "AIME 2025", "score": "89.3", "note": "V3.1-Terminus: 88.4"},
        {"name": "HMMT 2025", "score": "83.6", "note": "V3.1-Terminus: 86.1"},
        {"name": "Codeforces", "score": "2121", "note": "V3.1-Terminus: 2046"},
        {"name": "Aider-Polyglot", "score": "74.5", "note": "V3.1-Terminus: 76.1"},
        {"name": "BrowseComp", "score": "40.1", "note": "V3.1-Terminus: 38.5"},
        {"name": "BrowseComp-zh", "score": "47.9", "note": "V3.1-Terminus: 45.0"},
        {"name": "SimpleQA", "score": "97.1", "note": "V3.1-Terminus: 96.8"},
        {"name": "SWE Verified", "score": "67.8", "note": "V3.1-Terminus: 68.4"},
        {"name": "SWE-bench Multilingual", "score": "57.9", "note": "V3.1-Terminus: 57.8"},
        {"name": "Terminal-bench", "score": "37.7", "note": "V3.1-Terminus: 36.7"},
    ],
    summary="DeepSeek-V3.2-Exp 是通往下一代架构的中间实验版本，首次引入 DeepSeek Sparse Attention (DSA) 实现细粒度稀疏注意力，在几乎不损失输出质量的前提下大幅提升长文本训练与推理效率。为公平评估，其训练配置刻意与 V3.1-Terminus 对齐，各公开基准表现基本持平。",
    evidence=ev,
)

# ---------------- 9. DeepSeek-OCR ----------------
c = Card("DeepSeek-OCR.md")
ev = c.ln(48, 55)
REPOS["DeepSeek-OCR"] = dict(
    total_params=None,
    activated_params=None,
    context_length=None,
    license="MIT",
    key_innovations=[
        "Contexts Optical Compression: compressing text context through visual tokens",
        "Vision-language OCR model with <|grounding|> prompt for document-to-Markdown conversion",
        "Multiple resolution modes: Tiny, Small, Base, Large, Gundam (crop_mode)",
        "NGramPerReqLogitsProcessor with ngram_size=30 / window_size=90 for repetition control",
        "Officially supported in upstream vLLM (2025/10/23)",
    ],
    benchmarks=[],
    summary="DeepSeek-OCR 提出 Contexts Optical Compression（上下文光学压缩），探索用视觉 token 压缩文本上下文的边界，支持 grounding 转 Markdown 与多种分辨率模式，并已获 vLLM 官方支持。README 未给出参数量与基准分数。",
    evidence=ev,
)

# ---------------- assemble in the task's file order ----------------
ORDER = [
    "DeepSeek-R1-Distill-Qwen-32B", "Janus-Pro-7B", "DeepSeek-V3-0324",
    "DeepSeek-Prover-V2-671B", "DeepSeek-R1-0528", "DeepSeek-V3.1",
    "DeepSeek-V3.1-Terminus", "DeepSeek-V3.2-Exp", "DeepSeek-OCR",
]

out = []
problems = []
for name in ORDER:
    r = REPOS[name]
    fname = name + ".md"
    txt = load(fname)
    obj = {"repo": "deepseek-ai/" + name}
    obj.update(r)
    objects = ["repo", "total_params", "activated_params", "context_length", "license",
               "key_innovations", "benchmarks", "summary", "evidence"]
    assert list(obj.keys()) == objects, (name, list(obj.keys()))
    if len(obj["evidence"]) > 300:
        problems.append("evidence too long for %s: %d" % (name, len(obj["evidence"])))
    for b in obj["benchmarks"]:
        if not num_in(txt, b["score"]):
            problems.append("benchmark score not found verbatim in %s: %s=%s" % (name, b["name"], b["score"]))
    for p in (obj["total_params"], obj["activated_params"], obj["context_length"]):
        if p:
            tok = re.sub(r"[^\d]", "", p)
            if tok and tok not in txt:
                problems.append("param token not in %s: %s" % (name, p))
    out.append(obj)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with io.open(OUT, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

print("WRITTEN:", OUT)
print("objects:", len(out))
print("problems:", problems)
for o in out:
    print("%-32s params=%-6s act=%-5s ctx=%-5s bench=%d ev_len=%d" % (
        o["repo"], o["total_params"], o["activated_params"], o["context_length"],
        len(o["benchmarks"]), len(o["evidence"])))
    print("   EV:", o["evidence"].replace("\n", " || "))
