import express, { Router } from "express";
import { projectController } from "../controllers/ProjectController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { projectExists  } from "../middleware/project";
import { belongsToProject, taskExists } from "../middleware/task";
import { authenticate } from "../middleware/auth";
import { TeamController } from "../controllers/TeamController";

const router: Router = express.Router()

//Aplicar el middleware de authenticate a todos los endpoints que usen "router." (osea todos los que hay y los que se pueden agregar a futuro) 
//authenticate: Middleware que verifica tener un token valido para acceder a la aplicacion y por ende poder crear proyectos
router.use(authenticate)

router.post('/',
    body('projectName')
        .notEmpty().withMessage('El nombre del proyecto es obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El nombre del cliente es obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripcion es obligatoria'),
    handleInputErrors,
    projectController.createProject)
    
router.get('/', projectController.getAllProjects)

router.get('/:id',
    param('id')
        .isMongoId().withMessage('No es un ID valido'),
    handleInputErrors,
    projectController.getProjectByID)

router.put('/:id',
    param('id')
        .isMongoId().withMessage('No es un ID valido'),
    body('projectName')
        .notEmpty().withMessage('El nombre del proyecto es obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El nombre del cliente es obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripcion es obligatoria'),
    handleInputErrors,
    projectController.updateProject)

router.delete('/:id',
    param('id')
        .isMongoId().withMessage('No es un ID valido'),
    handleInputErrors,
    projectController.deleteProject)

// ** Routes for Tasks (dado que las tareas se asignan a proyectos existente, creamos los metodos de tareas en el mismo archivo que el de los proyectos) 

// Crear tareas para un proyecto
router.param('projectId', projectExists) // verificacion en todas las rutas que ocupen un proyecto (:projectId), engloba a todos los endpoints de tareas

router.post('/:projectId/tasks', 
    body('name')
        .notEmpty().withMessage('El nombre de la tarea es obligatoria'),
    body('description')
        .notEmpty().withMessage('La descripcion de la tarea es obligatoria'),
    handleInputErrors,
    TaskController.createTask
)

//Obtener tareas de un proyecto
router.get('/:projectId/tasks',
    TaskController.getProjectTasks
)

router.param('taskId', taskExists) // verificacion en todas las rutas que ocupen un proyecto (:projectId) y un Identificador de tareas, engloba unicamente a los ultimos 4 endpoints
router.param('taskId', belongsToProject) // Validacoon de que la tarea pertenezca al proyecto 

// Obtener una tarea especifica de un proyecto
router.get('/:projectId/tasks/:taskId',
    param('taskId')
        .isMongoId().withMessage('No es un ID valido'),
    handleInputErrors,
    TaskController.getTaskById
)

router.put('/:projectId/tasks/:taskId',
    param('taskId')
        .isMongoId().withMessage('No es un ID valido'),
    body('name')
        .notEmpty().withMessage('El nombre de la tarea es obligatoria'),
    body('description')
        .notEmpty().withMessage('La descripcion de la tarea es obligatoria'),
    handleInputErrors,
    TaskController.updateTask
)

router.delete('/:projectId/tasks/:taskId',
        param('taskId')
        .isMongoId().withMessage('No es un ID valido'),
        handleInputErrors,
        TaskController.deleteTask
)

router.post('/:projectId/tasks/:taskId/status',
    param('taskId').isMongoId().withMessage('Id no valido'),
    body('status')
        .notEmpty().withMessage('El estado de la tarea es obligatorio'),
    handleInputErrors,
    TaskController.updateStatus
)

/** Routes for teams */
router.post('/:projectId/team/find',
    body('email')
        .isEmail().toLowerCase().withMessage('E-mail no válido'),
    handleInputErrors,
    TeamController.findMemberByEmail
)

router.post('/:projectId/team',
    body('id')
        .isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    TeamController.addMemberById
)

export default router
