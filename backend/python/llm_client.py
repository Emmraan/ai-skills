"""Provider-agnostic LLM client for Claude, GPT, Gemini, and compatible APIs."""

import json
import time
from typing import Optional
import requests
from config import Config, get_config


class LLMClient:
    """Provider-agnostic LLM client supporting any OpenAI-compatible API."""

    def __init__(self, config: Optional[Config] = None, verbose: bool = False):
        """Initialize LLM client.

        Args:
            config: Configuration object (defaults to global config)
            verbose: Print debug information
        """
        self.config = config or get_config()
        self.verbose = verbose

        if self.verbose:
            print(f'[LLM] Initialized: {self.config.llm_model} @ {self.config.llm_base_url}')

    def call(
        self,
        system_prompt: str,
        user_message: str,
        max_retries: int = 3,
        timeout: int = 60,
    ) -> Optional[str]:
        """Call LLM with provider-agnostic API.

        Args:
            system_prompt: System prompt for context and instructions
            user_message: User message to process
            max_retries: Maximum retry attempts on failure
            timeout: Request timeout in seconds

        Returns:
            LLM response text or None on failure
        """
        headers = {
            'Content-Type': 'application/json',
        }

        # Only add API key if configured to send it
        if self.config.llm_send_api_key and self.config.llm_api_key:
            headers['Authorization'] = f'Bearer {self.config.llm_api_key}'

        payload = {
            'model': self.config.llm_model,
            'messages': [
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_message},
            ],
            'temperature': 0.2,  # Low temp for determinism
            'max_tokens': 4096,
        }

        # Request JSON response format if supported
        if 'claude' in self.config.llm_model.lower():
            payload['response_format'] = {'type': 'json_object'}

        url = f'{self.config.llm_base_url}/chat/completions'

        for attempt in range(max_retries):
            try:
                if self.verbose:
                    print(f'[LLM] Request attempt {attempt + 1}/{max_retries}...')

                response = requests.post(url, json=payload, headers=headers, timeout=timeout)
                response.raise_for_status()

                data = response.json()
                content = data.get('choices', [{}])[0].get('message', {}).get('content', '')

                if self.verbose:
                    print(f'[LLM] Response received ({len(content)} chars)')

                return content

            except requests.exceptions.RequestException as e:
                if self.verbose:
                    print(f'[LLM] Error on attempt {attempt + 1}: {e}')

                if attempt < max_retries - 1:
                    # Exponential backoff: 2s, 4s, 8s
                    backoff = 2 ** attempt
                    if self.verbose:
                        print(f'[LLM] Retrying in {backoff}s...')
                    time.sleep(backoff)
                else:
                    print(f'[LLM] Failed after {max_retries} attempts')
                    return None

        return None

    def generate_json(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_retries: int = 3,
    ) -> Optional[dict]:
        """Call LLM and parse JSON response.

        Args:
            prompt: User prompt
            system_prompt: System prompt (defaults to JSON instruction)
            max_retries: Retry attempts

        Returns:
            Parsed JSON dict or None on failure
        """
        if system_prompt is None:
            system_prompt = (
                'You are a technical documentation expert. '
                'Extract and normalize information into valid JSON. '
                'Return ONLY valid JSON, no markdown or extra text.'
            )

        response = self.call(system_prompt, prompt, max_retries)

        if not response:
            return None

        try:
            # Remove markdown code blocks if present
            if response.startswith('```json'):
                response = response[7:]
            if response.endswith('```'):
                response = response[:-3]

            return json.loads(response.strip())
        except json.JSONDecodeError as e:
            print(f'[LLM] JSON parse error: {e}')
            if self.verbose:
                print(f'[LLM] Raw response: {response[:200]}...')
            return None
