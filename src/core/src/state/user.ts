import Store from "../../utils/Store"
import core from "src/core"
import network, { socket } from "../api/module"
import { onCleanup, onMount } from "solid-js"

type UserStore = {
  id: number
  app_id: number
  platform: number
  platform_id: number
  access_level: number
  is_premium: boolean
  language: string
  photo_url: string
  first_name: string
  last_name: string
  user_name: string
  is_new: boolean
}

class User extends Store<UserStore> {
  constructor() {
    super({
      id: 0,
      app_id: 0,
      platform: 0,
      platform_id: 0,
      access_level: 0,
      is_premium: false,
      language: "",
      photo_url: "",
      first_name: "",
      last_name: "",
      user_name: "",
      is_new: false,
    })

    onMount(() => {
      const offAuth = network.on("auth", (data) => {
        if (data.error) {
          return
        }
        this.setStore("data", data.response.user)
      })

      onCleanup(() => {
        offAuth()
      })
    })
  }

  get id() {
    return this.data.id
  }
}

export default User
