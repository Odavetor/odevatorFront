'use client'

export {
  fetchPhotoCatalog,
  createPhotoCategory,
  updatePhotoCategory,
  deletePhotoCategory,
  createPhotoOption,
  updatePhotoOption,
  deletePhotoOption,
  uploadImage,
} from '@entities/catalog'
export type {
  PhotoCatalogResponse,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CreateOptionPayload,
  UpdateOptionPayload,
  UploadResponse,
} from '@entities/catalog'
