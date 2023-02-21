import React, {
  useRef,
  useEffect,
  Dispatch,
  SetStateAction,
  useContext,
  forwardRef,
  useImperativeHandle,
} from "react"
import type { SvelteComponent as SvelteComponentType } from "svelte"
import { bind } from "svelte/internal"
import { writable, Writable } from "svelte/store"
import { Context } from "./context"
import SvelteComponent from "./Component.svelte"

type ComponentProps = {
  a: number | null
  b: number | null
  sum: number | null
  onAChange: Dispatch<SetStateAction<number | null>>
  onBChange: Dispatch<SetStateAction<number | null>>
  onSUMChange: Dispatch<SetStateAction<number | null>>
}

export const Component: React.FC<ComponentProps> = forwardRef((props, ref) => {
  const divRef = useRef<HTMLDivElement | null>(null)
  const contextValue = useContext(Context)
  const storeRef = useRef<Writable<string> | null>(null)
  const componentRef = useRef<SvelteComponentType | null>(null)

  useEffect(() => {
    if (storeRef.current === null) {
      storeRef.current = writable(contextValue)
    } else {
      storeRef.current.set(contextValue)
    }
  }, [storeRef, contextValue])

  useImperativeHandle(
    ref,
    () => {
      const names = Object.getOwnPropertyNames(SvelteComponent.prototype)
      const obj = {}
      for (const name of names) {
        if (name === "constructor" || !name.startsWith("m")) continue

        // @ts-expect-error
        obj[name.slice(1).toLowerCase()] = function (...args) {
          // @ts-expect-error
          componentRef.current[name](...args)
        }
      }

      return obj
    },
    [componentRef]
  )

  useEffect(() => {
    if (divRef.current) {
      const component = new SvelteComponent({
        target: divRef.current,
        props: {
          a: props.a ?? undefined,
          b: props.b ?? undefined,
        },
        context: new Map([["context", storeRef.current]]),
      })

      for (const key of Object.keys(props)) {
        if (!key.startsWith("on") && `on${key.toUpperCase()}Change` in props) {
          bind(component, key, (value: number | null) => {
            try {
              // @ts-expect-error
              props[`on${key.toUpperCase()}Change`](value)
            } catch (error) {
              console.error(error)
            }
          })
        }
      }

      componentRef.current = component

      // component.$on("sum", (event) => {
      //   const sum = event.detail as number | null
      //   props.onSUMChange(sum)
      // })

      // bind(component, "a", (value: number | null) => onAChange(value))
      // bind(component, "b", (value: number | null) => onBChange(value))

      // component.$on("change", (event) => {
      //   const { type, value } = event.detail

      //   if (type === "a") {
      //     onAChange(value)
      //   } else if (type === "b") {
      //     onBChange(value)
      //   }
      // })

      return () => {
        component.$destroy()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [divRef])

  useEffect(() => {
    componentRef.current?.$set(props)
  }, [props])

  return <div ref={divRef} />
})
