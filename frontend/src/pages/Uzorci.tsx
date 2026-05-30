import SamplesTable from '../features/samples/SamplesTable'
import SampleForm from '../features/samples/SampleForm'

export default function Uzorci() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Uzorci</h1>
          <p className="text-sm text-muted mt-1">Evidencija i praćenje laboratorijskih uzoraka</p>
        </div>
        <SampleForm />
      </div>

      <SamplesTable />
    </div>
  )
}
