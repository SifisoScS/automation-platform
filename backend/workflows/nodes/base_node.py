from abc import ABC, abstractmethod
from typing import Any, Dict
from workflows.context import ExecutionContext


class BaseNode(ABC):
    """Abstract base class for all workflow nodes"""
    
    def __init__(self, node_id: str, config: Dict[str, Any]):
        self.node_id = node_id
        self.config = config
    
    @abstractmethod
    async def execute(self, context: ExecutionContext) -> Any:
        """
        Execute node logic
        
        Args:
            context: Execution context for accessing previous node outputs
        
        Returns:
            Output data from this node
        """
        pass
    
    @abstractmethod
    def validate_config(self) -> bool:
        """
        Validate node configuration
        
        Returns:
            True if config is valid, False otherwise
        """
        pass
    
    def resolve_config_variables(self, context: ExecutionContext) -> Dict[str, Any]:
        """
        Replace variables in config with actual values
        
        Args:
            context: Execution context
        
        Returns:
            Config with resolved variables
        """
        return context.resolve_dict_variables(self.config)

