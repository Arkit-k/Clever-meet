"use client"

import { Toaster } from 'react-hot-toast'

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Define default options
        className: '',
        duration: 4000,
        style: {
          background: 'hsl(var(--card))',
          color: 'hsl(var(--card-foreground))',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid hsl(var(--border))',
        },
        // Default options for specific types
        success: {
          duration: 3000,
          style: {
            background: '#22C55E',
            color: '#FDFCF8',
          },
          iconTheme: {
            primary: '#FDFCF8',
            secondary: '#22C55E',
          },
        },
        error: {
          duration: 5000,
          style: {
            background: '#DC2626',
            color: '#FDFCF8',
          },
          iconTheme: {
            primary: '#FDFCF8',
            secondary: '#DC2626',
          },
        },
        loading: {
          style: {
            background: '#101010',
            color: '#FDFCF8',
          },
          iconTheme: {
            primary: '#FDFCF8',
            secondary: '#101010',
          },
        },
      }}
    />
  )
}
