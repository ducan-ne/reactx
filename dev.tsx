import React from "react"
import ReactDOM from "react-dom/client"
import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import { x } from "./index"

const queryClient = new QueryClient({})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      Hello
      <hr/>
      <x.div x-get="https://httpbin.org/anything" x-id={['test']}>
        Loading...
      </x.div>
      <hr/>
      <x.div x-get="https://httpbin.org/anything" x-id={['test2']} x-interval={20e3}>
        Loading...
      </x.div>
      <hr/>
      <x.button x-invalidate={['test']}>
        Reload
      </x.button>
      <hr/>
      <x.button x-disabled="loading" x-invalidate={['test']} x-post="https://httpbin.org/anything">
        Reload 2
      </x.button>
      <x.div x-indicate={['test']}>Loading ne</x.div>
      <hr/>
      <x.form x-id={['test-form']} x-post="https://httpbin.org/delay/3">
        <input name="test" type="text"/>
        <x.button type="submit" x-disabled={['test-form']}>Submit</x.button>
      </x.form>
      <hr/>
    </QueryClientProvider>
  )
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <App/>
)
