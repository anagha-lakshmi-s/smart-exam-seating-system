const BASE_URL = 'http://localhost:8080/api'

export class ApiError extends Error {
  constructor(message, status, fieldErrors) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors || {}
  }
}

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(BASE_URL + path, {
      method: options.method || 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })
  } catch {
    throw new ApiError('Cannot reach the server. Make sure the backend is running.', 0)
  }

  if (response.status === 204) return null

  const text = await response.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new ApiError(
      data?.message || 'Something went wrong. Please try again.',
      response.status,
      data?.errors
    )
  }
  return data
}

// First field error if there is one, otherwise the general message
export function errorText(error) {
  const first = Object.values(error?.fieldErrors || {})[0]
  return first || error?.message || 'Something went wrong.'
}

function crud(name) {
  return {
    list: () => request(`/${name}`),
    create: (data) => request(`/${name}`, { method: 'POST', body: data }),
    update: (id, data) => request(`/${name}/${id}`, { method: 'PUT', body: data }),
    remove: (id) => request(`/${name}/${id}`, { method: 'DELETE' }),
  }
}

export const studentsApi = crud('students')
export const subjectsApi = crud('subjects')
export const hallsApi = crud('halls')
export const examsApi = crud('exams')

export const seatingApi = {
  slots: () => request('/seating/slots'),
  generate: (body) => request('/seating/generate', { method: 'POST', body }),
  get: (date, startTime) => request(`/seating?date=${date}&startTime=${startTime}`),
  mySeat: (rollNo) => request(`/seating/student/${encodeURIComponent(rollNo)}`),
}