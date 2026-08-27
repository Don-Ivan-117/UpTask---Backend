import colors from 'colors'
import { connectDB } from './config/db'
import app from './server'

const port = process.env.PORT || 4000

const startServer = async () => {
    await connectDB()

    app.listen(4000, () => {
        console.log(colors.cyan.bold(`REST API desde el puerto: ${port}`))
    })
    
}

startServer()
