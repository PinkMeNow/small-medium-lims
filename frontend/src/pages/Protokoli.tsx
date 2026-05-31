import { useState } from 'react'
import ProtocolsTable from '../features/protocols/ProtocolsTable'
import ProtocolForm from '../features/protocols/ProtocolForm'
import ExperimentModal from '../features/protocols/ExperimentModal'
import type { Protocol } from '../types/protocols'

export default function Protokoli() {
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Protokoli</h1>
          <p className="text-sm text-muted mt-1">Standardni operativni postupci i evidencija eksperimenata</p>
        </div>
        <ProtocolForm />
      </div>

      <ProtocolsTable onRunExperiment={setSelectedProtocol} />

      <ExperimentModal
        protocol={selectedProtocol}
        onClose={() => setSelectedProtocol(null)}
      />
    </div>
  )
}
