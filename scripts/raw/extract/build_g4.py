# -*- coding: utf-8 -*-
import json, os

D = []

# 1. DeepSeek-Math-V2
D.append({
  "repo": "deepseek-ai/DeepSeek-Math-V2",
  "total_params": None,
  "activated_params": None,
  "context_length": None,
  "license": "apache-2.0",
  "key_innovations": [
    "Self-verifiable mathematical reasoning",
    "LLM-based verifier for theorem proving",
    "Proof generator trained with the verifier as reward model",
    "Scaling verification compute to auto-label new hard-to-verify proofs"
  ],
  "benchmarks": [
    {"name": "IMO 2025", "score": "gold-level", "note": "theorem proving, with scaled test-time compute"},
    {"name": "CMO 2024", "score": "gold-level", "note": "theorem proving, with scaled test-time compute"},
    {"name": "Putnam 2024", "score": "118/120", "note": "near-perfect score with scaled test-time compute"}
  ],
  "summary": "\u63d0\u51fa\u53ef\u81ea\u9a8c\u8bc1\u7684\u6570\u5b66\u63a8\u7406\u8def\u7ebf\uff1a\u7528 LLM \u9a8c\u8bc1\u5668\u505a\u5956\u52b1\u8bad\u7ec3\u8bc1\u660e\u751f\u6210\u5668\uff0c\u5e76\u901a\u8fc7\u6269\u5c55\u9a8c\u8bc1\u7b97\u529b\u81ea\u52a8\u6807\u6ce8\u96be\u6838\u9a8c\u7684\u8bc1\u660e\u3002\u5b83\u5728 IMO 2025 \u4e0e CMO 2024 \u8fbe\u5230\u91d1\u724c\u6c34\u5e73\uff0cPutnam 2024 \u62ff\u5230 118/120\uff0c\u5efa\u7acb\u5728 DeepSeek-V3.2-Exp-Base \u4e4b\u4e0a\u3002",
  "evidence": "Our resulting model, DeepSeekMath-V2, demonstrates strong theorem-proving capabilities, achieving gold-level scores on IMO 2025 and CMO 2024 and a near-perfect 118/120 on Putnam 2024 with scaled test-time compute."
})

# 2. DeepSeek-V3.2
D.append({
  "repo": "deepseek-ai/DeepSeek-V3.2",
  "total_params": None,
  "activated_params": None,
  "context_length": None,
  "license": "mit",
  "key_innovations": [
    "DeepSeek Sparse Attention (DSA)",
    "Scalable Reinforcement Learning Framework",
    "Large-Scale Agentic Task Synthesis Pipeline",
    "DeepSeek-V3.2-Speciale high-compute variant"
  ],
  "benchmarks": [
    {"name": "IMO 2025", "score": "Gold-medal performance", "note": "qualitative medal claim; no numeric score given in README"},
    {"name": "IOI 2025", "score": "Gold-medal performance", "note": "qualitative medal claim; no numeric score given in README"}
  ],
  "summary": "DeepSeek-V3.2 \u7528 DeepSeek Sparse Attention (DSA) \u964d\u4f4e\u957f\u4e0a\u4e0b\u6587\u8ba1\u7b97\u590d\u6742\u5ea6\uff0c\u914d\u5408\u53ef\u6269\u5c55\u5f3a\u5316\u5b66\u4e60\u4e0e\u5927\u89c4\u6a21 Agentic \u6570\u636e\u5408\u6210\u7ba1\u9053\uff0c\u4e3b\u6253\u9ad8\u6548\u63a8\u7406\u4e0e\u667a\u80fd\u4f53\u80fd\u529b\uff1b\u9ad8\u7b97\u529b\u53d8\u4f53 DeepSeek-V3.2-Speciale \u79f0\u8d85\u8d8a GPT-5\uff0c\u5e76\u5728 IMO/IOI 2025 \u53d6\u5f97\u91d1\u724c\u8868\u73b0\u3002\u8be5\u6a21\u578b\u7ed3\u6784\u4e0e DeepSeek-V3.2-Exp \u76f8\u540c\u3002",
  "evidence": "- *Achievement:* \U0001f947 **Gold-medal performance** in the 2025 International Mathematical Olympiad (IMO) and International Olympiad in Informatics (IOI)."
})

