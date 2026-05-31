import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import {
  Button, Spinner, Chip, Separator,
  ModalRoot, ModalBackdrop, ModalContainer, ModalDialog,
  ModalHeader, ModalHeading, ModalBody, ModalFooter, ModalCloseTrigger,
  CloseButton, useOverlayState,
} from '@heroui/react'
import { getProtocol } from '../../api/protocols.api'
import type { Protocol } from '../../types/protocols'

interface Props {
  protocol: Protocol | null
  onClose: () => void
}

export default function ProtocolDetailModal({ protocol, onClose }: Props) {
  const modal = useOverlayState()

  useEffect(() => { if (protocol) modal.open() }, [protocol])

  const { data, isLoading } = useQuery({
    queryKey: ['protocol-detail', protocol?.id],
    queryFn: () => getProtocol(protocol!.id),
    enabled: !!protocol,
  })

  const currentVersion = data?.versions?.[0]

  function handleClose() { modal.close(); onClose() }

  if (!protocol) return null

  return (
    <ModalRoot state={modal}>
      <ModalBackdrop />
      <ModalContainer size="lg" className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <ModalDialog className="w-full max-w-2xl">
          <ModalHeader className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <ModalHeading className="truncate">{protocol.name}</ModalHeading>
              <Chip size="sm" variant="soft" color="primary" className="shrink-0">
                v{protocol.currentVersion}
              </Chip>
            </div>
            <Button variant="ghost" isIconOnly size="sm" onClick={handleClose} aria-label="Zatvori"><X size={16} /></Button>
          </ModalHeader>

          <ModalBody className="overflow-y-auto max-h-[72vh] flex flex-col gap-5 py-4">
            {/* Meta */}
            <div className="flex flex-wrap gap-4 text-sm">
              {protocol.category && (
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider">Kategorija</p>
                  <p className="text-foreground font-medium mt-0.5">{protocol.category}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted uppercase tracking-wider">Kreirao/la</p>
                <p className="text-foreground font-medium mt-0.5">
                  {protocol.createdBy.firstName} {protocol.createdBy.lastName}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted uppercase tracking-wider">Eksperimenata</p>
                <p className="text-foreground font-medium mt-0.5">{protocol.experimentCount ?? 0}</p>
              </div>
            </div>

            {protocol.description && (
              <p className="text-sm text-muted">{protocol.description}</p>
            )}

            {isLoading ? (
              <div className="flex justify-center py-6"><Spinner /></div>
            ) : currentVersion ? (
              <>
                <Separator />

                {/* Steps */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    Koraci postupka ({currentVersion.steps.length})
                  </h3>
                  <div className="flex flex-col gap-3">
                    {currentVersion.steps.map(step => (
                      <div key={step.stepNumber} className="flex gap-4 p-4 rounded-xl bg-surface-secondary border border-border">
                        <div className="shrink-0 w-7 h-7 rounded-full bg-accent-soft text-accent flex items-center justify-center text-xs font-bold">
                          {step.stepNumber}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">{step.title}</p>
                          <p className="text-xs text-muted mt-1 leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Materials + Equipment */}
                {((currentVersion.requiredMaterials?.length ?? 0) > 0 || (currentVersion.requiredEquipment?.length ?? 0) > 0) && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(currentVersion.requiredMaterials?.length ?? 0) > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Potrebni materijali</h4>
                          <ul className="flex flex-col gap-1">
                            {currentVersion.requiredMaterials!.map((m, i) => (
                              <li key={i} className="text-sm text-foreground flex items-start gap-2">
                                <span className="text-accent mt-0.5">•</span> {m}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {(currentVersion.requiredEquipment?.length ?? 0) > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Potrebna oprema</h4>
                          <ul className="flex flex-col gap-1">
                            {currentVersion.requiredEquipment!.map((e, i) => (
                              <li key={i} className="text-sm text-foreground flex items-start gap-2">
                                <span className="text-accent mt-0.5">•</span> {e}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Expected results */}
                {currentVersion.expectedResults && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Očekivani rezultati</h4>
                      <p className="text-sm text-foreground bg-surface-secondary border border-border rounded-xl p-3">
                        {currentVersion.expectedResults}
                      </p>
                    </div>
                  </>
                )}
              </>
            ) : (
              <p className="text-sm text-muted">Nema dostupnih detalja za ovaj protokol.</p>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" onClick={handleClose}>Zatvori</Button>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </ModalRoot>
  )
}
