import network from "../../module"

import { schemaResponse as schemaJoinResponse } from "./join"

import * as rtl from "@minsize/rtl"

export const schemaResponse = schemaJoinResponse

type Response = rtl.InferOutput<typeof schemaResponse>

type Options = {}

async function crushState(options: Options) {
  return network.send<Response>("game.crushState", options, { schema: schemaResponse })
}

export default crushState