# 3. DeepSeek-OCR-2
D.append({
  "repo": "deepseek-ai/DeepSeek-OCR-2",
  "total_params": None,
  "activated_params": None,
  "context_length": None,
  "license": "apache-2.0",
  "key_innovations": [
    "Visual Causal Flow",
    "Dynamic resolution",
    "Optical compression of visual context",
    "Human-like visual encoding"
  ],
  "benchmarks": [],
  "summary": "DeepSeek-OCR 2 \u4ee5 Visual Causal Flow \u4e3a\u6838\u5fc3\uff0c\u63a2\u7d22\u66f4\u63a5\u8fd1\u4eba\u7c7b\u7684\u89c6\u89c9\u7f16\u7801\u65b9\u5f0f\uff0c\u5ef6\u7eed DeepSeek-OCR \u7684\u89c6\u89c9\u4e0a\u4e0b\u6587\u538b\u7f29\u601d\u8def\u3002\u6a21\u578b\u5361\u53ea\u7ed9\u51fa\u7528\u6cd5\u4e0e\u52a8\u6001\u5206\u8fa8\u7387\u8bbe\u7f6e\uff0c\u672a\u5217\u51fa\u53c2\u6570\u91cf\u4e0e\u57fa\u51c6\u5206\u6570\u3002",
  "evidence": ""
})

# 4. DeepSeek-V4-Flash
D.append({
  "repo": "deepseek-ai/DeepSeek-V4-Flash",
  "total_params": "284B",
  "activated_params": "13B",
  "context_length": "1M (one million tokens)",
  "license": "mit",
  "key_innovations": [
    "Hybrid Attention Architecture (Compressed Sparse Attention CSA + Heavily Compressed Attention HCA)",
    "Manifold-Constrained Hyper-Connections (mHC)",
    "Muon Optimizer",
    "Two-stage post-training: domain experts (SFT + RL with GRPO) then on-policy distillation",
    "Three reasoning effort modes: Non-think / Think High / Think Max"
  ],
  "benchmarks": [
    {"name": "MMLU", "score": "88.7", "note": "DeepSeek-V4-Flash-Base, EM, 5-shot"},
    {"name": "MMLU-Pro", "score": "68.3", "note": "DeepSeek-V4-Flash-Base, EM, 5-shot"},
    {"name": "Simple-QA verified", "score": "30.1", "note": "DeepSeek-V4-Flash-Base, EM, 25-shot"},
    {"name": "AGIEval", "score": "82.6", "note": "DeepSeek-V4-Flash-Base, EM, 0-shot"},
    {"name": "HumanEval", "score": "69.5", "note": "DeepSeek-V4-Flash-Base, Pass@1, 0-shot"},
    {"name": "LongBench-V2", "score": "44.7", "note": "DeepSeek-V4-Flash-Base, EM, 1-shot"},
    {"name": "MMLU-Pro", "score": "86.2", "note": "V4-Flash Max (instruct)"},
    {"name": "SimpleQA-Verified", "score": "34.1", "note": "V4-Flash Max (instruct), Pass@1"},
    {"name": "GPQA Diamond", "score": "88.1", "note": "V4-Flash Max (instruct), Pass@1"},
    {"name": "HLE", "score": "34.8", "note": "V4-Flash Max (instruct), Pass@1"},
    {"name": "LiveCodeBench", "score": "91.6", "note": "V4-Flash Max (instruct), Pass@1"},
    {"name": "Codeforces", "score": "3052", "note": "V4-Flash Max (instruct), Rating"},
    {"name": "HMMT 2026 Feb", "score": "94.8", "note": "V4-Flash Max (instruct), Pass@1"},
    {"name": "Apex", "score": "33.0", "note": "V4-Flash Max (instruct), Pass@1"},
    {"name": "MRCR 1M", "score": "78.7", "note": "V4-Flash Max (instruct), MMR"},
    {"name": "CorpusQA 1M", "score": "60.5", "note": "V4-Flash Max (instruct), ACC"},
    {"name": "Terminal Bench 2.0", "score": "56.9", "note": "V4-Flash Max (instruct), Acc"},
    {"name": "SWE Verified", "score": "79.0", "note": "V4-Flash Max (instruct), Resolved"},
    {"name": "BrowseComp", "score": "73.2", "note": "V4-Flash Max (instruct), Pass@1"},
    {"name": "GDPval-AA", "score": "1395", "note": "V4-Flash Max (instruct), Elo"},
    {"name": "Toolathlon", "score": "47.8", "note": "V4-Flash Max (instruct), Pass@1"}
  ],
  "summary": "DeepSeek-V4 \u9884\u89c8\u7248\u7cfb\u5217\u7684 Flash \u578b\uff1a284B \u603b\u53c2\u6570\u300113B \u6fc0\u6d3b\uff0c\u652f\u6301\u767e\u4e07 token \u4e0a\u4e0b\u6587\u3002\u5f15\u5165 CSA+HCA \u6df7\u5408\u6ce8\u610f\u529b\u3001mHC \u6d41\u5f62\u7ea6\u675f\u8d85\u8fde\u63a5\u4e0e Muon \u4f18\u5316\u5668\uff0c1M \u4e0a\u4e0b\u6587\u4e0b Pro \u7248\u4ec5\u9700 V3.2 \u7684 27% \u5355 token \u63a8\u7406 FLOPs \u4e0e 10% KV cache\u3002",
  "evidence": "**DeepSeek-V4-Flash** with 284B parameters (13B activated) \u2014 both supporting a context length of **one million tokens**. || DeepSeek-V4-Flash | 284B | 13B | 1M | FP4 + FP8 Mixed* || MMLU-Pro (EM) | 5-shot | 65.5 | 68.3 | **73.5** || GPQA Diamond (Pass@1) | 71.2 | 87.4 | 88.1"
})

