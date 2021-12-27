export interface Option {
  [key: string]: any
}

export interface SchematicCollection {
  name: string
  schematics: Schematic[]
}

export interface Schematic {
  collection: string
  name: string
  description: string
  options: Option[]
}
