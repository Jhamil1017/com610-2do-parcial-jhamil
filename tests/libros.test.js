const request = require('supertest');
const createApp = require('../src/app');

describe('API Catalogo de Libros (Pruebas Unitarias y de Integracion)', () => {
  let librosMock;
  let nextId;
  let app;

  beforeEach(() => {
    librosMock = [
      { id: 1, titulo: 'Redes de Computadoras', autor: 'Andrew Tanenbaum', anio_publicacion: 2012 }
    ];
    nextId = 2;

    // Doble de prueba de la capa de datos (aislado de RDS)
    const mockDb = {
      getAll: jest.fn(async () => librosMock),
      getById: jest.fn(async (id) => librosMock.find((l) => l.id === Number(id)) || null),
      create: jest.fn(async ({ titulo, autor, anio_publicacion }) => {
        const nuevo = { id: nextId++, titulo, autor, anio_publicacion };
        librosMock.push(nuevo);
        return nuevo;
      }),
      update: jest.fn(async (id, data) => {
        const idx = librosMock.findIndex((l) => l.id === Number(id));
        if (idx === -1) return null;
        librosMock[idx] = { id: Number(id), ...data };
        return librosMock[idx];
      }),
      remove: jest.fn(async (id) => {
        const idx = librosMock.findIndex((l) => l.id === Number(id));
        if (idx === -1) return false;
        librosMock.splice(idx, 1);
        return true;
      })
    };

    app = createApp(mockDb);
  });

  test('GET /health responde 200 y estado activo', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('POST /libros crea un libro valido y responde 201', async () => {
    const res = await request(app)
      .post('/libros')
      .send({ titulo: 'Clean Code', autor: 'Robert C. Martin', anio_publicacion: 2008 });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      id: 2,
      titulo: 'Clean Code',
      autor: 'Robert C. Martin',
      anio_publicacion: 2008
    });
  });

  test('POST /libros rechaza datos invalidos con 400', async () => {
    const resVacio = await request(app)
      .post('/libros')
      .send({ titulo: '', autor: 'Autor', anio_publicacion: 2020 });
    expect(resVacio.statusCode).toBe(400);

    const resAnioInvalido = await request(app)
      .post('/libros')
      .send({ titulo: 'Libro', autor: 'Autor', anio_publicacion: 'dos mil' });
    expect(resAnioInvalido.statusCode).toBe(400);
  });

  test('GET /libros/:id responde 404 si el libro no existe', async () => {
    const res = await request(app).get('/libros/999');
    expect(res.statusCode).toBe(404);
  });

  test('PUT y DELETE responden 404 si el libro no existe', async () => {
    const resPut = await request(app)
      .put('/libros/999')
      .send({ titulo: 'X', autor: 'Y', anio_publicacion: 2021 });
    expect(resPut.statusCode).toBe(404);

    const resDel = await request(app).delete('/libros/999');
    expect(resDel.statusCode).toBe(404);
  });
});
