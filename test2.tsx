import { renderToReadableStream, renderToString } from "react-dom/server"
// @ts-ignore
import RSDWServer from "react-server-dom-webpack/server.node";

// import { App } from "antd"
async function App() {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return (<div>Hello</div>)
}

// @ts-ignore
RSDWServer.renderToPipeableStream(<App/>).pipe(process.stdout)
