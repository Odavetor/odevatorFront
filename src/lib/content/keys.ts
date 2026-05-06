// Реестр всех редактируемых строк. Источник правды для:
//   - фронта (фолбэк, если бэк не отвечает или ключ ещё не сохранён в БД)
//   - админки («Тексты»: список того, что вообще можно редактировать)
//
// Чтобы добавить новую строку: 1) запиши ключ + дефолт здесь,
// 2) замени в коде хардкод на useContent('key').

export interface TextSpec {
  key: string
  group: string
  defaultValue: string
  hint?: string
  multiline?: boolean
}

export const TEXT_REGISTRY: TextSpec[] = [
  // — Главная —
  {
    key: 'home.empty.title',
    group: 'Главная',
    defaultValue: 'Здесь появятся ваши обработки',
  },
  {
    key: 'home.empty.body',
    group: 'Главная',
    defaultValue: 'Хранятся 72 часа. Загрузите первое фото — попробуйте любой фильтр.',
    multiline: true,
  },

  // — «Создать» —
  {
    key: 'generate.subtitle',
    group: 'Создать',
    defaultValue: 'ИИ обрабатывает за 30–60 сек',
  },
  {
    key: 'generate.hint.no_file',
    group: 'Создать',
    defaultValue: 'Загрузите фото чтобы начать',
  },
  {
    key: 'generate.hint.no_consent',
    group: 'Создать',
    defaultValue: 'Подтвердите все пункты выше',
  },

  // — Согласия —
  {
    key: 'consent.adult',
    group: 'Согласия',
    defaultValue: 'Мне исполнилось 18 лет',
  },
  {
    key: 'consent.terms',
    group: 'Согласия',
    defaultValue: 'Я принимаю условия использования сервиса',
  },
  {
    key: 'consent.rights',
    group: 'Согласия',
    defaultValue:
      'Я являюсь правообладателем загружаемых материалов и получил согласие изображённых лиц',
    multiline: true,
  },

  // — История —
  {
    key: 'history.disclaimer',
    group: 'История',
    defaultValue: 'Хранятся 3 дня',
  },
]

export const DEFAULT_STRINGS: Record<string, string> = Object.fromEntries(
  TEXT_REGISTRY.map((t) => [t.key, t.defaultValue]),
)

export interface FaqItem {
  id: number
  question: string
  answer: string
  sort_order: number
}

export interface ContentPayload {
  strings: Record<string, string>
  faq: FaqItem[]
}
