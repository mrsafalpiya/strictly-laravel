import * as React from "react"

function Progress({ value }: { value: number }) {
  return (
    <div
      data-slot="progress"
      className="h-2 w-full rounded-full bg-primary/20"
      style={{ "--progress": `${value}%` } as React.CSSProperties}
    />
  )
}

export { Progress }
