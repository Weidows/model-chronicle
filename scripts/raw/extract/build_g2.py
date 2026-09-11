# -*- coding: utf-8 -*-
import json, os, io

SRC = "C:/Users/weidows/AppData/Local/Temp/dsweb/readmes"
OUT = "C:/Users/weidows/AppData/Local/Temp/dsweb/extract/g2.json"

def load(name):
    with io.open(os.path.join(SRC, name), encoding="utf-8") as f:
        return f.read()

def ln(txt, needle, occurrence=1):
    """return the stripped line (guaranteed verbatim substring of txt)"""
    hits = [l.strip() for l in txt.splitlines() if needle in l]
    assert len(hits) >= occurrence, "miss %r in readme" % needle
    return hits[occurrence - 1]

def ev(parts):
    s = "\n".join(parts)
    assert len(s) <= 300, "evidence too long: %d" % len(s)
    return s

def check(txt, s):
    for p in s.split("\n"):
        assert p in txt, "NOT VERBATIM: %r" % p[:60]

objs = []

# ---------------- 1. DeepSeek-V2-Chat ----------------
t = load("DeepSeek-V2-Chat.md")
e = ev(["It comprises 236B total parameters, of which 21B are activated for each token.",
        ln(t, "**HumanEval**", 2)])
check(t, e)
objs.append({
 "repo": "deepseek-ai/DeepSeek-V2-Chat",
 "total_params": "236B",
 "activated_params": "21B",
 "context_length": "128k",
 "license": "deepseek",
 "key_innovations": ["MLA (Multi-head Latent Attention)", "DeepSeekMoE"],
 "benchmarks": [
   {"name": "MMLU", "score": "77.8", "note": "DeepSeek-V2 Chat (RL)"},
   {"name": "BBH", "score": "79.7", "note": "DeepSeek-V2 Chat (RL)"},
   {"name": "C-Eval", "score": "78.0", "note": "DeepSeek-V2 Chat (RL)"},
   {"name": "CMMLU", "score": "81.6", "note": "DeepSeek-V2 Chat (RL)"},
   {"name": "HumanEval", "score": "81.1", "note": "DeepSeek-V2 Chat (RL)"},
   {"name": "MBPP", "score": "72.0", "note": "DeepSeek-V2 Chat (RL)"},
   {"name": "LiveCodeBench (0901-0401)", "score": "32.5", "note": "DeepSeek-V2 Chat (RL)"},
   {"name": "GSM8K", "score": "92.2", "note": "DeepSeek-V2 Chat (RL)"},
   {"name": "MATH", "score": "53.9", "note": "DeepSeek-V2 Chat (RL)"},
   {"name": "AlignBench (总分)", "score": "7.91", "note": "DeepSeek-V2 Chat (RL)"}
 ],
 "summary": "DeepSeek-V2-Chat 是 DeepSeek-V2 经 SFT + RL 对齐后的对话模型（236B 总参数 / 21B 激活、128k 上下文），依托 MLA 与 DeepSeekMoE 把训练成本降低 42.5%、KV cache 压缩 93.3%、最大生成吞吐提升 5.76 倍，并以可商用授权开源，是 2024 年性价比最高的开源 MoE 对话模型之一。",
 "evidence": e
})

# ---------------- 2. DeepSeek-V2-Lite ----------------
t = load("DeepSeek-V2-Lite.md")
e = ev(["16B total params, 2.4B active params, scratch training with 5.7T tokens",
        ln(t, "**MMLU**", 1)])
check(t, e)
objs.append({
 "repo": "deepseek-ai/DeepSeek-V2-Lite",
 "total_params": "16B",
 "activated_params": "2.4B",
 "context_length": "32k",
 "license": "deepseek",
 "key_innovations": ["MLA (Multi-head Latent Attention)", "DeepSeekMoE"],
 "benchmarks": [
   {"name": "MMLU", "score": "58.3", "note": "DeepSeek-V2-Lite (MoE-16B) base"},
   {"name": "BBH", "score": "44.1", "note": "DeepSeek-V2-Lite (MoE-16B) base"},
   {"name": "C-Eval", "score": "60.3", "note": "DeepSeek-V2-Lite (MoE-16B) base"},
   {"name": "CMMLU", "score": "64.3", "note": "DeepSeek-V2-Lite (MoE-16B) base"},
   {"name": "HumanEval", "score": "29.9", "note": "DeepSeek-V2-Lite (MoE-16B) base"},
   {"name": "MBPP", "score": "43.2", "note": "DeepSeek-V2-Lite (MoE-16B) base"},
   {"name": "GSM8K", "score": "41.1", "note": "DeepSeek-V2-Lite (MoE-16B) base"},
   {"name": "MATH", "score": "17.1", "note": "DeepSeek-V2-Lite (MoE-16B) base"}
 ],
 "summary": "DeepSeek-V2-Lite 把 DeepSeek-V2 的 MLA + DeepSeekMoE 架构缩小到 16B 总参数 / 2.4B 激活、32k 上下文，单张 40G GPU 即可部署、8×80G 可微调，让社区能在有限算力下深入研究 MLA 与 MoE。",
 "evidence": e
})

