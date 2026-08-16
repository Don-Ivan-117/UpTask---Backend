import type {Request, Response, NextFunction} from 'express'
import jwt from "jsonwebtoken"
import User, { IUser } from '../models/User'
import express from 'express';

// Reescribimos el type de req: Request de express para que permita almacenar una variable la cual se usara en otro archivo 
declare global {
    namespace Express {
        interface Request {
            user : IUser
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    // Comprobar la existencia de un token
    const bearer = req.headers.authorization
    if(!bearer){
        const error = new Error('No autorizado')
        return res.status(401).json({error: error.message})
    }

    // Obtener el token
    const [, token] = bearer.split(' ')

    // Validar el token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // Verificar que el usario ligado al token exista en la base de datos
        if(typeof decoded === 'object' && decoded.id){
            const user = await User.findById(decoded.id).select('_id name email')
            if(user){
                // Obviamente req.user no existe de forma nativa, es por eso que debemos redeclarar el type de req, para entre comillas hacer un hueco para nuestra variable
                req.user = user
                next()
            }else{
                res.status(500).json({error: 'Token No Válido'})
            }
            
        }
        console.log(decoded);
    } catch (error) {
        
    }
}