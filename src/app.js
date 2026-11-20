const express = require('express');
const defaultDb = require('./db');

function createApp(db = defaultDb) {
  const app = express();
  app.use(express.json());

  function validarLibro(body) {
    const { titulo, autor, anio_publicacion } = body || {};
    if (typeof titulo !== 'string' || titulo.trim() === '') {
      return 'El campo titulo es obligatorio y no puede estar vacio';
    }
    if (typeof autor !== 'string' || autor.trim() === '') {
      return 'El campo autor es obligatorio y no puede estar vacio';
    }
    if (anio_publicacion === undefined || anio_publicacion === null || !Number.isInteger(Number(anio_publicacion)) || typeof anio_publicacion === 'boolean' || String(anio_publicacion).trim() === '') {
      return 'El campo anio_publicacion debe ser un numero entero valido';
    }
    return null;
  }

  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'api-libros-jhamil-chiltoa',
      version: process.env.APP_VERSION || '1.0.0'
    });
  });

  app.get('/libros', async (req, res) => {
    try {
      const libros = await db.getAll();
      res.status(200).json(libros);
    } catch (err) {
      res.status(500).json({ error: 'Error al consultar libros', detalle: err.message });
    }
  });

  app.get('/libros/:id', async (req, res) => {
    try {
      const libro = await db.getById(req.params.id);
      if (!libro) return res.status(404).json({ error: 'Libro no encontrado' });
      res.status(200).json(libro);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener el libro', detalle: err.message });
    }
  });

  app.post('/libros', async (req, res) => {
    const error = validarLibro(req.body);
    if (error) return res.status(400).json({ error });

    try {
      const nuevo = await db.create({
        titulo: req.body.titulo.trim(),
        autor: req.body.autor.trim(),
        anio_publicacion: Number(req.body.anio_publicacion)
      });
      res.status(201).json(nuevo);
    } catch (err) {
      res.status(500).json({ error: 'Error al crear el libro', detalle: err.message });
    }
  });

  app.put('/libros/:id', async (req, res) => {
    const error = validarLibro(req.body);
    if (error) return res.status(400).json({ error });

    try {
      const actualizado = await db.update(req.params.id, {
        titulo: req.body.titulo.trim(),
        autor: req.body.autor.trim(),
        anio_publicacion: Number(req.body.anio_publicacion)
      });
      if (!actualizado) return res.status(404).json({ error: 'Libro no encontrado' });
      res.status(200).json(actualizado);
    } catch (err) {
      res.status(500).json({ error: 'Error al actualizar el libro', detalle: err.message });
    }
  });

  app.delete('/libros/:id', async (req, res) => {
    try {
      const eliminado = await db.remove(req.params.id);
      if (!eliminado) return res.status(404).json({ error: 'Libro no encontrado' });
      res.status(200).json({ message: 'Libro eliminado correctamente' });
    } catch (err) {
      res.status(500).json({ error: 'Error al eliminar el libro', detalle: err.message });
    }
  });

  return app;
}

module.exports = createApp;
