from typing import Any, Dict
import httpx
from workflows.nodes.base_node import BaseNode
from workflows.context import ExecutionContext
from utils.logging import get_logger

logger = get_logger(__name__)


class HTTPRequestNode(BaseNode):
    """Node for making HTTP requests"""
    
    async def execute(self, context: ExecutionContext) -> Any:
        """Execute HTTP request"""
        try:
            # Resolve variables in config
            resolved_config = self.resolve_config_variables(context)
            
            # Extract HTTP parameters
            method = resolved_config.get('method', 'GET').upper()
            url = resolved_config.get('url')
            headers = resolved_config.get('headers', {})
            body = resolved_config.get('body')
            timeout = resolved_config.get('timeout', 30)
            
            if not url:
                raise ValueError("URL is required for HTTP request")
            
            logger.info(f"Node {self.node_id}: Making {method} request to {url}")
            
            # Make HTTP request
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.request(
                    method=method,
                    url=url,
                    headers=headers,
                    json=body if body else None,
                )
            
            # Parse response
            try:
                response_data = response.json()
            except:
                response_data = response.text
            
            result = {
                'status_code': response.status_code,
                'headers': dict(response.headers),
                'body': response_data,
            }
            
            logger.info(f"Node {self.node_id}: HTTP request completed with status {response.status_code}")
            return result
            
        except Exception as e:
            logger.error(f"Node {self.node_id}: HTTP request failed - {str(e)}")
            raise
    
    def validate_config(self) -> bool:
        """Validate HTTP node configuration"""
        required = ['method', 'url']
        return all(k in self.config for k in required)

