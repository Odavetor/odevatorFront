'use client'

export {
  fetchPhotoCatalog,
  fetchVideoCatalog,
  createPhotoCategory,
  updatePhotoCategory,
  deletePhotoCategory,
  createPhotoOption,
  updatePhotoOption,
  deletePhotoOption,
  createVideoScenario,
  updateVideoScenario,
  deleteVideoScenario,
  uploadImage,
} from '@entities/catalog'
export type {
  PhotoCatalogResponse,
  VideoCatalogResponse,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CreateOptionPayload,
  UpdateOptionPayload,
  CreateScenarioPayload,
  UpdateScenarioPayload,
  UploadResponse,
} from '@entities/catalog'
