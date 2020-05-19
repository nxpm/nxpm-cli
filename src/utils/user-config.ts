export interface UserConfig {
  plugins?: {
    urls?: string[]
  }
  release?: {
    github?: {
      token?: string | null
    }
  }
}

export const defaultUserConfig: UserConfig = {
  plugins: {
    urls: [],
  },
  release: {
    github: {
      token: null,
    },
  },
}