# 5. DeepSeek-V4-Pro
D.append({
  "repo": "deepseek-ai/DeepSeek-V4-Pro",
  "total_params": "1.6T",
  "activated_params": "49B",
  "context_length": "1M (one million tokens)",
  "license": "mit",
  "key_innovations": [
    "Hybrid Attention Architecture (Compressed Sparse Attention CSA + Heavily Compressed Attention HCA)",
    "Manifold-Constrained Hyper-Connections (mHC)",
    "Muon Optimizer",
    "Two-stage post-training: domain experts (SFT + RL with GRPO) then on-policy distillation",
    "Three reasoning effort modes: Non-think / Think High / Think Max (DeepSeek-V4-Pro-Max)"
  ],
  "benchmarks": [
    {"name": "MMLU", "score": "90.1", "note": "DeepSeek-V4-Pro-Base, EM, 5-shot"},
    {"name": "MMLU-Pro", "score": "73.5", "note": "DeepSeek-V4-Pro-Base, EM, 5-shot"},
    {"name": "Simple-QA verified", "score": "55.2", "note": "DeepSeek-V4-Pro-Base, EM, 25-shot"},
    {"name": "AGIEval", "score": "83.1", "note": "DeepSeek-V4-Pro-Base, EM, 0-shot"},
    {"name": "HumanEval", "score": "76.8", "note": "DeepSeek-V4-Pro-Base, Pass@1, 0-shot"},
    {"name": "LongBench-V2", "score": "51.5", "note": "DeepSeek-V4-Pro-Base, EM, 1-shot"},
    {"name": "MMLU-Pro", "score": "87.5", "note": "DS-V4-Pro Max, EM"},
    {"name": "SimpleQA-Verified", "score": "57.9", "note": "DS-V4-Pro Max, Pass@1"},
    {"name": "Chinese-SimpleQA", "score": "84.4", "note": "DS-V4-Pro Max, Pass@1"},
    {"name": "GPQA Diamond", "score": "90.1", "note": "DS-V4-Pro Max, Pass@1"},
    {"name": "HLE", "score": "37.7", "note": "DS-V4-Pro Max, Pass@1"},
    {"name": "LiveCodeBench", "score": "93.5", "note": "DS-V4-Pro Max, Pass@1"},
    {"name": "Codeforces", "score": "3206", "note": "DS-V4-Pro Max, Rating"},
    {"name": "HMMT 2026 Feb", "score": "95.2", "note": "DS-V4-Pro Max, Pass@1"},
    {"name": "IMOAnswerBench", "score": "89.8", "note": "DS-V4-Pro Max, Pass@1"},
    {"name": "Apex", "score": "38.3", "note": "DS-V4-Pro Max, Pass@1"},
    {"name": "MRCR 1M", "score": "83.5", "note": "DS-V4-Pro Max, MMR"},
    {"name": "CorpusQA 1M", "score": "62.0", "note": "DS-V4-Pro Max, ACC"},
    {"name": "Terminal Bench 2.0", "score": "67.9", "note": "DS-V4-Pro Max, Acc"},
    {"name": "SWE Verified", "score": "80.6", "note": "DS-V4-Pro Max, Resolved"},
    {"name": "BrowseComp", "score": "83.4", "note": "DS-V4-Pro Max, Pass@1"},
    {"name": "GDPval-AA", "score": "1554", "note": "DS-V4-Pro Max, Elo"},
    {"name": "Toolathlon", "score": "51.8", "note": "DS-V4-Pro Max, Pass@1"}
  ],
  "summary": "DeepSeek-V4 \u9884\u89c8\u7248\u7cfb\u5217\u7684 Pro \u578b\uff1a1.6T \u603b\u53c2\u6570\u300149B \u6fc0\u6d3b\uff0c\u652f\u6301\u767e\u4e07 token \u4e0a\u4e0b\u6587\u3002\u91c7\u7528 CSA+HCA \u6df7\u5408\u6ce8\u610f\u529b\u3001mHC \u4e0e Muon \u4f18\u5316\u5668\uff0c1M \u4e0a\u4e0b\u6587\u4e0b\u4ec5\u9700 DeepSeek-V3.2 \u7684 27% \u5355 token \u63a8\u7406 FLOPs \u4e0e 10% KV cache\uff0cPro-Max \u6a21\u5f0f\u79f0\u4e3a\u5f53\u65f6\u6700\u5f3a\u5f00\u6e90\u6a21\u578b\u3002\u672c\u6a21\u578b\u5361\u4e0e DeepSeek-V4-Flash \u7684\u5361\u5185\u5bb9\u5b8c\u5168\u76f8\u540c\u3002",
  "evidence": "**DeepSeek-V4-Pro** with 1.6T parameters (49B activated) \u2014 both supporting a context length of **one million tokens**. || DeepSeek-V4-Pro | 1.6T | 49B | 1M | FP4 + FP8 Mixed* || MMLU (EM) | 5-shot | 87.8 | 88.7 | **90.1** || Codeforces (Rating) | - | 3168 | 3052 | - | - | **3206**"
})

