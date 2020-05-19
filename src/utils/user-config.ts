export interface UserConfig {
  plugins?: {
    urls?: string[]
  }
  release?: {
    github?: {
      token?: string | null
    }
  }
  sandbox?: {
    urls?: string[]
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
  sandbox: {
    urls: [],
  },
}
