const request = require('supertest');
const express = require('express');
const routeModule = require('../endpoints');
const db = require ('../db.test'); // BDD de test

const app = express();
app.use(express.json());
app.use('/api', routeModule);


describe('Endpoints pour les produits', () => {
    test('GET /api/montantttc/produit - Return all products', async () => {
        const response = await request(app).get('/api/montantttc/produit');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    test('GET /api/produit:id - Doit retourner un produit', async () => {
        const productId = 1;
        const response = await request(app).get(`/api/produit/${productId}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('Id_produit');
        expect(response.body).toHaveProperty('Nom_produit');
        expect(response.body).toHaveProperty('Prix_TTC');
        expect(response.body).toHaveProperty('Stock');
    });

    test('GET /api/categorie/cafe - Doit retourner tous les cafés', async () => {
        const response = await request(app).get('/api/categorie/cafe');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });
});

describe('Endpoints pour les clients', () => {
    test('GET /api/client - Retourner tous les clients', async () => {
        const response = await request(app).get('/api/client');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    test('GET /api/client/:id - Doit retourner un client', async () => {
        const productId = 1;
        const response = await request(app).get(`/api/client/${productId}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('Id_client');
        expect(response.body).toHaveProperty('Nom_client');
        expect(response.body).toHaveProperty('Mail_client');
        expect(response.body).toHaveProperty('Mdp_client');
    });
});

