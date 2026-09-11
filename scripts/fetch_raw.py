#!/usr/bin/env python3
"""
Fetch the raw Hugging Face material that feeds src/data/deepseek.ts.

Writes into scripts/raw/:
  hf_raw.json    -- org listing (105 repos) with downloads/likes/createdAt
  metrics.json   -- per-curated-repo detail incl. usedStorage
  readmes/*.md   -- model card README for every curated repo

Network note: on this machine huggingface.co is only reachable through the
local proxy, so every request goes through PROXY below. Override with
HF_PROXY=http://host:port or HF_PROXY= (empty = direct).

Usage:  python scripts/fetch_raw.py
"""
from __future__ import annotations

import json
import os
import pathlib
import subprocess
import sys

ORG = "deepseek-ai"
PROXY = os.environ.get("HF_PROXY", "http://127.0.0.1:7890")
RAW = pathlib.Path(__file__).resolve().parent / "raw"

# The curated, timeline-worthy repos. Sibling repos (ESFT-*, eagle3-*,
# dspark_*, …) stay out of the timeline but are counted in the org totals.
CURATED = [
    "deepseek-coder-6.7b-base", "deepseek-coder-33b-instruct",
    "deepseek-llm-7b-base", "deepseek-llm-67b-chat",
    "deepseek-moe-16b-base", "deepseek-coder-7b-instruct-v1.5",
    "deepseek-math-7b-instruct", "deepseek-vl-7b-chat",
    "DeepSeek-V2", "DeepSeek-V2-Chat", "DeepSeek-V2-Lite",
    "DeepSeek-Coder-V2-Instruct", "DeepSeek-V2.5", "deepseek-vl2",
    "DeepSeek-V3", "DeepSeek-V3-Base", "DeepSeek-R1", "DeepSeek-R1-Zero",
    "DeepSeek-R1-Distill-Qwen-32B", "Janus-Pro-7B", "DeepSeek-V3-0324",
    "DeepSeek-Prover-V2-671B", "DeepSeek-R1-0528", "DeepSeek-V3.1",
    "DeepSeek-V3.1-Terminus", "DeepSeek-V3.2-Exp", "DeepSeek-OCR",
    "DeepSeek-Math-V2", "DeepSeek-V3.2", "DeepSeek-OCR-2",
    "DeepSeek-V4-Flash", "DeepSeek-V4-Pro", "DeepSeek-V4-Flash-DSpark",
    "DeepSeek-V4-Flash-0731", "DeepSeek-V4-Pro-0813",
    "DeepSeek-V4-Flash-Vision-Exp", "DeepSeek-V4.1-Flash",
]


def curl(url: str, dest: pathlib.Path) -> bool:
    cmd = ["curl", "-sL", "-m", "120", "-o", str(dest), url]
    if PROXY:
        cmd[1:1] = ["-x", PROXY]
    r = subprocess.run(cmd, capture_output=True)
    ok = r.returncode == 0 and dest.exists() and dest.stat().st_size > 0
    if not ok:
        print(f"  !! failed: {url}", file=sys.stderr)
    return ok


def main() -> int:
    RAW.mkdir(parents=True, exist_ok=True)
    (RAW / "readmes").mkdir(exist_ok=True)

    print(f"org listing (proxy={PROXY or 'direct'})")
    curl(f"https://huggingface.co/api/models?author={ORG}&limit=300&full=true", RAW / "hf_raw.json")

    metrics = {}
    for repo in CURATED:
        dest = RAW / "readmes" / f"{repo}.md"
        if not dest.exists():
            curl(f"https://huggingface.co/{ORG}/{repo}/raw/main/README.md", dest)
        probe = RAW / "_one.json"
        if curl(f"https://huggingface.co/api/models/{ORG}/{repo}", probe):
            d = json.loads(probe.read_text(encoding="utf-8"))
            metrics[repo] = {
                "createdAt": d.get("createdAt"),
                "downloads": d.get("downloads"),
                "likes": d.get("likes"),
                "usedStorage": d.get("usedStorage"),
                "trendingScore": d.get("trendingScore"),
                "pipeline_tag": d.get("pipeline_tag"),
                "tags": d.get("tags"),
            }
            print(f"  {repo}: {metrics[repo]['downloads']} downloads / {metrics[repo]['likes']} likes")
        probe.unlink(missing_ok=True)

    (RAW / "metrics.json").write_text(
        json.dumps(metrics, ensure_ascii=False, indent=1, sort_keys=True), encoding="utf-8"
    )
    print(f"wrote {RAW/'metrics.json'} ({len(metrics)} repos)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
