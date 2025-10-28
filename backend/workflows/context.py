from typing import Any, Dict, Optional
import re


class ExecutionContext:
    """Stores data passed between nodes during workflow execution"""
    
    def __init__(self):
        self._node_outputs: Dict[str, Any] = {}
        self._global_vars: Dict[str, Any] = {}
    
    def set_node_output(self, node_id: str, data: Any) -> None:
        """Store output from a node"""
        self._node_outputs[node_id] = data
    
    def get_node_output(self, node_id: str) -> Any:
        """Get output from a previous node"""
        return self._node_outputs.get(node_id)
    
    def set_global_var(self, key: str, value: Any) -> None:
        """Set a global variable"""
        self._global_vars[key] = value
    
    def get_global_var(self, key: str) -> Any:
        """Get a global variable"""
        return self._global_vars.get(key)
    
    def resolve_variable(self, expression: str) -> Any:
        """
        Resolve variable like {{node_1.output.id}}
        
        Args:
            expression: Variable expression string
        
        Returns:
            Resolved value or original expression if not found
        """
        if not isinstance(expression, str):
            return expression
        
        # Pattern to match {{...}}
        pattern = r'\{\{([^}]+)\}\}'
        
        def replace_var(match):
            var_path = match.group(1).strip()
            parts = var_path.split('.')
            
            # Check if it's a node output reference
            if parts[0].startswith('node_'):
                node_id = parts[0]
                value = self.get_node_output(node_id)
                
                # Navigate through the remaining path
                for part in parts[1:]:
                    if isinstance(value, dict):
                        value = value.get(part)
                    else:
                        return str(match.group(0))
                    
                    if value is None:
                        return ""
                
                return str(value) if value is not None else ""
            
            # Check if it's a global variable
            elif parts[0] in self._global_vars:
                value = self._global_vars[parts[0]]
                
                for part in parts[1:]:
                    if isinstance(value, dict):
                        value = value.get(part)
                    else:
                        return str(match.group(0))
                    
                    if value is None:
                        return ""
                
                return str(value) if value is not None else ""
            
            return str(match.group(0))
        
        return re.sub(pattern, replace_var, expression)
    
    def resolve_dict_variables(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Recursively resolve variables in a dictionary
        
        Args:
            data: Dictionary with potential variable expressions
        
        Returns:
            Dictionary with resolved variables
        """
        result = {}
        
        for key, value in data.items():
            if isinstance(value, str):
                result[key] = self.resolve_variable(value)
            elif isinstance(value, dict):
                result[key] = self.resolve_dict_variables(value)
            elif isinstance(value, list):
                result[key] = [
                    self.resolve_variable(item) if isinstance(item, str)
                    else self.resolve_dict_variables(item) if isinstance(item, dict)
                    else item
                    for item in value
                ]
            else:
                result[key] = value
        
        return result
    
    def get_final_output(self) -> Dict[str, Any]:
        """Get all node outputs"""
        return self._node_outputs.copy()

