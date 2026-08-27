import request from 'supertest'
import app from '../src/server'

describe('POST /api/auth/create-account', () => {
    it('should return validation errors when body is empty', async () => {
        const response = await request(app) .post('/api/auth/create-account') .send({})

        // console.log('NODE_ENV', process.env.NODE_ENV)
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
    })

})