# 6. DeepSeek-V4-Flash-DSpark
D.append({
  "repo": "deepseek-ai/DeepSeek-V4-Flash-DSpark",
  "total_params": "284B (DeepSeek-V4-Flash checkpoint; -DSpark is the same checkpoint with an added speculative decoding module)",
  "activated_params": "13B (DeepSeek-V4-Flash)",
  "context_length": "1M (one million tokens)",
  "license": "mit",
  "key_innovations": [
    "DSpark speculative decoding",
    "Hybrid Attention Architecture (CSA + HCA)",
    "Manifold-Constrained Hyper-Connections (mHC)",
    "Muon Optimizer",
    "Not a new model: same checkpoint plus a speculative decoding module"
  ],
  "benchmarks": [
    {"name": "MMLU", "score": "88.7", "note": "DeepSeek-V4-Flash-Base column of this card's shared V4 table, EM, 5-shot"},
    {"name": "MMLU-Pro", "score": "68.3", "note": "DeepSeek-V4-Flash-Base column, EM, 5-shot"},
    {"name": "Simple-QA verified", "score": "30.1", "note": "DeepSeek-V4-Flash-Base column, EM, 25-shot"},
    {"name": "LongBench-V2", "score": "44.7", "note": "DeepSeek-V4-Flash-Base column, EM, 1-shot"},
    {"name": "MMLU-Pro", "score": "86.2", "note": "V4-Flash Max column, EM"},
    {"name": "SimpleQA-Verified", "score": "34.1", "note": "V4-Flash Max column, Pass@1"},
    {"name": "GPQA Diamond", "score": "88.1", "note": "V4-Flash Max column, Pass@1"},
    {"name": "HLE", "score": "34.8", "note": "V4-Flash Max column, Pass@1"},
    {"name": "LiveCodeBench", "score": "91.6", "note": "V4-Flash Max column, Pass@1"},
    {"name": "Codeforces", "score": "3052", "note": "V4-Flash Max column, Rating"},
    {"name": "Terminal Bench 2.0", "score": "56.9", "note": "V4-Flash Max column, Acc"},
    {"name": "SWE Verified", "score": "79.0", "note": "V4-Flash Max column, Resolved"},
    {"name": "BrowseComp", "score": "73.2", "note": "V4-Flash Max column, Pass@1"}
  ],
  "summary": "DeepSeek-V4-Flash-DSpark \u5e76\u975e\u65b0\u6a21\u578b\uff0c\u800c\u662f DeepSeek-V4-Flash \u540c\u4e00\u6743\u91cd\u989d\u5916\u6302\u8f7d\u4e00\u4e2a DSpark \u6295\u673a\u89e3\u7801\u6a21\u5757\uff0c\u53ef\u901a\u8fc7 vLLM \u7684 --speculative-config \u6216 SGLang \u7684 --speculative-algorithm DSPARK \u5355\u53c2\u6570\u5f00\u542f\u3002\u8be5\u6a21\u578b\u5361\u5185\u5bb9\u4e0e DeepSeek-V4-Flash \u57fa\u672c\u76f8\u540c\uff0c\u989d\u5916\u589e\u52a0\u4e86\u8fd9\u6761\u8bf4\u660e\u4e0e vLLM \u90e8\u7f72\u793a\u4f8b\u3002",
  "evidence": "**Note: DeepSeek-V4-Flash-DSpark** is **not** a new model. It is the same checkpoint with an additional speculative decoding module attached. || DeepSeek-V4-Flash | 284B | 13B | 1M | FP4 + FP8 Mixed* || GPQA Diamond (Pass@1) | 71.2 | 87.4 | 88.1"
})

