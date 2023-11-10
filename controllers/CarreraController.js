// controllers/CarreraController.js

const Carrera = require('../models/Carrera.js');
const IteratorLab = require('./Iterator.js');
// Ruta del archivo que contiene el manejador de eventos
const { carrerasEmitter, emitCarreraUpdate } = require('./Observer.js'); 
module.exports = function(app) {

    //Iterador
    //http://localhost:3000/carrera/codigo/IT09/cursos
    app.get('/carrera/codigo/:codigo/cursos', async (req, res) => {
        try {
            const carrera = await Carrera.findOne({ codigo: req.params.codigo }, { cursos: 1, _id: 0 });
            if (carrera) {
                const cursosIterator = new IteratorLab(carrera.cursos);

                const cursos = [];
                console.log(cursos);
                cursosIterator.each(course => {
                    cursos.push(course);
                });

                res.send(cursos);
            } else {
                res.status(404).send({ message: "Carrera not found" });
            }
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    //http://localhost:3000/carrera/nombre/Ingeniería en Sistemas Computacionales
    app.get('/carrera/nombre/:nombre', async (req, res) => {
        try {
            const carrera = await Carrera.find({ nombre: req.params.nombre });
            res.send(carrera);
        } catch (err) {
            res.status(500).send(err);
        }
    });


    //http://localhost:3000/carrera/codigo/IT09
    app.get('/carrera/codigo/:codigo', async (req, res) => {
     try {
          const carrera = await Carrera.findOne({ codigo: req.params.codigo });
          if (carrera) {
              res.send(carrera);
          } else {
                res.status(404).send({ message: "Carrera not found" });
            }
        } catch (err) {
            res.status(500).send(err);
        }
    }); 

   

    /*
    POST
    http://localhost:3000/carrera/codigo/IT09/agregar-curso
    {
    "codigo": "7",
    "año": 1,
    "ciclo": 2
    }
    */
    
    app.post('/carrera/codigo/:codigo/agregar-curso', async (req, res) => {
        const { codigo, año, ciclo } = req.body;
    
        try {
            const result = await Carrera.updateOne(
                { codigo: req.params.codigo },
                { $push: { cursos: { codigo, año, ciclo } } }
            );
    
            if (result.modifiedCount > 0) {
                res.send({ message: "Course added successfully to Carrera." });
            } else {
                res.status(404).send({ message: "Carrera not found" });
            }
        } catch (err) {
            res.status(500).send(err);
        }
    });

    /*
    DELETE
    http://localhost:3000/carrera/codigo/IT01/quitar-curso/7
    */
    
    app.delete('/carrera/codigo/:codigo/quitar-curso/:cursoCodigo', async (req, res) => {
        try {
            const result = await Carrera.updateOne(
                { codigo: req.params.codigo },
                { $pull: { cursos: { codigo: req.params.cursoCodigo } } }
            );
            
            // Revisar si el documento fue encontrado o modificado. 
            if (result.matchedCount > 0 && result.modifiedCount > 0) {

            // Se notifica a los observadores de que se ha modificado una carrera
                emitCarreraUpdate(req.params.codigo);

                res.send({ message: "Course removed successfully!" });

            } else if (result.matchedCount > 0 && result.modifiedCount === 0) {
                res.status(404).send({ message: "Course not found in this Carrera" });
            } else {
                res.status(404).send({ message: "Carrera not found" });
            }
        } catch (err) {
            res.status(500).send(err);
        }
    });

    //Encontrar Cursos por Carrera y Ciclo

    app.get('/carrera/:carreraCodigo/:ciclo'), async (req, res) => {
        const carreraCodigo = req.param.carreraCodigo;
        const cicloSeleccionado = parseInt(req.param.ciclo);

        try {
            const carrera = await Carrera.findOne({ codigo: carreraCodigo });
            
            if(!carrera) {
                res.status(404).send({ message: "Carrera not found with code ${carreraCodigo}" });
            } else if (!carrera.cursos) {
                res.status(404).send({ message: "Carrera with code ${carreraCodigo} does not have Cursos associated" });
            } else {
                const cursos = carrera.cursos.filter((curso) => curso.ciclo === cicloSeleccionado);
                res.json(cursos);
            }
        } catch(err) {
            res.status(500).send(err);
        }
    }

}
