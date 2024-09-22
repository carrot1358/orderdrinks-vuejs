import { ref, onMounted, onUnmounted } from 'vue'

export function useWebSocket(url, options = {}) {
  const socket = ref(null)
  const isConnected = ref(false)
  const lastMessage = ref(null)
  const error = ref(null)

  const {
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
    heartbeatInterval = 30000,
    heartbeatMessage = 'ping'
  } = options

  let reconnectAttempts = 0
  let heartbeatTimer = null

  const connect = () => {
    socket.value = new WebSocket(url)

    socket.value.onopen = () => {
      console.log('WebSocket connected')
      isConnected.value = true
      reconnectAttempts = 0
      startHeartbeat()
    }

    socket.value.onclose = (event) => {
      console.log('WebSocket disconnected')
      isConnected.value = false
      stopHeartbeat()

      if (!event.wasClean && reconnectAttempts < maxReconnectAttempts) {
        console.log(`Attempting to reconnect (${reconnectAttempts + 1}/${maxReconnectAttempts})...`)
        setTimeout(() => {
          reconnectAttempts++
          connect()
        }, reconnectInterval)
      }
    }

    socket.value.onmessage = (event) => {
      console.log('Received message:', event.data)
      lastMessage.value = JSON.parse(event.data)
    }

    socket.value.onerror = (err) => {
      console.error('WebSocket error:', err)
      error.value = err
    }
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.close()
    }
    stopHeartbeat()
  }

  const send = (data) => {
    if (isConnected.value) {
      socket.value.send(JSON.stringify(data))
    } else {
      console.error('WebSocket is not connected')
    }
  }

  const startHeartbeat = () => {
    heartbeatTimer = setInterval(() => {
      if (isConnected.value) {
        send(heartbeatMessage)
      }
    }, heartbeatInterval)
  }

  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
    }
  }

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    disconnect()
  })

  return {
    isConnected,
    lastMessage,
    error,
    send,
    connect,
    disconnect
  }
}
