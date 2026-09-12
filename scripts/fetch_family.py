"""Fetch curated GLM (zai-org) + Kimi (moonshotai) repos: API metadata + model-card README.

Run through the local proxy: http://127.0.0.1:7890
Writes raw3/<org>/{api/<slug>.json,readmes/<slug>.md}
"""
import json, os, subprocess, sys

PROXY = "http://127.0.0.1:7890"
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "raw")
CURATED = {
    "moonshotai": [
        "Moonlight-16B-A3B-Instruct", "MoonViT-SO-400M", "Kimi-VL-A3B-Instruct",
        "Kimi-VL-A3B-Thinking", "Kimi-Audio-7B-Instruct", "Kimi-Dev-72B",
        "Kimi-VL-A3B-Thinking-2506", "Kimi-K2-Base", "Kimi-K2-Instruct",
        "Kimi-K2-Instruct-0905", "Kimi-Linear-48B-A3B-Instruct", "Kimi-K2-Thinking",
        "Kimi-K2.5", "Kimi-K2.6", "Kimi-K2.7-Code", "Kimi-K3",
    ],
    "zai-org": [
        "chatglm-6b", "chatglm2-6b", "chatglm3-6b", "codegeex2-6b", "cogvlm-chat-hf",
        "cogagent-chat-hf", "cogvlm2-llama3-chat-19B", "glm-4-9b-chat", "glm-4v-9b",
        "CogVideoX-2b", "CogVideoX-5b", "glm-4-voice-9b", "CogVideoX1.5-5B", "CogView4-6B",
        "GLM-4-9B-0414", "GLM-4-32B-0414", "GLM-Z1-32B-0414", "GLM-Z1-Rumination-32B-0414",
        "GLM-4.1V-9B-Thinking", "GLM-4.5", "GLM-4.5-Air", "GLM-4.5V", "GLM-4.6",
        "Glyph", "GLM-4.6V-Flash", "AutoGLM-Phone-9B", "GLM-4.7", "GLM-Image",
        "GLM-4.7-Flash", "GLM-OCR", "GLM-5", "GLM-5.1", "GLM-5.2", "GLM-5.3",
        "GLM-5.3-Flash", "GLM-ASR-Nano-2512", "SCAIL-2",
    ],
}


def curl(url, dest):
    r = subprocess.run(["curl", "-s", "-L", "-x", PROXY, "-m", "120", "-o", dest, url],
                       capture_output=True, text=True)
    return r.returncode == 0 and os.path.exists(dest) and os.path.getsize(dest) > 0


def main():
    for org, slugs in CURATED.items():
        for sub in ("api", "readmes"):
            os.makedirs(os.path.join(ROOT, org, sub), exist_ok=True)
    total = ok = 0
    for org, slugs in CURATED.items():
        for slug in slugs:
            rid = f"{org}/{slug}"
            api = os.path.join(ROOT, org, "api", f"{slug}.json")
            md = os.path.join(ROOT, org, "readmes", f"{slug}.md")
            for url, dest, label in (
                (f"https://huggingface.co/api/models/{rid}?blobs=true", api, "api"),
                (f"https://huggingface.co/{rid}/raw/main/README.md", md, "card"),
            ):
                total += 1
                good = curl(url, dest)
                size = os.path.getsize(dest) if os.path.exists(dest) else 0
                if good and size > 40:
                    ok += 1
                    print(f"ok   {label:<4} {rid:<46} {size:>7}b", flush=True)
                else:
                    print(f"FAIL {label:<4} {rid:<46} rc={good} size={size}", flush=True)
    print(f"\nFETCH-DONE {ok}/{total}", flush=True)


if __name__ == "__main__":
    main()
