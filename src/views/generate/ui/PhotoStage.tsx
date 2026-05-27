'use client'

import { AnimatePresence } from 'framer-motion'
import { BeforeAfterPreview } from '@widgets/before-after-preview'
import { PhotoUpload } from '@features/photo-upload'
import { CategoryStepper } from '@widgets/category-stepper'
import type { UsePhotoGenerateResult } from '@features/photo-generate'

interface Props {
  photo: UsePhotoGenerateResult
}

export function PhotoStage({ photo }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <AnimatePresence mode="wait">
        {photo.pickedOption && (
          <BeforeAfterPreview
            key={photo.pickedOption.id}
            beforeUrl={photo.pickedOption.beforeExample}
            afterUrl={photo.pickedOption.afterExample}
            label={photo.pickedOption.label}
          />
        )}
      </AnimatePresence>

      <CategoryStepper
        categories={photo.categories}
        pickedCategoryId={photo.pickedCategoryId}
        pickedOptionId={photo.pickedOption?.id ?? null}
        onSelectOption={photo.selectInCategory}
      />

      <PhotoUpload
        onFile={photo.setFile}
        preview={photo.preview}
        onClear={photo.clearFile}
        compact
      />
    </div>
  )
}
