const mergeClasses = (...classes: (string | undefined)[]) =>
  classes.filter(Boolean).join(" ")

export default mergeClasses
