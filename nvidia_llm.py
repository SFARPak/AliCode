"""
NVIDIA LLM API - Prebuilt Configuration & Client
==================================================
Base URL: https://integrate.api.nvidia.com/v1/chat/completions

Usage:
    from nvidia_llm import NVIDIAClient, Model
    
    client = NVIDIAClient()
    for chunk in client.chat(
        model=Model.META_LLAMA_3_3_70B,
        messages=[{"role": "user", "content": "Hello"}]
    ):
        print(chunk, end="")
"""

import json
import os
from typing import Any, Dict, Generator, List, Optional, Union

import requests


# ─────────────────────────────────────────────────────────
# 1. BASE URL & HEADERS
# ─────────────────────────────────────────────────────────

BASE_URL = "https://integrate.api.nvidia.com/v1/chat/completions"

DEFAULT_HEADERS = {
    "accept": "application/json",
    "content-type": "application/json",
}

# ─────────────────────────────────────────────────────────
# 2. MODELS REGISTRY (all providers & their models)
# ─────────────────────────────────────────────────────────

class Model:
    """NVIDIA API model identifiers.
    
    Each attribute holds the model string expected by the API.
    """

    # ── abacusai ────────────────────────────────────────
    ABACUSAI_DRACARYS_LLAMA_3_1_70B: str = "abacusai/dracarys-llama-3.1-70b-instruct"

    # ── bytedance ───────────────────────────────────────
    BYTEDANCE_SEED_OSS_36B: str = "bytedance/seed-oss-36b-instruct"

    # ── deepseek-ai ─────────────────────────────────────
    DEEPSEEK_V4_FLASH: str = "deepseek-ai/deepseek-v4-flash"
    DEEPSEEK_V4_PRO: str = "deepseek-ai/deepseek-v4-pro"

    # ── google ──────────────────────────────────────────
    GOOGLE_CODEGEMMA_7B: str = "google/codegemma-7b"
    GOOGLE_GEMMA_2_2B: str = "google/gemma-2-2b-it"
    GOOGLE_GEMMA_7B: str = "google/gemma-7b"

    # ── meta ────────────────────────────────────────────
    META_LLAMA2_70B: str = "meta/llama2-70b"
    META_LLAMA_3_1_8B: str = "meta/llama-3.1-8b-instruct"
    META_LLAMA_3_1_70B: str = "meta/llama-3.1-70b-instruct"
    META_LLAMA_3_2_1B: str = "meta/llama-3.2-1b-instruct"
    META_LLAMA_3_2_3B: str = "meta/llama-3.2-3b-instruct"
    META_LLAMA_3_3_70B: str = "meta/llama-3.3-70b-instruct"

    # ── microsoft ───────────────────────────────────────
    MS_PHI_4_MINI: str = "microsoft/phi-4-mini-instruct"
    MS_PHI_4_MINI_FLASH: str = "microsoft/phi-4-mini-flash-reasoning"

    # ── minimaxai ───────────────────────────────────────
    MINIMAX_M2_5: str = "minimaxai/minimax-m2.5"
    MINIMAX_M2_7: str = "minimaxai/minimax-m2.7"

    # ── mistralai ───────────────────────────────────────
    MISTRAL_NEMOTRON: str = "mistralai/mistral-nemotron"
    MIXTRAL_8X7B: str = "mistralai/mixtral-8x7b-instruct"
    MIXTRAL_8X22B: str = "mistralai/mixtral-8x22b-instruct"

    # ── moonshotai ──────────────────────────────────────
    KIMI_K2_INSTRUCT: str = "moonshotai/kimi-k2-instruct"
    KIMI_K2_THINKING: str = "moonshotai/kimi-k2-thinking"

    # ── nvidia ──────────────────────────────────────────
    NVIDIA_GLINER_PII: str = "nvidia/gliner-pii"
    NVIDIA_NEMOGUARD_8B_SAFETY: str = "nvidia/llama-3.1-nemoguard-8b-content-safety"
    NVIDIA_NEMOGUARD_8B_TOPIC: str = "nvidia/llama-3.1-nemoguard-8b-topic-control"
    NVIDIA_NEMOTRON_3_ULTRA: str = "nvidia/nemotron-3-ultra-550b-a55b"
    NVIDIA_NANO_8B_V1: str = "nvidia/llama-3.1-nemotron-nano-8b-v1"
    NVIDIA_SAFETY_GUARD_8B_V3: str = "nvidia/llama-3.1-nemotron-safety-guard-8b-v3"
    NVIDIA_NEMOTRON_SUPER_49B_V1: str = "nvidia/llama-3.3-nemotron-super-49b-v1"
    NVIDIA_NEMOTRON_SUPER_49B_V1_5: str = "nvidia/llama-3.3-nemotron-super-49b-v1.5"
    NVIDIA_NEMOTRON_ULTRA_253B: str = "nvidia/llama-3.1-nemotron-ultra-253b-v1"
    NVIDIA_NEMOGUARD_JAILBREAK: str = "nvidia/nemoguard-jailbreak-detect"
    NVIDIA_NEMOTRON_3_NANO: str = "nvidia/nemotron-3-nano-30b-a3b"
    NVIDIA_NEMOTRON_3_SUPER: str = "nvidia/nemotron-3-super-120b-a12b"
    NVIDIA_CONTENT_SAFETY_4B: str = "nvidia/nemotron-content-safety-reasoning-4b"
    NVIDIA_NEMOTRON_MINI_4B: str = "nvidia/nemotron-mini-4b-instruct"
    NVIDIA_NANO_9B_V2: str = "nvidia/nvidia-nemotron-nano-9b-v2"
    NVIDIA_RIVA_TRANSLATE_4B: str = "nvidia/riva-translate-4b-instruct-v1_1"
    NVIDIA_USDCODE: str = "nvidia/usdcode"

    # ── openai ──────────────────────────────────────────
    OPENAI_GPT_OSS_20B: str = "openai/gpt-oss-20b"
    OPENAI_GPT_OSS_120B: str = "openai/gpt-oss-120b"

    # ── qwen ────────────────────────────────────────────
    QWEN_CODER_32B: str = "qwen/qwen2.5-coder-32b-instruct"
    QWEN_3_5_122B: str = "qwen/qwen3.5-122b-a10b"
    QWEN_3_CODER_480B: str = "qwen/qwen3-coder-480b-a35b-instruct"
    QWEN_3_NEXT_80B: str = "qwen/qwen3-next-80b-a3b-instruct"
    QWEN_3_NEXT_80B_THINKING: str = "qwen/qwen3-next-80b-a3b-thinking"
    QWQ_32B: str = "qwen/qwq-32b"

    # ── sarvamai ────────────────────────────────────────
    SARVAM_M: str = "sarvamai/sarvam-m"

    # ── stepfun-ai ──────────────────────────────────────
    STEP_3_5_FLASH: str = "stepfun-ai/step-3-5-flash"

    # ── stockmark ───────────────────────────────────────
    STOCKMARK_2_100B: str = "stockmark/stockmark-2-100b-instruct"

    # ── upstage ─────────────────────────────────────────
    UPSTAGE_SOLAR_10_7B: str = "upstage/solar-10.7b-instruct"

    # ── z-ai ────────────────────────────────────────────
    Z_AI_GLM4_7: str = "z-ai/glm4.7"
    Z_AI_GLM5_1: str = "z-ai/glm5.1"
    Z_AI_GLM5_2: str = "z-ai/glm-5.2"


