import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import { TRPCProvider } from "@/providers/trpc"
import { Toaster } from "@/components/ui/sonner"
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TRPCProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(12,16,30,0.98)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#fff",
            },
          }}
        />
      </TRPCProvider>
    </BrowserRouter>
  </StrictMode>,
)
