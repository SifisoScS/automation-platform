from typing import Dict, Any
from workflows.nodes.base_node import BaseNode
from workflows.nodes.http_node import HTTPRequestNode
from workflows.nodes.delay_node import DelayNode
from workflows.nodes.conditional_node import ConditionalNode
from utils.errors import NodeExecutionError


class NodeExecutorFactory:
    """Factory for creating node executors"""
    
    NODE_TYPES = {
        'http_request': HTTPRequestNode,
        'delay': DelayNode,
        'conditional': ConditionalNode,
    }
    
    @classmethod
    def create(cls, node_type: str, node_id: str, config: Dict[str, Any]) -> BaseNode:
        """
        Create a node executor instance
        
        Args:
            node_type: Type of node
            node_id: Unique identifier for the node
            config: Node configuration
        
        Returns:
            Node executor instance
        
        Raises:
            NodeExecutionError: If node type is not supported
        """
        node_class = cls.NODE_TYPES.get(node_type)
        
        if not node_class:
            raise NodeExecutionError(f"Unknown node type: {node_type}")
        
        return node_class(node_id, config)
    
    @classmethod
    def register_node_type(cls, node_type: str, node_class: type):
        """Register a custom node type"""
        cls.NODE_TYPES[node_type] = node_class

