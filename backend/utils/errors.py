class AutomationPlatformException(Exception):
    """Base exception for automation platform"""
    pass


class WorkflowNotFound(AutomationPlatformException):
    """Raised when workflow is not found"""
    pass


class ExecutionError(AutomationPlatformException):
    """Raised when workflow execution fails"""
    pass


class IntegrationError(AutomationPlatformException):
    """Raised when integration fails"""
    pass


class ValidationError(AutomationPlatformException):
    """Raised when validation fails"""
    pass


class NodeExecutionError(AutomationPlatformException):
    """Raised when node execution fails"""
    pass

