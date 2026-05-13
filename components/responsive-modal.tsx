'use client'

import * as React from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface ResponsiveModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
  showCloseButton?: boolean
}

export function ResponsiveModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  showCloseButton = true,
}: ResponsiveModalProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className={cn('max-h-[90vh]', className)}>
          <DrawerHeader className="text-right" dir="rtl">
            <DrawerTitle className="text-right">{title}</DrawerTitle>
            {description && (
              <DrawerDescription className="text-right">{description}</DrawerDescription>
            )}
          </DrawerHeader>
          <ScrollArea className="flex-1 overflow-auto px-4">
            <div className="pb-4">{children}</div>
          </ScrollArea>
          {footer && (
            <DrawerFooter className="pt-2">
              {footer}
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn('sm:max-w-[500px] max-h-[90vh] flex flex-col', className)}
        showCloseButton={showCloseButton}
      >
        <DialogHeader className="text-right" dir="rtl">
          <DialogTitle className="text-right">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-right">{description}</DialogDescription>
          )}
        </DialogHeader>
        <ScrollArea className="flex-1 overflow-auto">
          <div className="px-1 pb-4">{children}</div>
        </ScrollArea>
        {footer && (
          <DialogFooter className="flex-row-reverse gap-2 sm:flex-row-reverse">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  variant?: 'default' | 'destructive'
  isLoading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  onConfirm,
  variant = 'default',
  isLoading = false,
}: ConfirmDialogProps) {
  const isMobile = useIsMobile()

  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  const buttons = (
    <>
      <Button
        variant={variant === 'destructive' ? 'destructive' : 'default'}
        onClick={handleConfirm}
        disabled={isLoading}
      >
        {isLoading ? 'جاري...' : confirmText}
      </Button>
      <Button variant="outline" onClick={() => onOpenChange(false)}>
        {cancelText}
      </Button>
    </>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="text-right" dir="rtl">
            <DrawerTitle className="text-right">{title}</DrawerTitle>
            <DrawerDescription className="text-right">{description}</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="flex-row-reverse gap-2">
            {buttons}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="text-right" dir="rtl">
          <DialogTitle className="text-right">{title}</DialogTitle>
          <DialogDescription className="text-right">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row-reverse gap-2 sm:flex-row-reverse">
          {buttons}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
