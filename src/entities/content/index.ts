export type {
  FaqItem,
  ContentPayload,
  TextSpec,
  LegalDoc,
  LegalDocMeta,
  LegalSpec,
} from './model/keys'
export { TEXT_REGISTRY, DEFAULT_STRINGS, LEGAL_REGISTRY, LEGAL_SLUG } from './model/keys'
export {
  useContent,
  useFaq,
  refreshContent,
  updateString,
  createFaq,
  updateFaq,
  deleteFaq,
  listLegalDocs,
  getLegalDoc,
  updateLegalDoc,
} from './model/content'
