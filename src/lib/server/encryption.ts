import { createCipheriv, createDecipheriv } from 'crypto'
import { env } from '$env/dynamic/private'

// Do not copy this without a good understanding of encryption.
// This is not a good way to encrypt data :)

export function encrypt(text: string) {
  const key = Buffer.from(env.KEY, 'hex')
  const iv = Buffer.from(env.INIT_VECTOR, 'hex')

  const cipher = createCipheriv('aes-256-cbc', key, iv)
  return cipher.update(text, 'utf8', 'hex') + cipher.final('hex')
}

export function decrypt(encryptedText: string) {
  const key = Buffer.from(env.KEY, 'hex')
  const iv = Buffer.from(env.INIT_VECTOR, 'hex')

  const decipher = createDecipheriv('aes-256-cbc', key, iv)

  let text: string | undefined = undefined

  try {
    text = decipher.update(encryptedText, 'hex', 'utf8') + decipher.final('utf8')
  } catch {}

  return text
}
