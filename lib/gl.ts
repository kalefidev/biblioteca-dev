// Decide se vale rodar 3D neste dispositivo. Só no navegador.
export type Mode3D = 'ok' | 'no-webgl' | 'reduced-motion' | 'weak'

export function detect3D(): Mode3D {
  try {
    const c = document.createElement('canvas')
    if (!(c.getContext('webgl2') || c.getContext('webgl'))) return 'no-webgl'
  } catch {
    return 'no-webgl'
  }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return 'reduced-motion'
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  if (nav.hardwareConcurrency <= 2 || (nav.deviceMemory ?? 8) <= 2 || nav.connection?.saveData) return 'weak'
  return 'ok'
}