# 7. DeepSeek-V4-Flash-0731
D.append({
  "repo": "deepseek-ai/DeepSeek-V4-Flash-0731",
  "total_params": None,
  "activated_params": None,
  "context_length": None,
  "license": "mit",
  "key_innovations": [
    "DSpark speculative decoding",
    "Agentic capabilities substantially enhanced over the preview",
    "reasoning_effort levels low / high / max",
    "Same model structure as DeepSeek-V4-Flash-DSpark (speculative decoding module attached)"
  ],
  "benchmarks": [
    {"name": "Terminal Bench 2.1", "score": "82.7", "note": "DeepSeek-V4-Flash-0731 column"},
    {"name": "NL2Repo", "score": "54.2", "note": "DeepSeek-V4-Flash-0731 column"},
    {"name": "Cybergym", "score": "76.7", "note": "DeepSeek-V4-Flash-0731 column"},
    {"name": "DeepSWE", "score": "54.4", "note": "DeepSeek-V4-Flash-0731 column"},
    {"name": "Toolathlon-Verified", "score": "70.3", "note": "DeepSeek-V4-Flash-0731 column"},
    {"name": "Agents' Last Exam", "score": "25.2", "note": "DeepSeek-V4-Flash-0731 column"},
    {"name": "AutomationBench Public", "score": "25.1", "note": "DeepSeek-V4-Flash-0731 column"},
    {"name": "DSBench-FullStack", "score": "68.7", "note": "internal full-stack development test set"},
    {"name": "DSBench-Hard", "score": "59.6", "note": "internal test set of difficult coding-agent problems"}
  ],
  "summary": "DeepSeek-V4-Flash-0731 \u662f Flash \u7684\u6b63\u5f0f\u53d1\u5e03\u7248\uff0c\u53d6\u4ee3\u9884\u89c8\u7248\uff0cAgentic \u80fd\u529b\u5927\u5e45\u63d0\u5347\uff0c\u5e76\u643a\u5e26 DSpark \u6295\u673a\u89e3\u7801\u6a21\u5757\u3002\u5b83\u5728 Terminal Bench 2.1\u3001DeepSWE \u7b49\u57fa\u51c6\u4e0a\u8d85\u8fc7 DeepSeek-V4-Pro \u9884\u89c8\u7248\uff0c\u867d\u7136\u6fc0\u6d3b\u53c2\u6570\u91cf\u8fdc\u5c0f\u4e8e\u540e\u8005\u3002",
  "evidence": "Terminal Bench 2.1 | 82.7 | 61.8 | 72.1 | 81.0 | 85.0 || DeepSWE | 54.4 | 7.3 | 12.8 | 46.2 | 58.0 || Agents' Last Exam | 25.2 | 15.8 | 16.5 | 23.8 | 25.7 || DSBench-FullStack \u2020 | 68.7 | 37.0 | 41.8 | 61.8 | 71.6"
})

