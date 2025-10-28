from typing import Any, Dict
import asyncio
from workflows.nodes.base_node import BaseNode
from workflows.context import ExecutionContext
from utils.logging import get_logger

logger = get_logger(__name__)


class DelayNode(BaseNode):
    """Node for delaying execution"""
    
    async def execute(self, context: ExecutionContext) -> Any:
        """Execute delay"""
        try:
            # Resolve variables in config
            resolved_config = self.resolve_config_variables(context)
            
            # Get delay duration in seconds
            delay_seconds = float(resolved_config.get('delay_seconds', 0))
            
            if delay_seconds < 0:
                raise ValueError("Delay must be non-negative")
            
            logger.info(f"Node {self.node_id}: Delaying for {delay_seconds} seconds")
            
            # Sleep for specified duration
            await asyncio.sleep(delay_seconds)
            
            result = {
                'delayed_seconds': delay_seconds,
            }
            
            logger.info(f"Node {self.node_id}: Delay completed")
            return result
            
        except Exception as e:
            logger.error(f"Node {self.node_id}: Delay failed - {str(e)}")
            raise
    
    def validate_config(self) -> bool:
        """Validate delay node configuration"""
        return 'delay_seconds' in self.config

