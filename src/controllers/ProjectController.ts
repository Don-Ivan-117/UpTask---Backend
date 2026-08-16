import type { Request, Response } from "express";
import Project from "../models/Project";

export class projectController {
    
    static createProject = async (req: Request, res: Response) => {
        const project = new Project(req.body)

        console.log(req.user);
        console.log(req.user.id);

        // Asignar un manager (Este req.user es el que definimos modificando el interface de req en middleware -> auth.ts )
        project.manager = req.user.id

        try {
            await project.save()
            res.send('Proyecto creado correctamente')
        } catch (error) {
            console.log(error);
        }
    }

    static getAllProjects = async (req: Request, res: Response) => {
        try {
            const projects = await Project.find({
                manager: req.user.id
            })
            res.json(projects)
        } catch (error) {
            console.log(error);
        }
    }

    static getProjectByID = async (req: Request, res: Response) => {
        const {id} = req.params

        try {
            const project = await Project.findById(id).populate('tasks')

            if(!project){
                const error = new Error('Proyecto no encontrado')
                return res.status(404).json({error: error.message})
            }

            // Verificar que la persona que quiere acceder al proyecto se quien lo creó
            if(project.manager.toString() !== req.user.id.toString()){
                const error = new Error('Acción no válida (sin autorización)')
                return res.status(404).json({error: error.message})
            }

            res.json(project)
        } catch (error) {
            console.log(error);
        }
    }

    static updateProject = async (req: Request, res: Response) => {
        const {id} = req.params

        try {
            const project = await Project.findById(id)

            if(!project){
                const error = new Error('Proyecto no encontrado')
                return res.status(404).json({error: error.message})
            }

            if(project.manager.toString() !== req.user.id.toString()){
                const error = new Error('Solo el Manager puede actualizar un proyecto')
                return res.status(404).json({error: error.message})
            }

            project.clientName = req.body.clientName
            project.projectName = req.body.projectName
            project.description = req.body.description
            await project.save()
            
            res.send('Proyecto actualizado')
            
        } catch (error) {
            console.log(error);
        }
    }

    static deleteProject = async (req: Request, res: Response) => {
        const {id} = req.params

        try {
            const project = await Project.findById(id)

            if(!project){
                const error = new Error('Proyecto no encontrado')
                return res.status(404).json({error: error.message})
            }

            if(project.manager.toString() !== req.user.id.toString()){
                const error = new Error('Solo el Manager puede eliminar un proyecto')
                return res.status(404).json({error: error.message})
            }

            await project.deleteOne()
            res.send('Proyecto eliminado')
            
        } catch (error) {
            console.log(error);
        }
    }
}