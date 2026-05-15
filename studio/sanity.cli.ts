import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'b5z10ias',
    dataset: 'production',
  },
  deployment: {
    appId: 'knqru7qytrkfi690hlvgrb3h',
    autoUpdates: true,
  },
})
