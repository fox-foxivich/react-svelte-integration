import React, { useRef, useState, FC } from "react"
import { Component } from "./Component"
import { Context } from "./context"
import "./index.css"

export const App: FC = () => {
  const [a, setA] = useState<number | null>(5)
  const [b, setB] = useState<number | null>(12)
  const [sum, setSum] = useState<number | null>(17)
  const [context, setContext] = useState("This is my custom context")
  const componentRef = useRef<HTMLDivElement | null>(null)

  return (
    <Context.Provider value={context}>
      <h1>I'm in Svelte</h1>
      <Component
        a={a}
        b={b}
        onAChange={setA}
        onBChange={setB}
        sum={sum}
        onSUMChange={setSum}
        // @ts-expect-error
        ref={componentRef}
      />
      <hr />
      <h1>I'm in React</h1>
      <div>a: {a}</div>
      <div>b: {b}</div>
      <div>sum: {sum}</div>
      <div>context: {context}</div>

      <input
        type="text"
        onChange={(event) => {
          setContext(event.currentTarget.value)
        }}
      />

      {/* @ts-expect-error */}
      <button onClick={() => componentRef.current.reset()}>Reset</button>
      {/* @ts-expect-error */}
      <button onClick={() => componentRef.current.random()}>Random</button>
      <button onClick={() => setA((p) => (p ?? 0) + 5)}>a+5</button>
    </Context.Provider>
  )
}
