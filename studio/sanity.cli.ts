import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'b5z10ias',
    dataset: 'production',
  },
  autoUpdates: true,
})
