import { useState } from 'react'
import { Separator } from '@heroui/react'
import ProtocolsTable from '../features/protocols/ProtocolsTable'
import ProtocolForm from '../features/protocols/ProtocolForm'
import ExperimentModal from '../features/protocols/ExperimentModal'
import ExperimentsList from '../features/protocols/ExperimentsList'
import ProtocolDetailModal from '../features/protocols/ProtocolDetailModal'
import NewVersionModal from '../features/protocols/NewVersionModal'
import type { Protocol } from '../types/protocols'

export default function Protokoli() {
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null)
  const [detailProtocol, setDetailProtocol] = useState<Protocol | null>(null)
  const [versionProtocol, setVersionProtocol] = useState<Protocol | null>(null)

  return (
    <div className="flex flex-col gap-6">
      {/* SOP protokoli */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Protokoli</h1>
          <p className="text-sm text-muted mt-1">Standardni operativni postupci i evidencija eksperimenata</p>
        </div>
        <ProtocolForm />
      </div>

      <ProtocolsTable
        onRunExperiment={setSelectedProtocol}
        onViewDetail={setDetailProtocol}
        onNewVersion={setVersionProtocol}
      />

      {/* Mount only when protocol selected — ensures ModalBackdrop fully unmounts on close */}
      {selectedProtocol && (
        <ExperimentModal
          protocol={selectedProtocol}
          onClose={() => setSelectedProtocol(null)}
        />
      )}

      <ProtocolDetailModal
        protocol={detailProtocol}
        onClose={() => setDetailProtocol(null)}
      />

      <NewVersionModal
        protocol={versionProtocol}
        onClose={() => setVersionProtocol(null)}
      />

      <Separator />

      {/* Eksperimenti */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Eksperimenti</h2>
        <p className="text-sm text-muted mb-4">Evidencija provedenih eksperimenata</p>
        <ExperimentsList />
      </div>
    </div>
  )
}