# ─────────────────────────────────────────────────────────
# 3. PROVIDER-ORGANISED MODEL DICT
# ─────────────────────────────────────────────────────────

MODELS_BY_PROVIDER: Dict[str, Dict[str, str]] = {
    "abacusai": {
        "dracarys-llama-3.1-70b-instruct": Model.ABACUSAI_DRACARYS_LLAMA_3_1_70B,
    },
    "bytedance": {
        "seed-oss-36b-instruct": Model.BYTEDANCE_SEED_OSS_36B,
    },
    "deepseek-ai": {
        "deepseek-v4-flash": Model.DEEPSEEK_V4_FLASH,
        "deepseek-v4-pro": Model.DEEPSEEK_V4_PRO,
    },
    "google": {
        "codegemma-7b": Model.GOOGLE_CODEGEMMA_7B,
        "gemma-2-2b-it": Model.GOOGLE_GEMMA_2_2B,
        "gemma-7b": Model.GOOGLE_GEMMA_7B,
    },
    "meta": {
        "llama2-70b": Model.META_LLAMA2_70B,
        "llama-3.1-8b-instruct": Model.META_LLAMA_3_1_8B,
        "llama-3.1-70b-instruct": Model.META_LLAMA_3_1_70B,
        "llama-3.2-1b-instruct": Model.META_LLAMA_3_2_1B,
        "llama-3.2-3b-instruct": Model.META_LLAMA_3_2_3B,
        "llama-3.3-70b-instruct": Model.META_LLAMA_3_3_70B,
    },
    "microsoft": {
        "phi-4-mini-instruct": Model.MS_PHI_4_MINI,
        "phi-4-mini-flash-reasoning": Model.MS_PHI_4_MINI_FLASH,
    },
    "minimaxai": {
        "minimax-m2.5": Model.MINIMAX_M2_5,
        "minimax-m2.7": Model.MINIMAX_M2_7,
    },
    "mistralai": {
        "mistral-nemotron": Model.MISTRAL_NEMOTRON,
        "mixtral-8x7b-instruct": Model.MIXTRAL_8X7B,
        "mixtral-8x22b-instruct": Model.MIXTRAL_8X22B,
    },
    "moonshotai": {
        "kimi-k2-instruct": Model.KIMI_K2_INSTRUCT,
        "kimi-k2-thinking": Model.KIMI_K2_THINKING,
    },
    "nvidia": {
        "gliner-pii": Model.NVIDIA_GLINER_PII,
        "llama-3.1-nemoguard-8b-content-safety": Model.NVIDIA_NEMOGUARD_8B_SAFETY,
        "llama-3.1-nemoguard-8b-topic-control": Model.NVIDIA_NEMOGUARD_8B_TOPIC,
        "nemotron-3-ultra-550b-a55b": Model.NVIDIA_NEMOTRON_3_ULTRA,
        "llama-3.1-nemotron-nano-8b-v1": Model.NVIDIA_NANO_8B_V1,
        "llama-3.1-nemotron-safety-guard-8b-v3": Model.NVIDIA_SAFETY_GUARD_8B_V3,
        "llama-3.3-nemotron-super-49b-v1": Model.NVIDIA_NEMOTRON_SUPER_49B_V1,
        "llama-3.3-nemotron-super-49b-v1.5": Model.NVIDIA_NEMOTRON_SUPER_49B_V1_5,
        "llama-3.1-nemotron-ultra-253b-v1": Model.NVIDIA_NEMOTRON_ULTRA_253B,
        "nemoguard-jailbreak-detect": Model.NVIDIA_NEMOGUARD_JAILBREAK,
        "nemotron-3-nano-30b-a3b": Model.NVIDIA_NEMOTRON_3_NANO,
        "nemotron-3-super-120b-a12b": Model.NVIDIA_NEMOTRON_3_SUPER,
        "nemotron-content-safety-reasoning-4b": Model.NVIDIA_CONTENT_SAFETY_4B,
        "nemotron-mini-4b-instruct": Model.NVIDIA_NEMOTRON_MINI_4B,
        "nvidia-nemotron-nano-9b-v2": Model.NVIDIA_NANO_9B_V2,
        "riva-translate-4b-instruct-v1_1": Model.NVIDIA_RIVA_TRANSLATE_4B,
        "usdcode": Model.NVIDIA_USDCODE,
    },
    "openai": {
        "gpt-oss-20b": Model.OPENAI_GPT_OSS_20B,
        "gpt-oss-120b": Model.OPENAI_GPT_OSS_120B,
    },
    "qwen": {
        "qwen2.5-coder-32b-instruct": Model.QWEN_CODER_32B,
        "qwen3.5-122b-a10b": Model.QWEN_3_5_122B,
        "qwen3-coder-480b-a35b-instruct": Model.QWEN_3_CODER_480B,
        "qwen3-next-80b-a3b-instruct": Model.QWEN_3_NEXT_80B,
        "qwen3-next-80b-a3b-thinking": Model.QWEN_3_NEXT_80B_THINKING,
        "qwq-32b": Model.QWQ_32B,
    },
    "sarvamai": {
        "sarvam-m": Model.SARVAM_M,
    },
    "stepfun-ai": {
        "step-3-5-flash": Model.STEP_3_5_FLASH,
    },
    "stockmark": {
        "stockmark-2-100b-instruct": Model.STOCKMARK_2_100B,
    },
    "upstage": {
        "solar-10.7b-instruct": Model.UPSTAGE_SOLAR_10_7B,
    },
    "z-ai": {
        "glm4.7": Model.Z_AI_GLM4_7,
        "glm5.1": Model.Z_AI_GLM5_1,
        "glm-5.2": Model.Z_AI_GLM5_2,
    },
}


