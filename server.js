//importamos el paquete dotenv, para cargar las credenciales de la base de datos desde el archivo .env.
require("dotenv").config();

//Se importan los módulos de Node necesarios para la aplicación.
//Express: módulo que importa el framework de backend Express
//BodyParser: módulo que sirve para analizar datos de solicitudes.
//Mysql: módulo que conecta con la base de datos MySQL.
//Cors: módulo que conecta varios dominios.

const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const cors = require("cors");
const app = express();


// Configuración de middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

//Conexión a la base de datos
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
});

//Conexión a la base de datos y manejo de errores
try {
  db.connect();
  console.log("Conectado correctamentea la base de datos");
} catch (error) {
  console.log("Error al conectarse a la base de datos: " + error);
}

//Definición de rutas

//Ruta de Inicio
app.get("/", (req, res) => {
  res.send("Inicio");
});

//Ruta de Registro de Usuarios. Se reciben los datos del formulario de registro,
//se comprueba que el email no exista ya en la base de datos, si el email no existe,
//se inserta en la base de datos y se envía a la página de login.

app.post("/api/register", (req, res) => {
  const { nombre, email, password } = req.body;
  const queryUsuarios = "SELECT * FROM usuarios WHERE email_usuario = ?";
  db.query(queryUsuarios, [email], (err, results) => {
    if (err) {
      console.log("Error en la consulta: " + err);
      res.status(500).send("Error en el servidor");
    } else if (results.length > 0) {
      res.json({
        status: 1,
        message: "El email ya existe, por favor, use otro",
      });
    } else {
      const insercion =
        "INSERT INTO usuarios (nombre_usuario, email_usuario, password_usuario) VALUES (?, ?, ?)";
      db.query(insercion, [nombre, email, password], (error) => {
        if (error) {
          console.log("Error en el registro: " + error);
          res.status(500).send("Error en el servidor");
        } else {
          res.json({
            status: 2,
            message: "El registro se ha completado satisfactoriamente",
          });
        }
      });
    }
  });
});

// Ruta de Inicio de Sesión. Se reciben los datos del formulario de Login,
// se comprueba que el email y la contraseña existan en la base de datos,
// si los datos son correctos, se envía a la página de inicio.
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const query =
    "SELECT * FROM usuarios WHERE email_usuario = ? AND password_usuario = ?";
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.log("Error en la consulta: " + err);
      res.status(500).send("Error en el server");
    } else if (results.length < 1) {
      res.status(401).send("Email o contraseña incorrecto");
      res.json({ message: "Email o contraseña incorrecto" });
    } else {
      const userId = results[0].id_usuario;
      res.json({ message: "Inicio de sesión exitoso", userId });
    }
  });
});

// Ruta de la lista de la compra. Se reciben los datos de la base de datos.
app.get("/api/lista", (req, res) => {
  db.query("SELECT * FROM lista_compra", (err, results) => {
    if (err) {
      console.error("Error en la consulata a la base de datos " + err);
      res.status(500).send("Error en el servidor");
    } else {
      res.json(results);
    }
  });
});

// Ruta para agregar un elemento a la lista de la compra.
// Se reciben los datos del formulario para agregar un elemento.
// Añade el elemento a la base de datos, con el usuario_id del usuario loggeado.
app.post("/api/lista", (req, res) => {
  const { nombre_lista, usuario_id } = req.body;
  db.query(
    "INSERT INTO lista_compra (nombre_lista,usuario_id) VALUES (?,?)",
    [nombre_lista, usuario_id],
    (err, results) => {
      if (err) {
        console.log("Error al insertar elemento: " + err);
        res.status(500).send("Error en servidor");
      } else {
        res.json({
          message: "Elemento añadido correctamente",
          Id: results.insertId,
        });
      }
    }
  );
});

