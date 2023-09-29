import { renderToString } from "react-dom/server"
import { x } from "./index"

console.log(renderToString(<x.div x-post="/123123"/>))
console.log(renderToString(<x.input x-post="/123123"/>))
console.log(renderToString(<x.form x-post="/123123"/>))
