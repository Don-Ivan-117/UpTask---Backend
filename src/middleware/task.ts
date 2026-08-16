import type {Request, Response, NextFunction} from 'express'
import Task, { ITask } from '../models/Task'

declare global {
    namespace Express {
        interface Request {
            task: ITask
        }
    }
}

export async function taskExists (req: Request, res: Response, next: NextFunction ) {
    try {
        // Verifica si la tarea existe
        const {taskId} = req.params
        const task = await Task.findById(taskId)

        if(!task){
            const error = new Error('Tarea no encontrada')
            return res.status(404).json({error: error.message})
        }
        
        // Se guarda la informacion de la tarea en el nuevo atributo creado
        req.task = task
        next()

    } catch (error) {
        res.status(500).json({error: 'Hubo un error'})
    }
}

export function belongsToProject(req: Request, res: Response, next: NextFunction){
    // Igualar la comparacion a texto plano en ambos lados con toString().
    if(req.task.project.toString() !== req.project.id.toString()){
        const error = new Error('La tarea no pertenece a este proyecto.')
        return res.status(400).json({error: error.message})
    }
    next()
}