# 8. DeepSeek-V4-Pro-0813
D.append({
  "repo": "deepseek-ai/DeepSeek-V4-Pro-0813",
  "total_params": None,
  "activated_params": None,
  "context_length": None,
  "license": "mit",
  "key_innovations": [
    "DSpark speculative decoding",
    "Greatly enhanced agentic capabilities, especially pronounced in production environments",
    "Built on the DeepSeek-V4-Pro (Preview) model structure",
    "reasoning_effort levels low / high / max"
  ],
  "benchmarks": [
    {"name": "HLE (wo / w tools)", "score": "42.7 / 60.0", "note": "DeepSeek-V4-Pro-0813 column"},
    {"name": "Terminal Bench 2.1", "score": "87.9", "note": "DeepSeek-V4-Pro-0813 column"},
    {"name": "NL2Repo", "score": "61.5", "note": "DeepSeek-V4-Pro-0813 column"},
    {"name": "Cybergym", "score": "83.3", "note": "DeepSeek-V4-Pro-0813 column"},
    {"name": "DeepSWE", "score": "62.7", "note": "DeepSeek-V4-Pro-0813 column"},
    {"name": "Toolathlon-Verified", "score": "74.1", "note": "DeepSeek-V4-Pro-0813 column"},
    {"name": "Agents' Last Exam", "score": "25.7", "note": "DeepSeek-V4-Pro-0813 column"},
    {"name": "AutomationBench (Public)", "score": "31.8", "note": "DeepSeek-V4-Pro-0813 column"},
    {"name": "DSBench-FullStack", "score": "71.1", "note": "internal full-stack development test set"},
    {"name": "DSBench-Hard", "score": "67.2", "note": "internal test set of difficult coding-agent problems"}
  ],
  "summary": "DeepSeek-V4-Pro-0813 \u662f Pro \u7684\u6b63\u5f0f\u53d1\u5e03\u7248\uff0c\u53d6\u4ee3\u9884\u89c8\u7248\uff0c\u5728 Agentic \u80fd\u529b\u4e0e\u751f\u4ea7\u73af\u5883\u8868\u73b0\u4e0a\u663e\u8457\u63d0\u5347\uff0c\u5e76\u6302\u8f7d DSpark \u6295\u673a\u89e3\u7801\u6a21\u5757\u3002\u5b83\u5728\u5217\u51fa\u7684\u57fa\u51c6\u4e0a\u5168\u9762\u8d85\u8fc7 V4-Pro \u9884\u89c8\u7248\u3002",
  "evidence": "HLE (wo / w tools) | 42.7 / 60.0 | 37.8 / 51.5 || Terminal Bench 2.1 | 87.9 | 82.7 || DeepSWE | 62.7 | 54.4 || Cybergym | 83.3 | 76.7 || DSBench-Hard \u2020 | 67.2 | 59.6"
})

