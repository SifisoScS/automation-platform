from typing import Dict, Any, List
from uuid import UUID
from sqlalchemy.orm import Session
from workflows.context import ExecutionContext
from workflows.executor import NodeExecutorFactory
from workflows.validator import WorkflowValidator
from services.execution_service import ExecutionService
from utils.logging import get_logger
from utils.errors import ExecutionError

logger = get_logger(__name__)


class WorkflowEngine:
    """Engine for executing workflows"""
    
    def __init__(self, workflow_definition: Dict[str, Any], db: Session):
        self.definition = workflow_definition
        self.db = db
        self.nodes = workflow_definition.get('nodes', [])
        self.edges = workflow_definition.get('edges', [])
        self.execution_context = ExecutionContext()
    
    async def execute(self, execution_id: UUID) -> Dict[str, Any]:
        """
        Execute workflow
        
        Args:
            execution_id: Execution ID for logging
        
        Returns:
            Final output from workflow execution
        """
        try:
            # Validate workflow definition
            WorkflowValidator.validate_definition(self.definition)
            
            # Get execution order
            execution_order = WorkflowValidator.get_execution_order(self.nodes, self.edges)
            
            # Update execution status to running
            ExecutionService.update_execution_status(self.db, execution_id, "running")
            
            logger.info(f"Execution {execution_id}: Starting workflow execution")
            
            # Execute each node in order
            for node_id in execution_order:
                node_def = self._get_node(node_id)
                
                try:
                    logger.info(f"Execution {execution_id}: Executing node {node_id}")
                    
                    # Create node executor
                    executor = NodeExecutorFactory.create(
                        node_def['type'],
                        node_id,
                        node_def.get('config', {})
                    )
                    
                    # Validate node config
                    if not executor.validate_config():
                        raise ExecutionError(f"Invalid configuration for node {node_id}")
                    
                    # Execute node
                    result = await executor.execute(self.execution_context)
                    
                    # Store result in context
                    self.execution_context.set_node_output(node_id, result)
                    
                    # Log success
                    ExecutionService.add_execution_log(
                        self.db,
                        execution_id,
                        node_id,
                        "info",
                        f"Node executed successfully",
                        {"result": result}
                    )
                    
                    logger.info(f"Execution {execution_id}: Node {node_id} completed")
                    
                except Exception as e:
                    error_msg = str(e)
                    logger.error(f"Execution {execution_id}: Node {node_id} failed - {error_msg}")
                    
                    # Log error
                    ExecutionService.add_execution_log(
                        self.db,
                        execution_id,
                        node_id,
                        "error",
                        f"Node execution failed: {error_msg}"
                    )
                    
                    # Check if we should continue on error
                    if node_def.get('on_error') == 'continue':
                        logger.info(f"Execution {execution_id}: Continuing after error in node {node_id}")
                        continue
                    else:
                        # Update execution status to failed
                        ExecutionService.update_execution_status(
                            self.db,
                            execution_id,
                            "failed",
                            error_msg
                        )
                        raise ExecutionError(f"Node {node_id} execution failed: {error_msg}")
            
            # Update execution status to success
            final_output = self.execution_context.get_final_output()
            execution = ExecutionService.update_execution_status(self.db, execution_id, "success")
            execution.result_data = final_output
            self.db.commit()
            
            logger.info(f"Execution {execution_id}: Workflow execution completed successfully")
            
            return final_output
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Execution {execution_id}: Workflow execution failed - {error_msg}")
            
            # Update execution status to failed
            ExecutionService.update_execution_status(
                self.db,
                execution_id,
                "failed",
                error_msg
            )
            
            raise ExecutionError(f"Workflow execution failed: {error_msg}")
    
    def _get_node(self, node_id: str) -> Dict[str, Any]:
        """Get node definition by ID"""
        for node in self.nodes:
            if node['id'] == node_id:
                return node
        raise ExecutionError(f"Node {node_id} not found in workflow definition")

