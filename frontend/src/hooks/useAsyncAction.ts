import { useState, useCallback } from "react"

interface AsyncActionState {
  isPending: boolean
  isSuccess: boolean
  isError: boolean
}

export function useAsyncAction<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn | Promise<TReturn>
) {
  const [state, setState] = useState<AsyncActionState>({
    isPending: false,
    isSuccess: false,
    isError: false,
  })

  const execute = useCallback(
    async (...args: TArgs) => {
      setState({ isPending: true, isSuccess: false, isError: false })
      try {
        const result = await fn(...args)
        setState({ isPending: false, isSuccess: true, isError: false })
        return result
      } catch (error) {
        setState({ isPending: false, isSuccess: false, isError: true })
        throw error
      }
    },
    [fn]
  )

  return { execute, ...state }
}
