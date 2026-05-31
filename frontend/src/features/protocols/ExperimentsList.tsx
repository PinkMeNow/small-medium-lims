import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Button, Spinner, Chip,
  ModalRoot, ModalBackdrop, ModalContainer, ModalDialog,
  ModalHeader, ModalHeading, ModalBody, ModalFooter, ModalCloseTrigger,
  CloseButton, TextField, Label, TextArea,
  useOverlayState,
} from '@heroui/react'
import { CheckCircle, XCircle } from 'lucide-react'
import { getExperiments } from '../../api/protocols.api'
import { useCompleteExperiment } from './hooks'
import ExperimentStatusBadge from './ExperimentStatusBadge'
import type { Experiment } from '../../types/protocols'
import { format } from 'date-fns'
import { hr } from 'date-fns/locale'

function CompleteModal({ experiment, onClose }: { experiment: Experiment | null; onClose: () => void }) {
  const modal = useOverlayState()
  const { mutateAsync, isPending } = useCompleteExperiment()
  const [results, setResults] = useState('')
  const [notes, setNotes] = useState('')
  const [greška, setGreška] = useState('')

  useEffect(() => { if (experiment) modal.open() }, [experiment])

  async function handleSubmit() {
    if (!results.trim()) { setGreška('Rezultati su obavezni.'); return }
    if (!experiment) return
    setGreška('')
    try {
      await mutateAsync({ id: experiment.id, results: results.trim(), notes: notes.trim() || undefined })
      setResults(''); setNotes(''); setGreška('')
      modal.close(); onClose()
    } catch (err: any) {
      setGreška(err?.response?.data?.error?.message ?? 'Greška.')
    }
  }

  function handleClose() { modal.close(); onClose() }

  if (!experiment) return null

  return (
    <ModalRoot state={modal}>
      <ModalBackdrop />
      <ModalContainer size="md" className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <ModalDialog>
          <ModalHeader className="flex items-center justify-between">
            <ModalHeading>Završi eksperiment</ModalHeading>
            <ModalCloseTrigger asChild onClick={handleClose}><CloseButton size="sm" /></ModalCloseTrigger>
          </ModalHeader>
          <ModalBody className="flex flex-col gap-4 py-4">
            <div className="p-3 rounded-xl bg-surface-secondary border border-border">
              <p className="text-xs text-muted">Eksperiment</p>
              <p className="text-sm font-medium text-foreground">{experiment.title}</p>
              <p className="text-xs text-accent mt-0.5">{experiment.protocolName} v{experiment.protocolVersion}</p>
            </div>

            <TextField value={results} onChange={setResults}>
              <Label className="text-sm font-medium text-foreground">Rezultati</Label>
              <TextArea rows={4} placeholder="Unesite rezultate analize..." className="mt-1" />
            </TextField>

            <TextField value={notes} onChange={setNotes}>
              <Label className="text-sm font-medium text-foreground">
                Zaključna napomena <span className="text-muted font-normal">(neobavezno)</span>
              </Label>
              <TextArea rows={2} placeholder="Napomene, preporuke..." className="mt-1" />
            </TextField>

            {greška && <p className="text-sm text-danger">{greška}</p>}
          </ModalBody>
          <ModalFooter className="gap-2">
            <Button variant="outline" onClick={handleClose} isDisabled={isPending}>Odustani</Button>
            <Button variant="primary" onClick={handleSubmit} isDisabled={isPending}>
              {isPending ? <Spinner size="sm" /> : <><CheckCircle size={15} /> Završi eksperiment</>}
            </Button>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </ModalRoot>
  )
}

export default function ExperimentsList() {
  const [toComplete, setToComplete] = useState<Experiment | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['experiments', {}],
    queryFn: () => getExperiments({}),
  })

  if (isLoading) return <div className="flex justify-center py-6"><Spinner /></div>
  if (isError) return <p className="text-sm text-danger py-4">Greška pri učitavanju eksperimenata.</p>
  if (!data?.data.length) return <p className="text-sm text-muted py-4 text-center">Nema zabilježenih eksperimenata.</p>

  return (
    <>
      <div className="flex flex-col divide-y divide-separator rounded-xl border border-border bg-surface overflow-hidden">
        {data.data.map(exp => (
          <div key={exp.id} className="flex items-start gap-4 p-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-foreground truncate">{exp.title}</span>
                <ExperimentStatusBadge status={exp.status} />
              </div>
              <p className="text-xs text-muted mt-0.5">
                {exp.protocolName}
                {exp.protocolVersion && <span className="text-accent ml-1">v{exp.protocolVersion}</span>}
              </p>
              <p className="text-xs text-muted mt-1">
                {exp.operator.firstName} {exp.operator.lastName}
                {' · '}
                {format(new Date(exp.startedAt), 'd. MMM yyyy.', { locale: hr })}
                {exp.completedAt && ` → ${format(new Date(exp.completedAt), 'd. MMM yyyy.', { locale: hr })}`}
              </p>
              {exp.results && (
                <p className="text-xs text-muted mt-1 italic">
                  "{exp.results.slice(0, 100)}{exp.results.length > 100 ? '...' : ''}"
                </p>
              )}
            </div>

            {exp.status === 'in_progress' && (
              <Button
                variant="outline"
                size="sm"
                color="success"
                onClick={() => setToComplete(exp)}
              >
                <CheckCircle size={14} /> Završi
              </Button>
            )}
          </div>
        ))}
      </div>

      <CompleteModal experiment={toComplete} onClose={() => setToComplete(null)} />
    </>
  )
}
