export type { FilterCategory, FilterOption, HeroSample } from './types'
export { PHOTO_FILTER_CATEGORIES } from './model/photo-defaults'
export { HERO_SAMPLES } from './model/hero-samples'
export {
  fetchPhotoCatalog,
  createPhotoCategory,
  updatePhotoCategory,
  deletePhotoCategory,
  createPhotoOption,
  updatePhotoOption,
  deletePhotoOption,
  uploadImage,
} from './api/catalog'
export type {
  PhotoCatalogResponse,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CreateOptionPayload,
  UpdateOptionPayload,
  UploadResponse,
} from './api/catalog'
