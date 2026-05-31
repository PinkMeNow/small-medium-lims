import { app } from './app'
import { env } from './lib/env'
import { startAlertScheduler } from './lib/alerts'

app.listen(env.PORT, () => {
  console.log(`🔬 LIMS backend pokrenut na portu ${env.PORT} [${env.NODE_ENV}]`)
  startAlertScheduler()
})
