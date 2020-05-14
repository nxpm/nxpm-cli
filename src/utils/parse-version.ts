export interface ParsedVersion {
  version: string
  isValid: boolean
  isPrerelease: boolean
}

export const parseVersion = (version: string): ParsedVersion => {
  if (!version || !version.length) {
    return {
      version,
      isValid: false,
      isPrerelease: false,
    }
  }
  const sections = version.split('-')
  if (sections.length === 1) {
    /**
     * Not a prerelease version, validate matches exactly the
     * standard {number}.{number}.{number} format
     */
    return {
      version,
      isValid: !!sections[0].match(/\d+\.\d+\.\d+$/),
      isPrerelease: false,
    }
  }
  /**
   * Is a prerelease version, validate each section
   * 1. {number}.{number}.{number} format
   * 2. {alpha|beta|rc}.{number}
   */
  return {
    version,
    isValid: !!(sections[0].match(/\d+\.\d+\.\d+$/) && sections[1].match(/(alpha|beta|rc)\.\d+$/)),
    isPrerelease: true,
  }
}
