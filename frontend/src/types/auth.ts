export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'lab_technician' | 'viewer'
}

export interface LoginInput {
  email: string
  password: string
}
