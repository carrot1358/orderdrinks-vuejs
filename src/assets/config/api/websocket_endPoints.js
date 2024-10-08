const websocket_url = import.meta.env.VITE_WEBSOCKET_URL
  ? import.meta.env.VITE_WEBSOCKET_URL
  : "https://backend.nattapad.me";

export const Websocket_URL_Device = websocket_url + "/ws/device/" // :deviceId
export const Websocket_URL_Frontend = websocket_url+"/ws/frontend/" // :userId
