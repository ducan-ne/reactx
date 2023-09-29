import type {
  ComponentPropsWithoutRef,
  DetailedHTMLFactory,
  ForwardRefExoticComponent,
  HTMLAttributes,
  PropsWithoutRef,
  ReactHTML,
  Ref,
  RefAttributes
} from "react"
import { forwardRef } from "react"
import { omit } from "lodash-es"
import type { QueryKey } from "@tanstack/react-query"
import { useIsFetching, useIsMutating, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

const htmlElements = [
  "a",
  "abbr",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "bdi",
  "bdo",
  "big",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "keygen",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "menu",
  "menuitem",
  "meta",
  "meter",
  "nav",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "param",
  "picture",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "script",
  "section",
  "select",
  "small",
  "source",
  "span",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "u",
  "ul",
  "var",
  "video",
  "wbr",
  "webview",
] as const
type UnionStringArray<T extends Readonly<string[]>> = T[number]
export type HTMLElements = UnionStringArray<typeof htmlElements>

export type ForwardRefComponent<T, P> = ForwardRefExoticComponent<
  PropsWithoutRef<P> & RefAttributes<T>
>

type UnwrapFactoryAttributes<F> = F extends DetailedHTMLFactory<infer P, any>
  ? P
  : never

type UnwrapFactoryElement<F> = F extends DetailedHTMLFactory<any, infer P>
  ? P
  : never

export type HTMLComponents = {
  [K in HTMLElements]: ForwardRefComponent<
    UnwrapFactoryElement<ReactHTML[K]>,
    HTMLReactXProps<K>
  >
}

type ReactXProps = {
  'x-response-type'?: 'html' | 'rsc'
  'x-reload-trigger'?: ''
  'x-trigger-from'?: ''
  'x-state'?: string
  'x-post'?: string
  'x-get'?: string
  'x-interval'?: number
  'x-disabled'?: 'loading' | 'load' | QueryKey
  'x-id'?: QueryKey
  'x-indicate'?: QueryKey
  'x-invalidate'?: QueryKey | ((data: unknown) => QueryKey)
  'x-confirm'?: string | (() => Promise<boolean>) | (() => boolean)
}

type HTMLAttributesWithoutReactXProps<
  Attributes extends HTMLAttributes<Element>,
  Element extends HTMLElement
> = { [K in Exclude<keyof Attributes, keyof ReactXProps>]?: Attributes[K] }

export type HTMLReactXProps<TagName extends keyof ReactHTML> =
  HTMLAttributesWithoutReactXProps<
    UnwrapFactoryAttributes<ReactHTML[TagName]>,
    UnwrapFactoryElement<ReactHTML[TagName]>
  > &
  ReactXProps

export type CustomDomComponent<Props> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<Props & ReactXProps> &
  React.RefAttributes<SVGElement | HTMLElement>
>

// eslint-disable-next-line @typescript-eslint/ban-types
function custom<Props extends {}>(
  Component: string | React.ComponentType<React.PropsWithChildren<Props>>,
): CustomDomComponent<Props> {
  // eslint-disable-next-line react/display-name
  return forwardRef((props: Props & ReactXProps, ref: Ref<HTMLElement | SVGElement>) => {
    const queryClient = useQueryClient()
    const query = useQuery({
      queryKey: props['x-id'] || [],
      refetchOnWindowFocus: false,
      refetchInterval: props['x-interval'],
      async queryFn() {
        if (!props['x-get']) return null
        const res = await fetch(props['x-get']!)
        const text = await res.text()
        return text
      },
    })
    const mutation = useMutation({
      mutationKey: props['x-id'],
      async mutationFn({ form }: { form?: FormData }) {
        if (!props['x-post']) return null
        const res = await fetch(props['x-post']!, {
          method: 'post',
          body: form
        })
        const text = await res.text()
        return text
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const key = props['x-indicate'] || (Array.isArray(props['x-disabled']) ? props['x-disabled']: []) || []
    const isLoading = useIsFetching({ queryKey: key }) > 0
    const isMutating = useIsMutating({ mutationKey: key, exact: true }) > 0

    const html = props['x-get'] ? query.data : undefined

    const maybeDivOrButtonOrForm = props as ComponentPropsWithoutRef<'button'> & Pick<ComponentPropsWithoutRef<'form'>, 'onSubmit'>

    const invalidate = () => {
      if(props['x-invalidate']) {
        const invalidateKey = typeof props['x-invalidate'] === 'function' ? props['x-invalidate'](mutation.data) : props['x-invalidate']
        queryClient.invalidateQueries(invalidateKey)
      }
    }

    const additionalProps: Partial<typeof maybeDivOrButtonOrForm> = {
      onClick(e) {
        if (Component === 'form') {
          return
        }
        if (props['x-post']) {
          mutation.mutateAsync({})
            .then(invalidate)
        } else if (props['x-invalidate']) {
          invalidate()
        }
        maybeDivOrButtonOrForm.onClick?.(e)
      },
      onSubmit(e) {
        if (props['x-post']) {
          e.preventDefault()
          const form = new FormData(e.currentTarget as HTMLFormElement)
          mutation.mutateAsync({ form })
            .then(invalidate)
        }
      }
    }

    if (Component === 'button') {
      additionalProps.disabled = props['x-disabled'] === 'loading' ? mutation.isLoading : (isLoading || isMutating)
    }

    const willBeRemovedProps = ['x-id']

    if (html) {
      willBeRemovedProps.push('children')
    }

    const refinedProps = { ...omit(props, willBeRemovedProps) as any, ...additionalProps }

    if (props['x-indicate'] && !isLoading) {
      return null
    }

    return (
      <Component
        {...refinedProps}
        dangerouslySetInnerHTML={html ? { __html: html } : undefined}
        ref={ref}
      />
    )
  })
}

const componentCache = new Map<string, any>()

export const x = new Proxy(custom, {
  get: (_target, key: string) => {
    if (!componentCache.has(key)) {
      componentCache.set(key, custom(key))
    }

    return componentCache.get(key)!
  },
}) as typeof custom & HTMLComponents