# 9. DeepSeek-V4-Flash-Vision-Exp
D.append({
  "repo": "deepseek-ai/DeepSeek-V4-Flash-Vision-Exp",
  "total_params": None,
  "activated_params": None,
  "context_length": None,
  "license": "mit",
  "key_innovations": [
    "Visual modules added on DeepSeek-V4-Flash architecture with continued training",
    "DFlash attention",
    "Hyper-Connections",
    "DSpark forward path",
    "Vision encoder and aligner"
  ],
  "benchmarks": [
    {"name": "Terminal Bench 2.1", "score": "83.9", "note": "text agent capability"},
    {"name": "NL2Repo", "score": "57.7", "note": "text agent capability"},
    {"name": "Cybergym", "score": "75.3", "note": "text agent capability"},
    {"name": "DeepSWE", "score": "59.3", "note": "text agent capability"},
    {"name": "Toolathlon-Verified", "score": "75.9", "note": "text agent capability"},
    {"name": "DSBench-Hard", "score": "63.6", "note": "text agent capability"},
    {"name": "AutomationBench (Public)", "score": "25.7", "note": "text agent capability"},
    {"name": "ApexBench (Pass@1)", "score": "36.5", "note": "multimodal agent capability"},
    {"name": "Agents' Last Exam", "score": "27.3", "note": "multimodal agent capability"},
    {"name": "Chartography", "score": "64.3", "note": "multimodal agent capability"},
    {"name": "ZeroBench (Pass@5)", "score": "35.0", "note": "multimodal agent capability"}
  ],
  "summary": "DeepSeek-V4-Flash-Vision-Exp \u662f DeepSeek-V4 \u5bb6\u65cf\u9996\u4e2a\u5b9e\u9a8c\u6027\u591a\u6a21\u6001\u6a21\u578b\uff0c\u5728 V4-Flash \u67b6\u6784\u4e0a\u52a0\u5165\u89c6\u89c9\u6a21\u5757\u5e76\u7ee7\u7eed\u8bad\u7ec3\u3002\u76f8\u6bd4 DeepSeek-V4-Flash-0731\uff0c\u5176\u591a\u6a21\u6001 Agent \u80fd\u529b\u660e\u663e\u63d0\u5347\uff0c\u7eaf\u6587\u672c Agent \u4efb\u52a1\u6027\u80fd\u57fa\u672c\u6301\u5e73\u3002",
  "evidence": "ApexBench (Pass@1) | 36.5 | 26.2\u2020 | 39.4 || Chartography | 64.3 | - | 65.0 || ZeroBench (Pass@5) | 35.0 | - | 34.0 || Terminal Bench 2.1 | 83.9 | 82.7 | 85.0 || Agents' Last Exam | 27.3 | 25.2\u2020 | 25.7"
})

