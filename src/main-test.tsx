import React from 'react'
import ReactDOM from 'react-dom/client'
import { Button } from "@/components/ui/button"
import './index.css'

function MinimalApp() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test App</h1>
      <Button onClick={() => alert('Working!')}>
        Test Button
      </Button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MinimalApp />
  </React.StrictMode>,
)