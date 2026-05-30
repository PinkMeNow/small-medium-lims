import { app } from './app'
import { env } from './lib/env'

app.listen(env.PORT, () => {
  console.log(`🔬 LIMS backend pokrenut na portu ${env.PORT} [${env.NODE_ENV}]`)
})
