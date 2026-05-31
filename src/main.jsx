import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:          1000 * 60 * 2,  // dados ficam frescos por 2 min
      gcTime:             1000 * 60 * 10, // cache mantido por 10 min
      refetchOnWindowFocus: false,         // não refetch ao trocar de aba
      retry:              1,              // só 1 retry em caso de erro
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
