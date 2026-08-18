"""Interfaces between the API and your trained ML models.

Implement the methods below using PyTorch, TensorFlow, ONNX Runtime, or sklearn.
The API intentionally returns 503 while a model is not registered—no synthetic
prediction is returned from production endpoints.
"""
from abc import ABC, abstractmethod

from backend.schemas import CropPrediction, ImagePrediction, SoilInput, SoilPrediction


class ModelUnavailableError(RuntimeError):
    pass


class AgriVisionModelRegistry(ABC):
    @abstractmethod
    def disease(self, image: bytes, filename: str) -> ImagePrediction: ...

    @abstractmethod
    def pest(self, image: bytes, filename: str) -> ImagePrediction: ...

    @abstractmethod
    def severity(self, image: bytes, filename: str) -> ImagePrediction: ...

    @abstractmethod
    def soil(self, values: SoilInput) -> SoilPrediction: ...

    @abstractmethod
    def crop(self, values: SoilInput) -> CropPrediction: ...


class UnconfiguredRegistry(AgriVisionModelRegistry):
    def _missing(self, model_name: str):
        raise ModelUnavailableError(
            f"{model_name} is not configured. Add a trained adapter in backend/models/registry.py "
            "and register it before requesting live predictions."
        )

    def disease(self, image: bytes, filename: str) -> ImagePrediction: self._missing("Disease model")
    def pest(self, image: bytes, filename: str) -> ImagePrediction: self._missing("Pest model")
    def severity(self, image: bytes, filename: str) -> ImagePrediction: self._missing("Severity model")
    def soil(self, values: SoilInput) -> SoilPrediction: self._missing("Soil health model")
    def crop(self, values: SoilInput) -> CropPrediction: self._missing("Crop suitability model")


# Replace this with your implementation, e.g. registry = TorchModelRegistry(...).
registry: AgriVisionModelRegistry = UnconfiguredRegistry()
