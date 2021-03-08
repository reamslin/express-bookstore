process.env.NODE_ENV = "test"

const request = require("supertest");


const app = require("../app");
const db = require("../db");

let book_isbn;

beforeEach(async function () {
    let result = await db.query(`
    INSERT INTO
    books (isbn, amazon_url, author, language, pages, publisher, title, year)
    VALUES (
        '1234',
        'https://amazon.com/test',
        'Lindsey',
        'English',
        4,
        'Penguin',
        'Booky book',
        2021)
        RETURNING isbn`);
    book_isbn = result.rows[0].isbn;
});

describe("POST /books", function () {
    test("Creates a new book", async function () {
        const response = await request(app)
            .post(`/books`)
            .send({
                book: {
                    isbn: '12343',
                    amazon_url: 'https://amazon.com/hello',
                    author: 'Michael Scott',
                    language: 'German',
                    pages: 1,
                    publisher: 'me',
                    title: 'Somehow I Manage',
                    year: 2000
                }
            });
        expect(response.statusCode).toBe(201);
    });

    test("Does not create book with missing information", async function () {
        const response = await request(app)
            .post(`/books`)
            .send({
                book: {
                    isbn: '12343',
                    amazon_url: 'https://amazon.com/hello',
                    author: 'Michael Scott',
                    language: 'German',
                    pages: 1,
                    publisher: 'me',
                    year: 2000
                }
            });
        expect(response.statusCode).toBe(400);
    });
});

describe("PUT /books/:isbn", function () {
    test("Updates a single book", async function () {
        const response = await request(app)
            .put(`/books/${book_isbn}`)
            .send({
                amazon_url: 'https://amazon.com/hello',
                author: 'Michael Scott',
                language: 'German',
                pages: 1,
                publisher: 'me',
                title: 'Somehow I Manage',
                year: 2000
            });
        expect(response.statusCode).toBe(200);
        expect(response.body.book.title).toBe("Somehow I Manage")
    });
    test("Does not update with missing information", async function () {
        const response = await request(app)
            .put(`/books/${book_isbn}`)
            .send({
                amazon_url: 'https://amazon.com/hello',
                author: 'Michael Scott',
                language: 'German',
                pages: 1,
                title: 'Somehow I Manage',
                year: 2000
            });
        expect(response.statusCode).toBe(400);
    });
});

afterEach(async function () {
    await db.query("DELETE FROM BOOKS");
});


afterAll(async function () {
    await db.end()
});
