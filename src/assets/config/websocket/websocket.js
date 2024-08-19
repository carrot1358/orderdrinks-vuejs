export default class WebSocketService {
  constructor(url) {
    this.socket = new WebSocket(url)
  }

  onOpen(callback) {
    this.socket.onopen = callback
  }

  onMessage(callback) {
    this.socket.onmessage = callback
  }

  onError(callback) {
    this.socket.onerror = callback
  }

  onClose(callback) {
    this.socket.onclose = callback
  }

  send(data) {
    this.socket.send(JSON.stringify(data))
  }

  close() {
    this.socket.close()
  }
}