# ─────────────────────────────────────────────────────────
# 4. NVIDIA CLIENT
# ─────────────────────────────────────────────────────────


class NVIDIAError(Exception):
    """Custom exception for NVIDIA API errors."""
    pass


class NVIDIAStreamChunk:
    """Represents a single streaming chunk from the API."""

    def __init__(self, raw: Dict[str, Any]):
        self.raw = raw
        choices = raw.get("choices", [{}])
        delta = choices[0].get("delta", {}) if choices else {}
        self.content: Optional[str] = delta.get("content")
        self.role: Optional[str] = delta.get("role")
        self.finish_reason: Optional[str] = choices[0].get("finish_reason") if choices else None

    def __repr__(self) -> str:
        return f"NVIDIAStreamChunk(content={self.content!r}, finish={self.finish_reason})"


class NVIDIAResponse:
    """Represents a non-streaming API response."""

    def __init__(self, raw: Dict[str, Any]):
        self.raw = raw
        self.id: str = raw.get("id", "")
        self.object: str = raw.get("object", "")
        self.created: int = raw.get("created", 0)
        self.model: str = raw.get("model", "")
        choices = raw.get("choices", [{}])
        self.text: str = choices[0].get("message", {}).get("content", "") if choices else ""
        self.role: str = choices[0].get("message", {}).get("role", "") if choices else ""
        self.finish_reason: Optional[str] = choices[0].get("finish_reason") if choices else None
        usage = raw.get("usage", {})
        self.prompt_tokens: int = usage.get("prompt_tokens", 0)
        self.completion_tokens: int = usage.get("completion_tokens", 0)
        self.total_tokens: int = usage.get("total_tokens", 0)

    def __repr__(self) -> str:
        return (
            f"NVIDIAResponse(model={self.model!r}, "
            f"text_len={len(self.text)}, "
            f"tokens={self.total_tokens})"
        )