# ---------------- 3. DeepSeek-Coder-V2-Instruct ----------------
t = load("DeepSeek-Coder-V2-Instruct.md")
e = ev(["DeepSeek-Coder-V2 with 16B and 236B parameters based on the [DeepSeekMoE](https://arxiv.org/pdf/2401.06066) framework, which has actived parameters of only 2.4B and 21B",
        "expands its support for programming languages from 86 to 338, while extending the context length from 16K to 128K"])
check(t, e)
objs.append({
 "repo": "deepseek-ai/DeepSeek-Coder-V2-Instruct",
 "total_params": "236B",
 "activated_params": "21B",
 "context_length": "128k",
 "license": "deepseek-license",
 "key_innovations": ["DeepSeekMoE", "MoE continued pre-training from DeepSeek-V2 (6T additional tokens)", "338 programming languages", "128K context length"],
 "benchmarks": [],
 "summary": "DeepSeek-Coder-V2-Instruct 在 DeepSeek-V2 的中间 checkpoint 上继续预训练 6T token，把 MoE 代码模型做到接近 GPT4-Turbo 的水平，并把支持的编程语言从 86 种扩展到 338 种、上下文从 16K 提升到 128K。",
 "evidence": e
})

# ---------------- 4. DeepSeek-V2.5 ----------------
t = load("DeepSeek-V2.5.md")
e = ev([ln(t, "AlpacaEval 2.0"), ln(t, "HumanEval python")])
check(t, e)
objs.append({
 "repo": "deepseek-ai/DeepSeek-V2.5",
 "total_params": None,
 "activated_params": None,
 "context_length": None,
 "license": "deepseek",
 "key_innovations": ["Merges DeepSeek-V2-Chat and DeepSeek-Coder-V2-Instruct", "Function calling", "JSON output mode", "FIM completion"],
 "benchmarks": [
   {"name": "AlpacaEval 2.0", "score": "50.5", "note": "DeepSeek-V2.5"},
   {"name": "ArenaHard", "score": "76.2", "note": "DeepSeek-V2.5"},
   {"name": "AlignBench", "score": "8.04", "note": "DeepSeek-V2.5"},
   {"name": "MT-Bench", "score": "9.02", "note": "DeepSeek-V2.5"},
   {"name": "HumanEval python", "score": "89", "note": "DeepSeek-V2.5"},
   {"name": "HumanEval Multi", "score": "73.8", "note": "DeepSeek-V2.5"},
   {"name": "LiveCodeBench(01-09)", "score": "41.8", "note": "DeepSeek-V2.5"},
   {"name": "Aider", "score": "72.2", "note": "DeepSeek-V2.5"},
   {"name": "SWE-verified", "score": "16.8", "note": "DeepSeek-V2.5"},
   {"name": "DS-FIM-Eval", "score": "78.3", "note": "DeepSeek-V2.5"},
   {"name": "DS-Arena-Code", "score": "63.1", "note": "DeepSeek-V2.5"}
 ],
 "summary": "DeepSeek-V2.5 把 DeepSeek-V2-Chat 的通用能力与 DeepSeek-Coder-V2-Instruct 的代码能力合并进同一个模型，并增强了写作、指令跟随、函数调用与 JSON 输出，是 V2 与 V3 之间的过渡版本。",
 "evidence": e
})

# ---------------- 5. deepseek-vl2 ----------------
t = load("deepseek-vl2.md")
e = ev(["DeepSeek-VL2 is built on DeepSeekMoE-27B.",
        "with 1.0B, 2.8B and 4.5B activated parameters respectively"])
