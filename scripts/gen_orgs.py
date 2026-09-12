"""Build src/data/{zai,kimi,index}.ts from the curated GLM / Kimi raw data.

Inputs (re-fetchable with scripts/fetch_family.py):
  scripts/raw/<org>/extract.json   facts an extractor read out of the model cards
  scripts/raw/<org>/api/<slug>.json  Hugging Face API snapshot (downloads/likes/usedStorage)

Same contract as gen_data.py: every number is copied from the model card or the
HF API, never invented. Missing values stay null and the UI prints 未公开.
"""
from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent
RAW = ROOT / "raw"
OUT = ROOT.parent / "src" / "data"

SNAPSHOT = date.today().isoformat()

ORG_META = {
    "zai-org": {
        "orgName": "智谱 GLM",
        "short": "GLM",
        "blurb": "GLM 系列：从 ChatGLM 到 GLM-5.3，全栈开源（语言 / 视觉 / 代码 / 视频 / 语音）",
        "hue": 265,
        "export": "zai",
    },
    "moonshotai": {
        "orgName": "月之暗面 Kimi",
        "short": "Kimi",
        "blurb": "Kimi 系列：Muon 优化器与超稀疏 MoE 路线的开源权重",
        "hue": 42,
        "export": "kimi",
    },
}

# Family is semantic; the extractor reports facts, so the mapping lives here.
FAMILY = {
    "chatglm-6b": "LLM", "chatglm2-6b": "LLM", "chatglm3-6b": "LLM",
    "codegeex2-6b": "Coder", "cogvlm-chat-hf": "VL", "cogagent-chat-hf": "Agent",
    "cogvlm2-llama3-chat-19B": "VL", "glm-4-9b-chat": "LLM", "glm-4v-9b": "VL",
    "CogVideoX-2b": "Video", "CogVideoX-5b": "Video", "CogVideoX1.5-5B": "Video",
    "glm-4-voice-9b": "Audio", "CogView4-6B": "Image", "GLM-4-9B-0414": "LLM",
    "GLM-4-32B-0414": "LLM", "GLM-Z1-32B-0414": "Reasoning",
    "GLM-Z1-Rumination-32B-0414": "Reasoning", "GLM-4.1V-9B-Thinking": "VL",
    "GLM-4.5": "LLM", "GLM-4.5-Air": "LLM", "GLM-4.5V": "VL", "GLM-4.6": "LLM",
    "Glyph": "VL", "GLM-4.6V-Flash": "VL", "AutoGLM-Phone-9B": "Agent",
    "GLM-4.7": "LLM", "GLM-Image": "Image", "GLM-4.7-Flash": "LLM",
    "GLM-OCR": "OCR", "GLM-5": "LLM", "GLM-5.1": "LLM", "GLM-5.2": "LLM",
    "GLM-5.3": "LLM", "GLM-5.3-Flash": "LLM", "GLM-ASR-Nano-2512": "Audio",
    "SCAIL-2": "Video",
    "Moonlight-16B-A3B-Instruct": "LLM", "MoonViT-SO-400M": "VL",
    "Kimi-VL-A3B-Instruct": "VL", "Kimi-VL-A3B-Thinking": "VL",
    "Kimi-Audio-7B-Instruct": "Audio", "Kimi-Dev-72B": "Coder",
    "Kimi-VL-A3B-Thinking-2506": "VL", "Kimi-K2-Base": "LLM",
    "Kimi-K2-Instruct": "LLM", "Kimi-K2-Instruct-0905": "LLM",
    "Kimi-Linear-48B-A3B-Instruct": "LLM", "Kimi-K2-Thinking": "LLM",
    "Kimi-K2.5": "LLM", "Kimi-K2.6": "LLM", "Kimi-K2.7-Code": "Coder",
    "Kimi-K3": "LLM",
}

