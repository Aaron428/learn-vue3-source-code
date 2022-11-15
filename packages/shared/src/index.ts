export const isObject = (value: unknown) =>
  typeof value === 'object' && value !== null

export const extend = Object.assign