// Ruta para actualizar un elemento de la lista de la compra, según su id.
// Se reciben los datos de la lista.
// Actualiza el estado del elemento de la base de datos, según su id.
app.put("/api/lista/:id_lista", (req, res) => {
  const { id_lista } = req.params;
  const { completada_lista } = req.body;
  db.query(
    "UPDATE lista_compra SET completada_lista=? WHERE id_lista =?",
    [completada_lista, id_lista],
    (error) => {
      if (error) {
        console.log("Error en el servidor");
        res.status(500).send("Error en el servidor");
      } else {
        res.json({ message: "Elemento actualizado correctamente" });
      }
    }
  );
});

// Ruta para eliminar un elemento de la lista de la compra, según su id.
// Se reciben los datos de la lista.
// Elimina el elemento de la lista según su id.

app.delete("/api/lista/:id_lista", (req, res) => {
  const { id_lista } = req.params;
  db.query("DELETE FROM lista_compra WHERE id_lista=?", [id_lista], (err) => {
    if (err) {
      console.log("Error al eliminar el elemento");
      res.status(500).send("Error en el servidor");
    } else {
      res.json({ message: "Elemento eliminado correctamente" });
    }
  });
});



// Ruta de platos. Se reciben los datos de la base de datos.
app.get("/api/platos", (req, res) => {
  db.query("SELECT * FROM platos", (err, results) => {
    if (err) {
      console.error("Error en la consulata a la base de datos " + err);
      res.status(500).send("Error en el servidor");
    } else {
      res.json(results);
    }
  });
});

// Ruta para obtener un plato según su id.
app.get("/api/platos/:id_plato", (req, res) => {
  const { id_plato } = req.params;
  db.query("SELECT * FROM platos WHERE id_plato = ?",[id_plato], (err, results) => {
    if (err) {
      console.error("Error en la consulata a la base de datos " + err);
      res.status(500).send("Error en el servidor");
    } else {
      res.json(results[0]);
    }
  });
});



// Ruta para agregar un plato. Se reciben los datos del formulario para agregar un elemento.
// Añade el elemento a la base de datos, con el usuario_id del usuario loggeado.
app.post("/api/platos", (req, res) => {
  const {nombre_plato, ingredientes_plato, descripcion_plato, usuario_id } = req.body;
  db.query(
    "INSERT INTO platos (nombre_plato,ingredientes_plato, descripcion_plato, usuario_id) VALUES (?,?,?,?)",
    [nombre_plato, ingredientes_plato, descripcion_plato, usuario_id],
    (err, results) => {
      if (err) {
        console.log("Error al insertar elemento: " + err);
        res.status(500).send("Error en servidor");
      } else {
        res.json({
          message: "Elemento añadido correctamente",
          Id: results.insertId,
        });
      }
    }
  );
});

// Ruta para eliminar un plato, según su id. Se reciben los datos de la lista.
app.delete("/api/platos/:id_plato", (req, res) => {
  const { id_plato } = req.params;
  db.query("DELETE FROM platos WHERE id_plato=?", [id_plato], (err) => {
    if (err) {
      console.log("Error al eliminar el elemento");
      res.status(500).send("Error en el servidor");
    } else {
      res.json({ message: "Elemento eliminado correctamente" });
    }
  });
});

// Ruta para editar un plato, según su id. Se reciben los datos del formulario.
app.put("/api/platos/:id_plato", (req, res) => {
  const { id_plato } = req.params;
  const {nombre_plato,ingredientes_plato, descripcion_plato } = req.body;
  db.query("UPDATE platos SET nombre_plato = ?,ingredientes_plato=?, descripcion_plato =? WHERE id_plato=?", [nombre_plato,ingredientes_plato, descripcion_plato, id_plato], (err) => {
    if (err) {
      console.log("Error al editar el elemento");
      res.status(500).send("Error en el servidor");
    } else {
      res.json({ message: "Elemento editado correctamente" });
    }
  });
});


//Inicio del servidor.
app.listen(process.env.PORT, () => {
  console.log("Servidor levantado");
});
