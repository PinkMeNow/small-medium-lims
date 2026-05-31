import { useState } from 'react'
import ChemicalsTable from '../features/chemicals/ChemicalsTable'
import ChemicalForm from '../features/chemicals/ChemicalForm'
import ChemicalQuantityModal from '../features/chemicals/ChemicalQuantityModal'
import type { Chemical } from '../types/chemicals'

export default function Kemikalije() {
  const [quantityChemical, setQuantityChemical] = useState<Chemical | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Kemikalije</h1>
          <p className="text-sm text-muted mt-1">Inventar reagensa i kemikalija</p>
        </div>
        <ChemicalForm />
      </div>

      <ChemicalsTable onUpdateQuantity={setQuantityChemical} />

      <ChemicalQuantityModal
        chemical={quantityChemical}
        onClose={() => setQuantityChemical(null)}
      />
    </div>
  )
}
