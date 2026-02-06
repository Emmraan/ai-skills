"""Tests for llm_client module."""

import json
from unittest.mock import Mock, patch

import pytest
import requests

from llm_client import LLMClient
from config import Config


class TestLLMClient:
    """Test LLMClient class."""

    @pytest.fixture
    def config(self):
        """Create test config."""
        cfg = Config()
        cfg.llm_base_url = 'http://localhost:8000/v1'
        cfg.llm_model = 'test-model'
        cfg.llm_api_key = 'test-key'
        cfg.llm_send_api_key = True
        return cfg

    @pytest.fixture
    def client(self, config):
        """Create LLMClient instance."""
        return LLMClient(config, verbose=False)

    @patch('llm_client.requests.post')
    def test_successful_call(self, mock_post, client):
        """Test successful LLM call."""
        mock_response = Mock()
        mock_response.raise_for_status = Mock()
        mock_response.json.return_value = {
            'choices': [{'message': {'content': 'Test response'}}]
        }
        mock_post.return_value = mock_response

        response = client.call('system prompt', 'user message')

        assert response == 'Test response'
        assert mock_post.called

    @patch('llm_client.requests.post')
    def test_call_with_timeout(self, mock_post, client):
        """Test LLM call respects timeout."""
        mock_response = Mock()
        mock_response.raise_for_status = Mock()
        mock_response.json.return_value = {
            'choices': [{'message': {'content': 'Response'}}]
        }
        mock_post.return_value = mock_response

        client.call('system', 'user', timeout=30)

        # Verify timeout was passed
        assert mock_post.called
        call_kwargs = mock_post.call_args[1]
        assert call_kwargs.get('timeout') == 30

    @patch('llm_client.requests.post')
    def test_call_includes_api_key_when_enabled(self, mock_post, client):
        """Test API key is included in request when enabled."""
        mock_response = Mock()
        mock_response.raise_for_status = Mock()
        mock_response.json.return_value = {
            'choices': [{'message': {'content': 'Response'}}]
        }
        mock_post.return_value = mock_response

        client.config.llm_send_api_key = True
        client.call('system', 'user')

        # Verify headers include Authorization
        assert mock_post.called
        call_kwargs = mock_post.call_args[1]
        headers = call_kwargs.get('headers', {})
        assert 'Authorization' in headers

    @patch('llm_client.requests.post')
    def test_call_excludes_api_key_when_disabled(self, mock_post, client):
        """Test API key is excluded when disabled."""
        mock_response = Mock()
        mock_response.raise_for_status = Mock()
        mock_response.json.return_value = {
            'choices': [{'message': {'content': 'Response'}}]
        }
        mock_post.return_value = mock_response

        client.config.llm_send_api_key = False
        client.call('system', 'user')

        # Verify headers don't include Authorization
        assert mock_post.called
        call_kwargs = mock_post.call_args[1]
        headers = call_kwargs.get('headers', {})
        assert 'Authorization' not in headers

    @patch('llm_client.requests.post')
    def test_json_response_parsing(self, mock_post, client):
        """Test JSON response parsing."""
        test_json = {'name': 'test', 'value': 123}
        mock_response = Mock()
        mock_response.raise_for_status = Mock()
        mock_response.json.return_value = {
            'choices': [{'message': {'content': json.dumps(test_json)}}]
        }
        mock_post.return_value = mock_response

        result = client.generate_json('prompt')

        assert result == test_json

    @patch('llm_client.requests.post')
    def test_json_response_markdown_code_blocks(self, mock_post, client):
        """Test JSON parsing from markdown code blocks."""
        test_json = {'name': 'test', 'value': 123}
        response_text = f'```json\n{json.dumps(test_json)}\n```'
        mock_response = Mock()
        mock_response.raise_for_status = Mock()
        mock_response.json.return_value = {
            'choices': [{'message': {'content': response_text}}]
        }
        mock_post.return_value = mock_response

        result = client.generate_json('prompt')

        assert result == test_json

    @patch('llm_client.requests.post')
    def test_retry_on_failure(self, mock_post, client):
        """Test retry logic with connection errors."""
        # Setup mock to fail with RequestException
        mock_post.side_effect = requests.exceptions.ConnectionError('Connection failed')

        with patch('time.sleep'):
            response = client.call('system', 'user', max_retries=2)

        # Should return None after retries exhausted
        assert response is None

    @patch('llm_client.requests.post')
    def test_max_retries_exceeded(self, mock_post, client):
        """Test that max retries are respected."""
        # All calls fail with connection error
        mock_post.side_effect = requests.exceptions.ConnectionError('Connection failed')

        with patch('time.sleep'):
            response = client.call('system', 'user', max_retries=1)

        # Should return None after max retries
        assert response is None
