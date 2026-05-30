import { Routes, Route } from 'react-router-dom'
import { Button } from '@heroui/react'

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <h1 className="text-3xl font-bold">LIMS</h1>
            <p className="text-default-500">Laboratory Information Management System</p>
            <Button color="primary">Get started</Button>
          </div>
        }
      />
    </Routes>
  )
}

export default App
