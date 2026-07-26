import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { HttpError } from '../utils'

export const authService = {
  login(username: string, password: string): string {
    const expectedUser = process.env.AUTH_USERNAME
    const expectedHash = process.env.AUTH_PASSWORD_HASH
    const secret = process.env.JWT_SECRET
    if (!expectedUser || !expectedHash || !secret) throw new HttpError(500, 'Auth belum dikonfigurasi')
    if (username !== expectedUser || !bcrypt.compareSync(password, expectedHash)) {
      throw new HttpError(401, 'Username atau password salah')
    }
    return jwt.sign({ sub: username }, secret, { expiresIn: '12h' })
  }
}