# Releases that carried the lab forward; everything else is graded by traction.
FLAGSHIP = {
    "chatglm-6b", "chatglm2-6b", "chatglm3-6b", "glm-4-9b-chat", "CogVideoX-5b",
    "GLM-4-32B-0414", "GLM-Z1-32B-0414", "GLM-4.5", "GLM-4.5V", "GLM-4.6",
    "GLM-4.7", "GLM-4.7-Flash", "GLM-OCR", "GLM-5", "GLM-5.2", "GLM-5.3",
    "GLM-5.3-Flash", "GLM-4.6V-Flash",
    "Moonlight-16B-A3B-Instruct", "Kimi-VL-A3B-Instruct", "Kimi-K2-Instruct",
    "Kimi-Linear-48B-A3B-Instruct", "Kimi-K2-Thinking", "Kimi-K2.5", "Kimi-K2.6",
    "Kimi-K3",
}
MAJOR = {
    "codegeex2-6b", "cogvlm-chat-hf", "cogagent-chat-hf",
    "cogvlm2-llama3-chat-19B", "glm-4v-9b", "CogVideoX-2b", "glm-4-voice-9b",
    "CogVideoX1.5-5B", "GLM-4-9B-0414", "GLM-4.1V-9B-Thinking", "GLM-4.5-Air",
    "GLM-5.1", "AutoGLM-Phone-9B", "GLM-ASR-Nano-2512", "GLM-Image",
    "Kimi-Audio-7B-Instruct", "Kimi-Dev-72B", "Kimi-K2-Base", "Kimi-K2.7-Code",
    "Kimi-VL-A3B-Thinking-2506", "MoonViT-SO-400M",
}

LANES = [
    ("多模态", r"多模态|视觉|图像|视频|语音|OCR|文档|布局|渲染|画|3D|avatar"),
    ("训练", r"训练|优化器|Muon|预训练|语料|token|数据|蒸馏|并行|精度"),
    ("推理", r"推理|解码|KV|吞吐|注意力|稀疏|量化|投机|缓存|上下文"),
    ("后训练", r"强化|RL|后训练|对齐|思维链|reasoning|effort|工具调用|Agent|智能体"),
]


def lane_of(text: str) -> str:
    for lane, pat in LANES:
        if re.search(pat, text, re.I):
            return lane
    return "架构"


def short_label(entry: dict) -> str:
    """A short, verbatim-ish label: prefer a Latin/technical token the card uses."""
    pool = list(entry.get("innovations") or []) + [entry.get("breakthrough") or ""]
    for text in pool:
        for tok in re.findall(r"[A-Za-z][A-Za-z0-9\-\.]{1,15}", text or ""):
            if tok.lower() in {"the", "and", "with", "using", "model", "based", "for", "from"}:
                continue
            return tok
    head = re.split(r"[，,。：:（(]", (entry.get("breakthrough") or "").strip())[0]
    return head[:8] or "突破"


def norm_params(raw) -> str | None:
    """Card labels are sometimes verbose ("62 亿（6.2 billion parameters）"): keep
    the part that carries the number and drop the parenthetical commentary."""
    if raw is None:
        return None
    s = re.split(r"[（(]", str(raw))[0].strip()
    s = re.sub(r"\s*(parameters|params)\s*$", "", s, flags=re.I).strip()
    return s or None


def norm_ctx(raw) -> str | None:
    """Cards sometimes print a raw token count where every sibling says "1M" —
    show one unit so the context chip stays readable (1048576 → 1M)."""
    if raw is None:
        return None
    s = str(raw).strip()
    if s.isdigit():
        n = int(s)
        if n >= 1_048_576 and n % 1_048_576 == 0:
            return f"{n // 1_048_576}M"
        if n >= 1_000_000:
            return f"{round(n / 1_000_000)}M"
        if n >= 1024:
            return f"{round(n / 1024)}K"
    return s


