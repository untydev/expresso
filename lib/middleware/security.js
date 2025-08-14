import helmet from 'helmet'
import hpp from 'hpp'

export function useSecurity (context) {
  const { express } = context
  express.use(helmet())
  express.use(hpp())
}