# 10. DeepSeek-V4.1-Flash
D.append({
  "repo": "deepseek-ai/DeepSeek-V4.1-Flash",
  "total_params": "552B backbone + 196B Engram conditional memory",
  "activated_params": "8B prefill / 16B decode",
  "context_length": "1M (up to one million tokens)",
  "license": "mit",
  "key_innovations": [
    "Causal Encoder-Decoder (CED) architecture",
    "SWA Bounded Replay",
    "Compressed Sparse Attention 2 (CSA2)",
    "Hierarchical Sparse Indexer",
    "FP4 main KV caching (E2M1, one E4M3 scale per 16 channels)",
    "Engram conditional memory",
    "Single-Pass mHC with Mega-mHC kernel",
    "DSpark speculative decoding",
    "DeepSeek-ViT vision encoder",
    "Continuously controllable reasoning effort (1-100)"
  ],
  "benchmarks": [
    {"name": "MMLU-Pro", "score": "74.1", "note": "DeepSeek-V4.1-Flash-Base, EM, 5-shot"},
    {"name": "AGIEval", "score": "83.4", "note": "DeepSeek-V4.1-Flash-Base, EM, 3-5-shot"},
    {"name": "C-Eval", "score": "92.1", "note": "DeepSeek-V4.1-Flash-Base, EM, 5-shot"},
    {"name": "SimpleQA-Verified", "score": "42.3", "note": "DeepSeek-V4.1-Flash-Base, EM, 25-shot"},
    {"name": "HumanEval", "score": "79.4", "note": "DeepSeek-V4.1-Flash-Base, Pass@1, 0-shot"},
    {"name": "GSM8K", "score": "93.0", "note": "DeepSeek-V4.1-Flash-Base, EM, 8-shot"},
    {"name": "LongBench-V2", "score": "45.2", "note": "DeepSeek-V4.1-Flash-Base, EM, 1-shot"},
    {"name": "MMMU-Pro", "score": "56.5", "note": "DeepSeek-V4.1-Flash-Base, EM, 4-shot"},
    {"name": "DocVQA", "score": "95.6", "note": "DeepSeek-V4.1-Flash-Base, LLM-Judge, 4-shot"},
    {"name": "RefCOCO-avg", "score": "86.0", "note": "DeepSeek-V4.1-Flash-Base, Acc@0.5, 0-shot"},
    {"name": "GPQA Diamond", "score": "90.9", "note": "DS-V4.1-Flash, Pass@1"},
    {"name": "HLE", "score": "36.8 (39.1\u2020)", "note": "DS-V4.1-Flash, Pass@1; \u2020 text-only subset"},
    {"name": "Codeforces", "score": "3471", "note": "DS-V4.1-Flash, Rating"},
    {"name": "MathArena Apex", "score": "65.6", "note": "DS-V4.1-Flash, Pass@1"},
    {"name": "Terminal-Bench 2.1", "score": "90.6", "note": "DS-V4.1-Flash, Pass@1"},
    {"name": "Terminal-Bench 3.0", "score": "30.0", "note": "DS-V4.1-Flash, Pass@1"},
    {"name": "Terminal-Bench 4.0", "score": "31.2", "note": "DS-V4.1-Flash, Pass@1"},
    {"name": "DeepSWE v1.1", "score": "74.2", "note": "DS-V4.1-Flash, Resolved"},
    {"name": "NL2Repo-Bench", "score": "64.0", "note": "DS-V4.1-Flash, Score"},
    {"name": "CyberGym", "score": "88.1", "note": "DS-V4.1-Flash, Pass@1"},
    {"name": "HLE w/ tools", "score": "63.9", "note": "DS-V4.1-Flash, Pass@1"},
    {"name": "AutomationBench", "score": "54.8", "note": "DS-V4.1-Flash, Pass@1"},
    {"name": "Agent's Last Exam", "score": "31.8", "note": "DS-V4.1-Flash, Pass@1"},
    {"name": "ZeroBench-main w/ tools", "score": "49.0", "note": "DS-V4.1-Flash, Pass@5"}
  ],
  "summary": "DeepSeek-V4.1-Flash \u662f\u591a\u6a21\u6001 MoE \u6a21\u578b\uff0c\u91c7\u7528 Causal Encoder-Decoder (CED) \u67b6\u6784\uff0c\u9884\u586b\u4e0e\u89e3\u7801\u65f6\u5206\u522b\u4ec5\u6fc0\u6d3b 8B / 16B \u53c2\u6570\uff1b\u914d\u5408 CSA2 \u4e0e FP4 main KV cache\uff0c\u628a\u5168\u5c40 KV cache \u538b\u5230\u7ea6 890 bytes/token\uff08\u7ea6\u4e3a V4-Flash \u7684 1/4\uff09\u3002\u53e6\u52a0\u5165 196B Engram \u6761\u4ef6\u8bb0\u5fc6\u4e0e DSpark \u6295\u673a\u89e3\u7801\uff0c\u652f\u6301 1M \u4e0a\u4e0b\u6587\u4e0e 1-100 \u53ef\u63a7\u63a8\u7406\u5f3a\u5ea6\u3002",
  "evidence": "552B backbone parameters and support for contexts of up to one million tokens || activate only **8B parameters per token during prefill** and **16B during decode** || **Engram conditional memory** (196B parameters, sparsely accessed via token-based lookup)"
})

for o in D:
    assert o["evidence"] == "" or len(o["evidence"]) <= 300, (o["repo"], len(o["evidence"]))
    assert set(o.keys()) == {"repo","total_params","activated_params","context_length","license","key_innovations","benchmarks","summary","evidence"}, o["repo"]

os.makedirs("C:/Users/weidows/AppData/Local/Temp/dsweb/extract", exist_ok=True)
out = "C:/Users/weidows/AppData/Local/Temp/dsweb/extract/g4.json"
with open(out, "w", encoding="utf-8") as f:
    json.dump(D, f, ensure_ascii=False, indent=2)

print("wrote", out, len(D), "objects")
for o in D:
    print(o["repo"], "| params:", o["total_params"], "| bench:", len(o["benchmarks"]), "| ev_len:", len(o["evidence"]))
