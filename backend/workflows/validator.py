from typing import Dict, List, Any
from collections import defaultdict, deque
from utils.errors import ValidationError


class WorkflowValidator:
    """Validator for workflow definitions"""
    
    @staticmethod
    def validate_definition(definition: Dict[str, Any]) -> bool:
        """
        Validate workflow definition structure
        
        Args:
            definition: Workflow definition dictionary
        
        Returns:
            True if valid
        
        Raises:
            ValidationError: If validation fails
        """
        if not isinstance(definition, dict):
            raise ValidationError("Workflow definition must be a dictionary")
        
        if 'nodes' not in definition or 'edges' not in definition:
            raise ValidationError("Workflow definition must contain 'nodes' and 'edges'")
        
        nodes = definition.get('nodes', [])
        edges = definition.get('edges', [])
        
        if not isinstance(nodes, list):
            raise ValidationError("Nodes must be a list")
        
        if not isinstance(edges, list):
            raise ValidationError("Edges must be a list")
        
        if len(nodes) == 0:
            raise ValidationError("Workflow must contain at least one node")
        
        # Validate nodes
        node_ids = set()
        for i, node in enumerate(nodes):
            if not isinstance(node, dict):
                raise ValidationError(f"Node {i} must be a dictionary")
            
            if 'id' not in node or 'type' not in node:
                raise ValidationError(f"Node {i} must have 'id' and 'type'")
            
            node_ids.add(node['id'])
        
        # Validate edges
        for i, edge in enumerate(edges):
            if not isinstance(edge, dict):
                raise ValidationError(f"Edge {i} must be a dictionary")
            
            if 'from' not in edge or 'to' not in edge:
                raise ValidationError(f"Edge {i} must have 'from' and 'to'")
            
            if edge['from'] not in node_ids:
                raise ValidationError(f"Edge {i}: source node '{edge['from']}' not found")
            
            if edge['to'] not in node_ids:
                raise ValidationError(f"Edge {i}: target node '{edge['to']}' not found")
        
        # Check for cycles
        if WorkflowValidator._has_cycle(nodes, edges):
            raise ValidationError("Workflow contains a cycle")
        
        return True
    
    @staticmethod
    def _has_cycle(nodes: List[Dict], edges: List[Dict]) -> bool:
        """
        Check if workflow graph contains a cycle using DFS
        
        Args:
            nodes: List of nodes
            edges: List of edges
        
        Returns:
            True if cycle exists, False otherwise
        """
        # Build adjacency list
        graph = defaultdict(list)
        for edge in edges:
            graph[edge['from']].append(edge['to'])
        
        # Track visited nodes and recursion stack
        visited = set()
        rec_stack = set()
        
        def has_cycle_dfs(node_id):
            visited.add(node_id)
            rec_stack.add(node_id)
            
            for neighbor in graph[node_id]:
                if neighbor not in visited:
                    if has_cycle_dfs(neighbor):
                        return True
                elif neighbor in rec_stack:
                    return True
            
            rec_stack.remove(node_id)
            return False
        
        # Check all nodes
        for node in nodes:
            if node['id'] not in visited:
                if has_cycle_dfs(node['id']):
                    return True
        
        return False
    
    @staticmethod
    def get_execution_order(nodes: List[Dict], edges: List[Dict]) -> List[str]:
        """
        Get topological sort order for node execution
        
        Args:
            nodes: List of nodes
            edges: List of edges
        
        Returns:
            List of node IDs in execution order
        
        Raises:
            ValidationError: If topological sort fails
        """
        # Build adjacency list and in-degree map
        graph = defaultdict(list)
        in_degree = {node['id']: 0 for node in nodes}
        
        for edge in edges:
            graph[edge['from']].append(edge['to'])
            in_degree[edge['to']] += 1
        
        # Kahn's algorithm
        queue = deque([node_id for node_id, degree in in_degree.items() if degree == 0])
        execution_order = []
        
        while queue:
            node_id = queue.popleft()
            execution_order.append(node_id)
            
            for neighbor in graph[node_id]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)
        
        if len(execution_order) != len(nodes):
            raise ValidationError("Cannot determine execution order (cycle detected)")
        
        return execution_order

