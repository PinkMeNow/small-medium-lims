import { useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Button, Spinner, Chip, Separator,
  ModalRoot, ModalBackdrop, ModalContainer, ModalDialog,
  ModalHeader, ModalHeading, ModalBody, ModalFooter, ModalCloseTrigger,
  CloseButton, useOverlayState,
} from '@heroui/react'
import { QRCode } from 'react-qr-code'
import { Printer } from 'lucide-react'
import { getSample } from '../../api/samples.api'
import { SAMPLE_STATUS_LABELS } from '../../types/samples'
import type { Sample, SampleStatus } from '../../types/samples'
import { format } from 'date-fns'
import { hr } from 'date-fns/locale'

const STATUS_COLOR: Record<SampleStatus, 'primary' | 'warning' | 'success' | 'default' | 'danger'> = {
  received: 'primary',
  processing: 'warning',
  analysed: 'success',
  archived: 'default',
  destroyed: 'danger',
}

const EVENT_LABELS: Record<string, string> = {
  created: 'Registracija uzorka',
  status_change: 'Promjena statusa',
  note_added: 'Bilješka dodana',
}

interface Props {
  sample: Sample | null
  onClose: () => void
}

export default function SampleDetailModal({ sample, onClose }: Props) {
  const modal = useOverlayState()
  const printRef = useRef<HTMLDivElement>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['sample-detail', sample?.id],
    queryFn: () => getSample(sample!.id),
    enabled: !!sample,
  })

  useEffect(() => { if (sample) modal.open() }, [sample])

  function handleClose() {
    modal.close()
    onClose()
  }

  function handlePrint() {
    const win = window.open('', '_blank', 'width=400,height=300')
    if (!win || !sample) return
    win.document.write(`
      <html><head><title>Naljepnica — ${sample.code}</title>
      <style>
        body{font-family:monospace;text-align:center;padding:24px;background:#fff}
        @media print{@page{margin:10mm}}
      </style></head>
      <body>${printRef.current?.innerHTML ?? ''}</body></html>
    `)
    win.document.close()
    win.print()
    win.close()
  }

  if (!sample) return null

  return (
    <ModalRoot state={modal}>
      <ModalBackdrop />
      <ModalContainer size="lg" className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <ModalDialog className="w-full max-w-2xl">
          <ModalHeader className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ModalHeading className="font-mono">{sample.code}</ModalHeading>
              <Chip color={STATUS_COLOR[sample.status]} size="sm" variant="soft">
                {SAMPLE_STATUS_LABELS[sample.status]}
              </Chip>
            </div>
            <ModalCloseTrigger asChild onClick={handleClose}><CloseButton size="sm" /></ModalCloseTrigger>
          </ModalHeader>

          <ModalBody className="overflow-y-auto max-h-[85vh] sm:max-h-[70vh] flex flex-col gap-5 py-4">
            {/* Info + QR */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex-1 grid grid-cols-2 gap-3">
                {[
                  { label: 'Vrsta', value: sample.type },
                  { label: 'Izvor', value: sample.source },
                  { label: 'Zaprimio/la', value: `${sample.receivedBy.firstName} ${sample.receivedBy.lastName}` },
                  { label: 'Zaprimljeno', value: format(new Date(sample.receivedAt), 'd. MMM yyyy. HH:mm', { locale: hr }) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-muted uppercase tracking-wider">{label}</p>
                    <p className="text-sm text-foreground font-medium mt-0.5">{value}</p>
                  </div>
                ))}
                {sample.notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted uppercase tracking-wider">Bilješka</p>
                    <p className="text-sm text-muted mt-0.5">{sample.notes}</p>
                  </div>
                )}
              </div>

              {/* QR code naljepnica */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div
                  ref={printRef}
                  className="p-3 bg-white rounded-xl border border-border flex flex-col items-center gap-1.5"
                  style={{ fontFamily: 'monospace' }}
                >
                  <QRCode value={sample.code} size={96} />
                  <p style={{ color: '#000', fontWeight: 700, fontSize: 13, margin: 0, letterSpacing: 1 }}>
                    {sample.code}
                  </p>
                  <p style={{ color: '#555', fontSize: 10, margin: 0 }}>
                    {sample.type}
                  </p>
                  <p style={{ color: '#888', fontSize: 9, margin: 0 }}>
                    {format(new Date(sample.receivedAt), 'dd.MM.yyyy', { locale: hr })}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer size={14} /> Ispiši
                </Button>
              </div>
            </div>

            <Separator />

            {/* Event timeline */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Povijest uzorka ({data?.events.length ?? 0} događaja)
              </h3>
              {isLoading ? (
                <div className="flex justify-center py-4"><Spinner size="sm" /></div>
              ) : !data?.events.length ? (
                <p className="text-sm text-muted">Nema zabilježenih događaja.</p>
              ) : (
                <div className="flex flex-col gap-0">
                  {data.events.map((event, i) => (
                    <div key={event.id} className="flex gap-3">
                      {/* Timeline line */}
                      <div className="flex flex-col items-center">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${
                          event.eventType === 'created' ? 'bg-accent' :
                          event.eventType === 'status_change' ? 'bg-success' : 'bg-muted'
                        }`} />
                        {i < (data.events.length - 1) && <div className="w-0.5 flex-1 bg-separator my-1" />}
                      </div>

                      <div className="pb-4 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-foreground">
                            {EVENT_LABELS[event.eventType] ?? event.eventType}
                          </span>
                          {event.newStatus && (
                            <Chip size="sm" color={STATUS_COLOR[event.newStatus as SampleStatus] ?? 'default'} variant="soft">
                              {SAMPLE_STATUS_LABELS[event.newStatus as SampleStatus] ?? event.newStatus}
                            </Chip>
                          )}
                        </div>
                        {event.notes && (
                          <p className="text-xs text-muted mt-0.5">{event.notes}</p>
                        )}
                        <p className="text-xs text-muted/70 mt-1">
                          {event.user ? `${(event.user as any).firstName} ${(event.user as any).lastName}` : '—'}
                          {' · '}
                          {format(new Date(event.createdAt), 'd. MMM yyyy. HH:mm', { locale: hr })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" onClick={handleClose}>Zatvori</Button>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </ModalRoot>
  )
}
