import ChemicalsTable from '../features/chemicals/ChemicalsTable'
import ChemicalForm from '../features/chemicals/ChemicalForm'

export default function Kemikalije() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Kemikalije</h1>
          <p className="text-sm text-muted mt-1">Inventar reagensa i kemikalija</p>
        </div>
        <ChemicalForm />
      </div>

      <ChemicalsTable />
    </div>
  )
}
