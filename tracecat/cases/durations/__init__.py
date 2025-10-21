"""Case duration metric models and services."""

from .models import (
    CaseDurationAnchorSelection,
    CaseDurationComputation,
    CaseDurationCreate,
    CaseDurationDefinitionCreate,
    CaseDurationDefinitionRead,
    CaseDurationDefinitionUpdate,
    CaseDurationEventAnchor,
    CaseDurationRead,
    CaseDurationUpdate,
)

__all__ = [
    "CaseDurationAnchorSelection",
    "CaseDurationComputation",
    "CaseDurationCreate",
    "CaseDurationDefinitionCreate",
    "CaseDurationDefinitionRead",
    "CaseDurationDefinitionService",
    "CaseDurationDefinitionUpdate",
    "CaseDurationEventAnchor",
    "CaseDurationRead",
    "CaseDurationService",
    "CaseDurationUpdate",
]


def __getattr__(name: str):
    if name == "CaseDurationService":
        from .service import CaseDurationService

        return CaseDurationService
    if name == "CaseDurationDefinitionService":
        from .service import CaseDurationDefinitionService

        return CaseDurationDefinitionService
    raise AttributeError(name)
