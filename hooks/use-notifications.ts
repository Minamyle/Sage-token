"use client"

import { useState, useCallback } from "react"
import type { Toast } from "@/components/notification-toast"

export function useNotifications() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { ...toast, id }])
    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showSuccess = useCallback(
    (title: string, message: string) => {
      addToast({ title, message, type: "success", duration: 3000 })
    },
    [addToast],
  )

  const showError = useCallback(
    (title: string, message: string) => {
      addToast({ title, message, type: "error", duration: 4000 })
    },
    [addToast],
  )

  const showInfo = useCallback(
    (title: string, message: string) => {
      addToast({ title, message, type: "info", duration: 3000 })
    },
    [addToast],
  )

  const showWarning = useCallback(
    (title: string, message: string) => {
      addToast({ title, message, type: "warning", duration: 3500 })
    },
    [addToast],
  )

  return { toasts, addToast, removeToast, showSuccess, showError, showInfo, showWarning }
}
