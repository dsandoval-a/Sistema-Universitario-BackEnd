const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/LaboratorioClase', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Conexión a MongoDB exitosa.'))
.catch(err => console.error(err));

app.use(bodyParser.json());

const alumnosController = require('./controllers/AlumnosController.js');
alumnosController(app);
const cursosController = require('./controllers/CursoController.js');
cursosController(app);
const carrerasController = require('./controllers/CarreraController.js');
carrerasController(app);


app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});