const getValue = <T extends unknown>(value?: T | (() => T)) => {
  return typeof value === "function" ? (value as Function)() : value
}

export default getValue
