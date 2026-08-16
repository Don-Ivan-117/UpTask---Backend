import type { Request, Response } from "express";
import User from "../models/User";

export class TeamController {
    static findMemberByEmail = async (req: Request, res: Response) => {
        const {email} = req.body

        // Find User
        const user = await User.findOne({email}).select('_id email name')
        if(!user){
            const error = new Error('Usuario no encontrado')
            res.status(404).json({error: error.message})
        }
        res.json(user)
    }

    static addMemberById = async (req: Request, res: Response) => {
        const { id } = req.body
        res.json({id})
        console.log("Usuario:", id);
    }
}