check(t, e)
objs.append({
 "repo": "deepseek-ai/deepseek-vl2",
 "total_params": None,
 "activated_params": "1.0B (Tiny), 2.8B (Small), 4.5B (VL2)",
 "context_length": None,
 "license": "deepseek",
 "key_innovations": ["MoE Vision-Language Model", "DeepSeekMoE-27B", "Dynamic tiling strategy", "Visual grounding"],
 "benchmarks": [],
 "summary": "DeepSeek-VL2 是基于 DeepSeekMoE-27B 的 MoE 视觉语言模型系列（Tiny/Small/VL2 分别激活 1.0B/2.8B/4.5B 参数），在视觉问答、OCR、图表理解与视觉定位等任务上以更少的激活参数达到与现有开源稠密/MoE 模型相当或更好的表现。",
 "evidence": e
})

# ---------------- 6. DeepSeek-V3 ----------------
v3_benches = [
   {"name": "MMLU (Acc.)", "score": "87.1", "note": "DeepSeek-V3 base, 5-shot"},
   {"name": "BBH (EM)", "score": "87.5", "note": "DeepSeek-V3 base, 3-shot"},
   {"name": "MMLU-Pro (Acc.)", "score": "64.4", "note": "DeepSeek-V3 base, 5-shot"},
   {"name": "DROP (F1)", "score": "89.0", "note": "DeepSeek-V3 base, 3-shot"},
   {"name": "HumanEval (Pass@1)", "score": "65.2", "note": "DeepSeek-V3 base, 0-shot"},
   {"name": "MBPP (Pass@1)", "score": "75.4", "note": "DeepSeek-V3 base, 3-shot"},
   {"name": "GSM8K (EM)", "score": "89.3", "note": "DeepSeek-V3 base, 8-shot"},
   {"name": "MATH (EM)", "score": "61.6", "note": "DeepSeek-V3 base, 4-shot"},
   {"name": "MMLU (EM)", "score": "88.5", "note": "DeepSeek-V3 chat"},
   {"name": "GPQA-Diamond (Pass@1)", "score": "59.1", "note": "DeepSeek-V3 chat"},
   {"name": "LiveCodeBench (Pass@1-COT)", "score": "40.5", "note": "DeepSeek-V3 chat"},
   {"name": "Codeforces (Percentile)", "score": "51.6", "note": "DeepSeek-V3 chat"},
   {"name": "AIME 2024 (Pass@1)", "score": "39.2", "note": "DeepSeek-V3 chat"},
   {"name": "MATH-500 (EM)", "score": "90.2", "note": "DeepSeek-V3 chat"},
   {"name": "CNMO 2024 (Pass@1)", "score": "43.2", "note": "DeepSeek-V3 chat"},
   {"name": "Arena-Hard", "score": "85.5", "note": "DeepSeek-V3 chat"},
   {"name": "AlpacaEval 2.0", "score": "70.0", "note": "DeepSeek-V3 chat, length-controlled win rate"}
]
v3_innov = ["MLA (Multi-head Latent Attention)", "DeepSeekMoE",
            "Auxiliary-loss-free load balancing", "Multi-Token Prediction (MTP)",
            "FP8 mixed precision training", "Knowledge distillation from DeepSeek-R1"]
v3_summary = "DeepSeek-V3 是 671B 总参数 / 37B 激活的 MoE 模型，首次在超大规模上验证 FP8 混合精度训练，并引入无辅助损失的负载均衡策略与 Multi-Token Prediction，仅用 2.788M H800 GPU 小时训练 14.8T token 就取得接近领先闭源模型的表现。"

for fname, repo in [("DeepSeek-V3.md", "deepseek-ai/DeepSeek-V3"),
                    ("DeepSeek-V3-Base.md", "deepseek-ai/DeepSeek-V3-Base")]:
    t = load(fname)
    e = ev(["a strong Mixture-of-Experts (MoE) language model with 671B total parameters with 37B activated for each token",
            ln(t, "MMLU (Acc.)", 1)])
    check(t, e)
    objs.append({
     "repo": repo,
     "total_params": "671B",
     "activated_params": "37B",
     "context_length": "128K",
     "license": "Model Agreement (code: MIT)",
     "key_innovations": v3_innov,
     "benchmarks": list(v3_benches),
     "summary": v3_summary,
     "evidence": e
    })

