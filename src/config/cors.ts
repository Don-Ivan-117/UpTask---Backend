import {CorsOptions} from 'cors'

export const corsConfig : CorsOptions = {
    origin: function(origin, callback){

        const whiteList = [process.env.FRONTEND_URL]

        // Atrapar argumento y agregar undefined a las lista blanca al levantar el servidor en modo de desarrollo API
        if(process.argv[2] === '--api'){
            whiteList.push(undefined)
        } 

        // Colocamos las URLs validas en el arreglo para poder usar el metodo includes
        if(whiteList.includes(origin)){
            callback(null, true)
        }else{
            callback(new Error ('Error de cors'))
        }
    }
}