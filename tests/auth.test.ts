import request from 'supertest'
import app from '../src/server'

describe('POST /api/auth/create-account', () => {
    it('should return validation errors when body is empty', async () => {
        const response = await request(app) .post('/api/auth/create-account') .send({})

        // console.log('NODE_ENV', process.env.NODE_ENV)
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
    })

    it('should return an error if passwords does not match', async () => {
        const response = await request(app) .post('/api/auth/create-account') .send({
            name : 'Test User',
            email : 'testexample@gmail.com',
            password: '123example456',
            password_confirmation: '456example123'
        })

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    msg:'Los Password no son iguales',
                    path: 'password_confirmation'
                })
            ])
        )
    })

    it('should return an error if password is less than 8 characters', async () => {
        const response = await request(app) .post('/api/auth/create-account') .send({
            name : 'Test User',
            email : 'testexample@gmail.com',
            password: 'example',
            password_confirmation: 'example'
        })

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
    })
    
    it('should return an error is the email is invalid', async () => {
        const response = await request(app)  .post('/api/auth/create-account') .send({
            name : 'Test User',
            email : 'invalid-email',
            password: '123example456',
            password_confirmation: '456example123'
        })

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
    })

    it('should return an error is the name is empty', async () => {
        const response = await request(app) .post('/api/auth/create-account') .send({
            name : '',
            email : 'invalid-email',
            password: '123example456',
            password_confirmation: '456example123'
        })

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
    })

})