def magnitude_of(rel: dict) -> str:
    if rel.get("contextLength"):
        return f"上下文 {rel['contextLength']}"
    if rel.get("activatedParams"):
        return f"激活 {rel['activatedParams']}"
    if rel.get("totalParams"):
        return f"总参 {rel['totalParams']}"
    return "见模型卡"


def iter_repo(org: str, slug: str):
    p = RAW / org / "api" / f"{slug}.json"
    if not p.exists():
        return {}
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def human_bytes(n: int | None) -> str | None:
    if not n:
        return None
    for unit, div in (("TB", 1e12), ("GB", 1e9), ("MB", 1e6)):
        if n >= div:
            return f"{n / div:.1f} {unit}"
    return f"{n} B"


def tier_of(slug: str) -> str:
    if slug in FLAGSHIP:
        return "flagship"
    if slug in MAJOR:
        return "major"
    return "minor"


def main() -> None:
    datasets = {}
    for org, meta in ORG_META.items():
        extract = json.loads((RAW / org / "extract.json").read_text(encoding="utf-8"))
        releases, breakthroughs = [], []
        for e in sorted(extract, key=lambda x: x.get("date") or ""):
            slug = e["slug"]
            api = iter_repo(org, slug)
            storage = api.get("usedStorage") or None
            tier = tier_of(slug)
            rel = {
                "id": slug.lower().replace("_", "-").replace(".", "-"),
                "repo": f"{org}/{slug}",
                "org": org,
                "name": e.get("name") or slug,
                "family": FAMILY.get(slug, "LLM"),
                "date": e.get("date"),
                "tier": tier,
                "totalParams": norm_params(e.get("totalParams")),
                "paramsSource": "card" in (e.get("paramsSource") or "") or None,
                "activatedParams": norm_params(e.get("activatedParams")),
                "contextLength": norm_ctx(e.get("contextLength")),
                "license": e.get("license"),
                "downloads": api.get("downloads") or 0,
                "likes": api.get("likes") or 0,
                "storageBytes": storage,
                "storageLabel": human_bytes(storage),
                "paramsB": None,
                "activeB": None,
                "innovations": (e.get("innovations") or [])[:5],
                "benchmarks": [],
                "headline": None,
                "summary": e.get("summary") or "",
                "breakthrough": e.get("breakthrough"),
                "variants": e.get("variants") or [],
            }
            # parameters_source: "card" when the card printed it, otherwise it is
            # a same-generation inference and the UI says so.
            src = (e.get("paramsSource") or "").strip('"') if isinstance(e.get("paramsSource"), str) else None
            rel["paramsSource"] = "card" if (rel["totalParams"] and src != "inferred") else (
                "inferred" if rel["totalParams"] else None
            )
            # numeric params for charts, parsed only from strings like "355B" / "2.8T"
            m = re.fullmatch(r"\s*([\d.,]+)\s*([BbMmTt])\s*", rel["totalParams"] or "")
            if m:
                rel["paramsB"] = float(m.group(1)) * {"b": 1, "m": 0.001, "t": 1000}[m.group(2).lower()]
            ma = re.fullmatch(r"\s*([\d.,]+)\s*([BbMmTt])\s*", rel["activatedParams"] or "")
            if ma:
                rel["activeB"] = float(ma.group(1)) * {"b": 1, "m": 0.001, "t": 1000}[ma.group(2).lower()]

            # benchmarks: keep every numeric row, headline = the best cross-generation
            # comparable one (a percentage, deduped by name taking the max)
            best: dict[str, float] = {}
            for b in e.get("benchmarks") or []:
                name, score, unit = b.get("name"), b.get("score"), b.get("unit") or "%"
                if name is None or score is None:
                    continue
                try:
                    val = float(score)
                except (TypeError, ValueError):
                    continue
                note = b.get("note") or ""
                rel["benchmarks"].append({"name": name, "score": val, "unit": unit, "note": note})
                if unit in ("%", "score", "pp") and name not in best:
                    best[name] = val
            if best:
                top = max(best.items(), key=lambda kv: kv[1])
                rel["headline"] = {"metric": top[0], "score": top[1]}
            releases.append(rel)

            if e.get("breakthrough") and tier != "minor":
                breakthroughs.append({
                    "id": f"{meta['short'].lower()}-{rel['id']}",
                    "date": rel["date"],
                    "label": short_label(e),
                    "name": re.split(r"[，,。：:（(]", e["breakthrough"])[0][:22],
                    "releaseId": rel["id"],
                    "lane": lane_of(" ".join((e.get("innovations") or [])[:3]) + " " + e["breakthrough"]),
                    "mechanism": e["breakthrough"],
                    "impact": rel["summary"],
                    "magnitude": magnitude_of(rel),
                })

        doc = {
            "org": org,
            "orgName": meta["orgName"],
            "snapshot": SNAPSHOT,
            "repoCount": 154 if org == "zai-org" else 19,
            "releases": releases,
            "breakthroughs": breakthroughs,
        }
        datasets[org] = doc
        body = "/* Generated by scripts/gen_orgs.py — do not edit by hand. */\n"
        body += "import type { Dataset } from './types'\n\n"
        body += f"export const dataset: Dataset = {json.dumps(doc, ensure_ascii=False, indent=2)} as Dataset\n"
        dest = OUT / f"{meta['export']}.ts"
        dest.write_text(body, encoding="utf-8")
        print(f"wrote {dest.relative_to(ROOT.parent)}  ({len(releases)} releases, {len(breakthroughs)} breakthroughs)")

    orgs = [{
        "id": "deepseek-ai",
        "name": "DeepSeek",
        "short": "DeepSeek",
        "blurb": "从 7B 稠密模型到 671B 稀疏专家，MLA / GRPO / V4 系列的开源路线",
        "hue": 190,
    }]
    for org, meta in ORG_META.items():
        orgs.append({"id": org, "name": meta["orgName"], "short": meta["short"],
                     "blurb": meta["blurb"], "hue": meta["hue"]})
    index = "/* Generated by scripts/gen_orgs.py — do not edit by hand. */\n"
    index += "import type { Dataset, OrgMeta } from './types'\n"
    index += "import { dataset as deepseek } from './deepseek'\n"
    index += "import { dataset as zai } from './zai'\n"
    index += "import { dataset as kimi } from './kimi'\n\n"
    index += "/** Labs the chronicle tracks, in switch order. */\n"
    index += f"export const ORGS: OrgMeta[] = {json.dumps(orgs, ensure_ascii=False, indent=2)}\n\n"
    index += "export const DATASETS: Dataset[] = [deepseek, zai, kimi]\n\n"
    index += """/** Merge the selected labs into one dataset so every view can render them
 *  side by side; per-lab colour still comes from the release's org badge. */
export function buildDataset(active: Set<string>): Dataset {
  const list = DATASETS.filter((d) => active.has(d.org))
  if (list.length === 1) return list[0]
  const releases = list.flatMap((d) => d.releases.map((r) => ({ ...r, org: d.org })))
  const breakthroughs = list.flatMap((d) =>
    d.breakthroughs.map((b) => ({ ...b, id: `${d.org}-${b.id}` })),
  )
  releases.sort((a, b) => a.date.localeCompare(b.date))
  breakthroughs.sort((a, b) => a.date.localeCompare(b.date))
  return {
    org: 'combined',
    orgName: list.map((d) => d.orgName).join(' · '),
    snapshot: list[0].snapshot,
    repoCount: list.reduce((n, d) => n + d.repoCount, 0),
    releases,
    breakthroughs,
  }
}
"""
    (OUT / "index.ts").write_text(index, encoding="utf-8")
    print(f"wrote src/data/index.ts  ({len(orgs)} orgs)")


if __name__ == "__main__":
    main()
