import re
from typing import Any, Dict


def resolve_variable(expression: str, context: Dict[str, Any]) -> Any:
    """
    Resolve variable expressions like {{node_1.output.id}}
    
    Args:
        expression: Variable expression string
        context: Context dictionary with available variables
    
    Returns:
        Resolved value
    """
    # Pattern to match {{...}}
    pattern = r'\{\{([^}]+)\}\}'
    
    def replace_var(match):
        var_path = match.group(1).strip()
        parts = var_path.split('.')
        
        value = context
        for part in parts:
            if isinstance(value, dict):
                value = value.get(part)
            else:
                return str(match.group(0))  # Return original if can't resolve
            
            if value is None:
                return ""
        
        return str(value) if value is not None else ""
    
    return re.sub(pattern, replace_var, expression)


def resolve_dict_variables(data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    """
    Recursively resolve variables in a dictionary
    
    Args:
        data: Dictionary with potential variable expressions
        context: Context dictionary with available variables
    
    Returns:
        Dictionary with resolved variables
    """
    result = {}
    
    for key, value in data.items():
        if isinstance(value, str):
            result[key] = resolve_variable(value, context)
        elif isinstance(value, dict):
            result[key] = resolve_dict_variables(value, context)
        elif isinstance(value, list):
            result[key] = [
                resolve_variable(item, context) if isinstance(item, str)
                else resolve_dict_variables(item, context) if isinstance(item, dict)
                else item
                for item in value
            ]
        else:
            result[key] = value
    
    return result