class NVIDIAClient:
    """Pre-configured client for the NVIDIA LLM API.
    
    Args:
        api_key: NVIDIA API key (optional — set NVAPI_KEY env var).
        base_url: Override the default endpoint URL.
        timeout: Request timeout in seconds.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: str = BASE_URL,
        timeout: int = 120,
    ):
        self.base_url = base_url
        self.timeout = timeout
        self.session = requests.Session()

        # Build headers
        self.session.headers.update(DEFAULT_HEADERS)
        key = api_key or os.environ.get("NVAPI_KEY")
        if key:
            self.session.headers["Authorization"] = f"Bearer {key}"

    # ── Public API ──────────────────────────────────────

    def chat(
        self,
        model: str,
        messages: List[Dict[str, str]],
        temperature: float = 1.0,
        top_p: float = 1.0,
        max_tokens: int = 16384,
        seed: int = 42,
        stream: bool = True,
    ) -> Union[Generator[NVIDIAStreamChunk, None, None], NVIDIAResponse]:
        """Send a chat completion request.
        
        Args:
            model: Model identifier string (use ``Model.XXX``).
            messages: List of ``{"role": ..., "content": ...}`` dicts.
            temperature: Sampling temperature (0.0 – 2.0).
            top_p: Nucleus sampling threshold.
            max_tokens: Maximum output tokens.
            seed: Random seed for reproducibility.
            stream: If True, returns a generator of chunks.
        
        Returns:
            Generator of ``NVIDIAStreamChunk`` if stream=True,
            else a single ``NVIDIAResponse`` object.
        """
        payload = self._build_payload(
            model=model,
            messages=messages,
            temperature=temperature,
            top_p=top_p,
            max_tokens=max_tokens,
            seed=seed,
            stream=stream,
        )

        if stream:
            return self._stream(payload)
        else:
            return self._complete(payload)

    def list_models(self) -> Dict[str, Dict[str, str]]:
        """Return the full models registry grouped by provider."""
        return {k: dict(v) for k, v in MODELS_BY_PROVIDER.items()}

    # ── Internals ───────────────────────────────────────

    def _build_payload(
        self,
        model: str,
        messages: List[Dict[str, str]],
        temperature: float,
        top_p: float,
        max_tokens: int,
        seed: int,
        stream: bool,
    ) -> Dict[str, Any]:
        return {k: v for k, v in {
            "model": model,
            "temperature": temperature,
            "top_p": top_p,
            "max_tokens": max_tokens,
            "seed": seed,
            "stream": stream,
            "messages": messages,
        }.items() if v is not None}

    def _stream(self, payload: Dict[str, Any]) -> Generator[NVIDIAStreamChunk, None, None]:
        resp = self.session.post(
            self.base_url,
            json=payload,
            timeout=self.timeout,
            stream=True,
        )
        if not resp.ok:
            raise NVIDIAError(
                f"API error {resp.status_code}: {resp.text}"
            )

        for line in resp.iter_lines():
            if not line:
                continue
            decoded = line.decode("utf-8")
            if decoded.startswith("data: "):
                data_str = decoded[6:].strip()
                if data_str == "[DONE]":
                    break
                try:
                    data = json.loads(data_str)
                    yield NVIDIAStreamChunk(data)
                except json.JSONDecodeError:
                    continue

    def _complete(self, payload: Dict[str, Any]) -> NVIDIAResponse:
        resp = self.session.post(
            self.base_url,
            json=payload,
            timeout=self.timeout,
        )
        if not resp.ok:
            raise NVIDIAError(
                f"API error {resp.status_code}: {resp.text}"
            )
        return NVIDIAResponse(resp.json())


# ─────────────────────────────────────────────────────────
# 5. CONVENIENCE — quick function
# ─────────────────────────────────────────────────────────

def quick_chat(
    prompt: str,
    model: str = Model.Z_AI_GLM5_2,
    api_key: Optional[str] = None,
    **kwargs: Any,
) -> str:
    """One-shot chat: send a single user message and return the full text.
    
    Example:
        reply = quick_chat("Explain quantum computing")
        print(reply)
    """
    client = NVIDIAClient(api_key=api_key)
    response = client.chat(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        stream=False,
        **kwargs,
    )
    return response.text


# ─────────────────────────────────────────────────────────
# 6. CLI USAGE (python nvidia_llm.py)
# ─────────────────────────────────────────────────────────

if __name__ == "__main__":
    import sys

    prompt = " ".join(sys.argv[1:]) or "Say 'Hello, NVIDIA!' in a creative way."

    print(f"Prompt: {prompt}")
    print(f"Model : {Model.Z_AI_GLM5_2}")
    print("-" * 50)

    client = NVIDIAClient()
    for chunk in client.chat(
        model=Model.Z_AI_GLM5_2,
        messages=[{"role": "user", "content": prompt}],
    ):
        if chunk.content:
            print(chunk.content, end="", flush=True)
    print()