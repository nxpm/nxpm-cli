export interface UserConfig {
  plugins?: {
    urls?: string[]
  }
}

export const defaultUserConfig: UserConfig = {
  plugins: {
    urls: [],
  },
}
