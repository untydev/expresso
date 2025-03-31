import helmet from 'helmet'
import hpp from 'hpp'

export function useSecurity (express) {
  express.use(helmet())
  express.use(hpp())
}