# ---------------- 8/9. DeepSeek-R1 & DeepSeek-R1-Zero ----------------
r1_benches = [
   {"name": "MMLU (Pass@1)", "score": "90.8", "note": None},
   {"name": "MMLU-Redux (EM)", "score": "92.9", "note": None},
   {"name": "MMLU-Pro (EM)", "score": "84.0", "note": None},
   {"name": "DROP (3-shot F1)", "score": "92.2", "note": None},
   {"name": "GPQA-Diamond (Pass@1)", "score": "71.5", "note": None},
   {"name": "FRAMES (Acc.)", "score": "82.5", "note": None},
   {"name": "AlpacaEval2.0 (LC-winrate)", "score": "87.6", "note": None},
   {"name": "ArenaHard (GPT-4-1106)", "score": "92.3", "note": None},
   {"name": "LiveCodeBench (Pass@1-COT)", "score": "65.9", "note": None},
   {"name": "Codeforces (Rating)", "score": "2029", "note": None},
   {"name": "SWE Verified (Resolved)", "score": "49.2", "note": None},
   {"name": "Aider-Polyglot (Acc.)", "score": "53.3", "note": None},
   {"name": "AIME 2024 (Pass@1)", "score": "79.8", "note": None},
   {"name": "MATH-500 (Pass@1)", "score": "97.3", "note": None},
   {"name": "CNMO 2024 (Pass@1)", "score": "78.8", "note": None},
   {"name": "CLUEWSC (EM)", "score": "92.8", "note": None},
   {"name": "C-Eval (EM)", "score": "91.8", "note": None}
]

t = load("DeepSeek-R1.md")
e = ev(["| DeepSeek-R1-Zero | 671B | 37B | 128K", ln(t, "MMLU (Pass@1)", 1)])
check(t, e)
objs.append({
 "repo": "deepseek-ai/DeepSeek-R1",
 "total_params": "671B",
 "activated_params": "37B",
 "context_length": "128K",
 "license": "mit",
 "key_innovations": ["Large-scale reinforcement learning (RL) without SFT (DeepSeek-R1-Zero, GRPO-free/unstated)", "Cold-start data before RL", "Long chain-of-thought (CoT)", "Reasoning distillation into dense Qwen/Llama models"],
 "benchmarks": [dict(b) for b in r1_benches],
 "summary": "DeepSeek-R1 是首个公开验证「纯强化学习即可激发 LLM 推理能力」的模型系列：R1-Zero 不做 SFT 直接大规模 RL，R1 在其基础上加入 cold-start 数据并经过两阶段 RL 与两阶段 SFT，性能对标 OpenAI-o1，并以 MIT 协议开源权重、同时放出 6 个 Qwen/Llama 蒸馏模型。",
 "evidence": e
})

t = load("DeepSeek-R1-Zero.md")
e = ev(["| DeepSeek-R1-Zero | 671B | 37B | 128K", ln(t, "MMLU (Pass@1)", 1)])
check(t, e)
objs.append({
 "repo": "deepseek-ai/DeepSeek-R1-Zero",
 "total_params": "671B",
 "activated_params": "37B",
 "context_length": "128K",
 "license": "mit",
 "key_innovations": ["Large-scale reinforcement learning (RL) without SFT", "Emergent self-verification, reflection and long chain-of-thought (CoT)"],
 "benchmarks": [dict(b, note="DeepSeek R1 column (this README is identical to the DeepSeek-R1 model card; no R1-Zero-only scores given)") for b in r1_benches],
 "summary": "DeepSeek-R1-Zero 是 R1 系列的第一代推理模型，完全跳过 SFT 直接对 DeepSeek-V3-Base 做大规模强化学习，自发涌现出自验证、反思与长 CoT 等行为，首次证明不依赖 SFT 也能靠纯 RL 激发推理能力。",
 "evidence": e
})

# strip the parenthetical innovation wording that is descriptive, keep clean
objs[7]["key_innovations"] = ["Large-scale reinforcement learning without SFT (DeepSeek-R1-Zero)",
                              "Cold-start data before RL",
                              "Long chain-of-thought (CoT)",
                              "Reasoning distillation into dense Qwen/Llama models"]

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with io.open(OUT, "w", encoding="utf-8") as f:
    json.dump(objs, f, ensure_ascii=False, indent=2)

# validation
raw = io.open(OUT, encoding="utf-8").read()
data = json.loads(raw)
print("written:", OUT)
print("objects:", len(data))
print("repos:", [o["repo"] for o in data])
print("missing total_params:", [o["repo"] for o in data if o["total_params"] is None])
print("empty benchmarks:", [o["repo"] for o in data if not o["benchmarks"]])
print("max evidence len:", max(len(o["evidence"]) for o in data))
for o in data:
    assert set(o.keys()) == {"repo","total_params","activated_params","context_length","license","key_innovations","benchmarks","summary","evidence"}
print("schema keys OK")
