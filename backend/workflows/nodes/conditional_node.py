from typing import Any, Dict
from workflows.nodes.base_node import BaseNode
from workflows.context import ExecutionContext
from utils.logging import get_logger

logger = get_logger(__name__)


class ConditionalNode(BaseNode):
    """Node for conditional logic (if/else)"""
    
    async def execute(self, context: ExecutionContext) -> Any:
        """Execute conditional logic"""
        try:
            # Resolve variables in config
            resolved_config = self.resolve_config_variables(context)
            
            # Get values to compare
            left_value = context.resolve_variable(resolved_config.get('left_value'))
            right_value = context.resolve_variable(resolved_config.get('right_value'))
            operator = resolved_config.get('operator', '==')
            
            # Evaluate condition
            result = self._evaluate(left_value, operator, right_value)
            
            logger.info(f"Node {self.node_id}: Condition evaluated to {result}")
            
            return {
                'condition_met': result,
                'branch': 'true' if result else 'false',
                'left_value': left_value,
                'right_value': right_value,
                'operator': operator,
            }
            
        except Exception as e:
            logger.error(f"Node {self.node_id}: Conditional evaluation failed - {str(e)}")
            raise
    
    def validate_config(self) -> bool:
        """Validate conditional node configuration"""
        required = ['left_value', 'right_value', 'operator']
        return all(k in self.config for k in required)
    
    def _evaluate(self, left: Any, operator: str, right: Any) -> bool:
        """Evaluate condition"""
        operators = {
            '==': lambda a, b: a == b,
            '!=': lambda a, b: a != b,
            '>': lambda a, b: a > b,
            '<': lambda a, b: a < b,
            '>=': lambda a, b: a >= b,
            '<=': lambda a, b: a <= b,
            'contains': lambda a, b: b in str(a),
            'in': lambda a, b: a in str(b),
        }
        
        if operator not in operators:
            raise ValueError(f"Unknown operator: {operator}")
        
        return operators[operator](left, right)

