export interface TextSpec {
  key: string
  group: string
  defaultValue: string
  hint?: string
  multiline?: boolean
}

export const TEXT_REGISTRY: TextSpec[] = [
  { key: 'page.title.generate', group: 'Заголовки', defaultValue: 'Создать' },
  { key: 'page.title.history', group: 'Заголовки', defaultValue: 'История' },
  { key: 'page.title.shop', group: 'Заголовки', defaultValue: 'Купи генерации' },
  { key: 'page.title.shop_kicker', group: 'Заголовки', defaultValue: 'Магазин', hint: 'Маленькая надпись над «Купи генерации»' },
  { key: 'page.title.profile', group: 'Заголовки', defaultValue: 'Профиль' },
  { key: 'page.title.admin', group: 'Заголовки', defaultValue: 'Админка' },
  { key: 'page.title.admin_subtitle', group: 'Заголовки', defaultValue: 'Управление каталогом' },

  { key: 'nav.home', group: 'Навигация', defaultValue: 'Главная' },
  { key: 'nav.history', group: 'Навигация', defaultValue: 'История' },
  { key: 'nav.shop', group: 'Навигация', defaultValue: 'Магазин' },
  { key: 'nav.profile', group: 'Навигация', defaultValue: 'Профиль' },
  { key: 'nav.generate', group: 'Навигация', defaultValue: 'Создать' },

  { key: 'button.buy', group: 'Кнопки', defaultValue: 'Купить' },
  { key: 'button.buy_more', group: 'Кнопки', defaultValue: 'Купить ещё' },
  { key: 'button.create', group: 'Кнопки', defaultValue: 'Создать' },
  { key: 'button.create_more', group: 'Кнопки', defaultValue: 'Создать ещё' },
  { key: 'button.create_photo', group: 'Кнопки', defaultValue: 'Создать фото' },
  { key: 'button.cancel', group: 'Кнопки', defaultValue: 'Отмена' },
  { key: 'button.save', group: 'Кнопки', defaultValue: 'Сохранить' },
  { key: 'button.delete', group: 'Кнопки', defaultValue: 'Удалить' },
  { key: 'button.run_ai', group: 'Кнопки', defaultValue: 'Запустить ИИ' },
  { key: 'button.processing', group: 'Кнопки', defaultValue: 'Обработка…' },
  { key: 'button.new_run', group: 'Кнопки', defaultValue: 'Новая обработка' },

  { key: 'home.empty.title', group: 'Главная', defaultValue: 'Здесь появятся ваши обработки' },
  { key: 'home.empty.body', group: 'Главная', defaultValue: 'Хранятся 72 часа. Загрузите первое фото — попробуйте любой фильтр.', multiline: true },

  { key: 'generate.subtitle', group: 'Создать', defaultValue: 'ИИ обрабатывает за 10–20 сек' },
  { key: 'generate.hint.no_file', group: 'Создать', defaultValue: 'Загрузите фото чтобы начать' },
  { key: 'generate.hint.no_consent', group: 'Создать', defaultValue: 'Подтвердите все пункты выше' },
  { key: 'generate.disclaimer', group: 'Создать', defaultValue: '', hint: 'Дисклеймер над согласиями. Если пусто — блок скрыт.', multiline: true },
  { key: 'generate.no_credits', group: 'Создать', defaultValue: 'Нет доступных слотов' },

  { key: 'consent.adult', group: 'Согласия', defaultValue: 'Мне исполнилось 18 лет' },
  { key: 'consent.terms', group: 'Согласия', defaultValue: 'Я принимаю условия использования сервиса' },
  { key: 'consent.rights', group: 'Согласия', defaultValue: 'Я являюсь правообладателем загружаемых материалов и получил согласие изображённых лиц', multiline: true },

  { key: 'history.disclaimer', group: 'История', defaultValue: 'Хранятся 3 дня' },
  { key: 'history.autoremove', group: 'История', defaultValue: 'хранится 72 часа' },
  { key: 'history.end', group: 'История', defaultValue: 'Это всё' },

  { key: 'shop.step.pack', group: 'Магазин', defaultValue: 'Выбери пакет' },
  { key: 'shop.step.method', group: 'Магазин', defaultValue: 'Способ оплаты' },
  { key: 'shop.button.choose_pack', group: 'Магазин', defaultValue: 'Выберите пакет' },
  { key: 'shop.button.choose_method', group: 'Магазин', defaultValue: 'Выберите способ оплаты' },
  { key: 'shop.button.creating', group: 'Магазин', defaultValue: 'Создаём счёт…' },
  { key: 'shop.pending.title', group: 'Магазин', defaultValue: 'Ждём оплату' },
  { key: 'shop.pending.subtitle', group: 'Магазин', defaultValue: 'Оплатите счёт и нажмите «Я оплатил»' },
  { key: 'shop.pending.reopen', group: 'Магазин', defaultValue: 'Открыть счёт ещё раз' },
  { key: 'shop.pending.confirm', group: 'Магазин', defaultValue: 'Я оплатил' },
  { key: 'shop.pending.checking', group: 'Магазин', defaultValue: 'Проверяем…' },
  { key: 'shop.success.title', group: 'Магазин', defaultValue: 'Оплачено' },
  { key: 'shop.tier.standard', group: 'Магазин', defaultValue: 'Стандарт' },
  { key: 'shop.tier.promo', group: 'Магазин', defaultValue: 'Промо · −22%' },
  { key: 'shop.popular_badge', group: 'Магазин', defaultValue: 'популярно' },

  { key: 'error.generation_failed', group: 'Ошибки', defaultValue: 'Ошибка обработки' },
  { key: 'error.timeout', group: 'Ошибки', defaultValue: 'Превышено время ожидания' },
  { key: 'error.payment_init', group: 'Ошибки', defaultValue: 'Ошибка инициализации оплаты' },
  { key: 'error.payment_no_link', group: 'Ошибки', defaultValue: 'Не получили ссылку на оплату' },
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
