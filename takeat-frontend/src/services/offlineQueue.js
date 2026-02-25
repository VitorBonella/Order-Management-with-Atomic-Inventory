const QUEUE_KEY = "order_queue";

export function getQueue() {
  return JSON.parse(localStorage.getItem(QUEUE_KEY)) || [];
}

export function saveQueue(queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));

  window.dispatchEvent(new Event("queue_updated"));
}

export function addToQueue(order) {
  const queue = getQueue();
  queue.push({
    id: Date.now(),
    order,
    createdAt: new Date().toISOString()
  });
  saveQueue(queue);
}

export function clearQueue() {
  localStorage.removeItem(QUEUE_KEY);
}