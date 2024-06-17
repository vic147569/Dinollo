import { ActionState, FieldErrors } from '@/lib/create-safe-action'
import { useCallback, useState } from 'react'

type Action<TInput, TOutput> = (
  data: TInput
) => Promise<ActionState<TInput, TOutput>>

interface UseActionOption<TOutput> {
  onSuccess?: (data?: TOutput) => void
  onError?: (error: string) => void
  onComplete?: () => void
}

// use when dispatch an action, and check action state, like react-query or interceptor

export const useAction = <TInput, TOutput>(
  action: Action<TInput, TOutput>,
  options: UseActionOption<TOutput> = {}
) => {
  const [error, setError] = useState<string | undefined>(undefined)
  const [data, setData] = useState<TOutput | undefined>(undefined)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [fieldErrors, setFieldErrors] = useState<
    FieldErrors<TInput> | undefined
  >(undefined)

  const execute = useCallback(
    async (input: TInput) => {
      // dispatch action
      setIsLoading(true)

      try {
        const result = await action(input)

        // 1. didnt get res
        if (!result) {
          return
        }

        // 2. field error
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors)
        }

        // 3. unknown error
        if (result.error) {
          setError(result.error)
          options.onError?.(result.error)
        }

        // 4. get result
        if (result.data) {
          setData(result.data)
          options.onSuccess?.(result.data)
        }
      } finally {
        // dispatch end
        setIsLoading(false)
        options.onComplete?.()
      }
    },
    [action, options]
  )
  return {
    execute,
    fieldErrors,
    error,
    data,
    isLoading
  }
}
