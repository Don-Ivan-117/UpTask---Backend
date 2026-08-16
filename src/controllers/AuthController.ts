import type { Request, Response } from "express";
import User from "../models/User";
import { checkPassword, hashPassword } from "../utils/auth";
import Token from "../models/Token";
import { generateToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt";

export class AuthController {

    static createAccount = async (req: Request, res: Response) => {
        try {
            const { password, email } = req.body

            //Prevenir duplicados (buscar si el email ya esta asociado a algun usuario)
            const userExists = await User.findOne({email})
            if(userExists){
                const error = new Error("El usuario ya se encuntra registrado")
                return res.status(409).json({error:error.message})
            }

            //  Crear usuario
            const user = new User(req.body)

            // Hash Password 
            user.password = await hashPassword(password)

            // Generar Token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // Enviar Email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])
            res.send("Cuenta creada, revisa tu correo para confirmarla")
        } catch (error) {
            res.status(500).json({error: "Hubo un error al crear la cuenta"})
        }
        
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body

            // Verificar que el token existe
            const tokenExist = await Token.findOne({token})
            if(!tokenExist){
                const error = new Error('Token no válido')
                return res.status(404).json({error: error.message})
            }

            // Buscar al usuario con ese token y confirmar su cuenta
            const user = await User.findById(tokenExist.user)
            user.confirmed = true

            // Guardar los cambios del usuario y eliminar el token
            await Promise.allSettled([ user.save(), tokenExist.deleteOne() ])
            res.send('Cuenta confirmada correctamente')
        } catch (error) {
            res.status(500).json({error: "Hubo un error al crear verificar  el token"})
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            const user = await User.findOne({email})
            if(!user){
                const error = new Error('Usuario no encontrado')
                return res.status(404).json({error: error.message})
            }

            if(!user.confirmed){
                const token = new Token()
                token.user = user.id
                token.token = generateToken()

                await token.save()

                AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
                })

                const error = new Error('La cuenta no ha sido confirmada, confirmala con el email que te enviaremos a continuación')
                return res.status(401).json({error: error.message})
            }
        
            // Revisar password
            const isPasswordCorrect = await checkPassword(password, user.password)
            if(!isPasswordCorrect){
                const error = new Error('Password Incorrecto')
                return res.status(401).json({error: error.message})
            }

            // Generar JWT
            const token = generateJWT({id: user.id})

            res.send(token)
        } catch (error) {
            res.status(500).json({error: "Hubo un error al verificar el token"})
        }
    }

    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            const { email } = req.body
            
            // Verificar que el usuario exista
            const user = await User.findOne({email})
            if(!user){
                const error = new Error("El usuario no esta registrado")
                return res.status(404).json({error:error.message})
            }

            // Si el usuario esta confirmado ya no enviar tokens
            if(user.confirmed){
                const error = new Error("El usuario ya esta confirmado")
                return res.status(403).json({error:error.message})
            }

            // Generar nuevo token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // Enviar email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])
            res.send("Se envió un nuevo token a tu e-mail")
        } catch (error) {
            res.status(500).json({error: "Hubo un error enviar el token"})
        }
        
    }

    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body
            
            // Verificar que el usuario exista
            const user = await User.findOne({email})
            if(!user){
                const error = new Error("Usuario inexistente")
                return res.status(404).json({error:error.message})
            }

            // Generar nuevo token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            await token.save()

            // Enviar email
            AuthEmail.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token
            })

            res.send("Revisa tu email para restablecer tu password")
        } catch (error) {
            res.status(500).json({error: "Hubo un error enviar el token"})
        }
        
    }

    /** Esta función solo valida que el token exista para poder continuar con el proceso de reestablecer la constraseña */
    static validateToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body

            // Verificar que el token existe
            const tokenExist = await Token.findOne({token})
            if(!tokenExist){
                const error = new Error('Token no válido')
                return res.status(404).json({error: error.message})
            }

            res.send('Token válido, define tu nuevo password')

        } catch (error) {
            res.status(500).json({error: "Hubo un error al crear verificar  el token"})
        }
    }

    /** Es en esta funcion donde se elimina el token que genero la función pasada */
    static updatePasswordWithToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.params
            const { password } = req.body

            // Verificar que el token existe
            const tokenExist = await Token.findOne({token})
            if(!tokenExist){
                const error = new Error('Token no válido')
                return res.status(404).json({error: error.message})
            }

            // Usamos el token el cual esta ligado a un usuario para encontrar a dicho usuario
            const user = await User.findById(tokenExist.user)
            user.password = await hashPassword(password)

            await Promise.allSettled([user.save(), tokenExist.deleteOne()])

            res.send('Password modificado correctamente')

        } catch (error) {
            res.status(500).json({error: "Hubo un error al crear verificar  el token"})
        }
    }

    /** Función chiquita para verificar si el usuario esta autenticado y redirigirlo a la vista correspondiente */
    static user = async (req: Request, res: Response) => {
        return res.json(req.user)
    }

}