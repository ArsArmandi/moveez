process.env.NODE_ENV = 'test'

var chai = require("chai"),
    chaitHttp = require("chai-http"),
    app = require("../../app/app.js"),
    should = chai.should(),
    mongoose = require("mongoose"),
    Title = require("../../app/models/title")
    
chai.use(chaitHttp)

describe("Moveez integration tests", () => {
    beforeEach((done) => {
        Title.remove({}, (err) => { 
           done()         
        })     
    })
    describe("Index", () => {
        it("it should show the welcome message", (done) => {
            chai.request(app)
                .get("/")
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.have.property("message").eql("Welcome to mocha test!")
                    done()
            })
        })    
    })
    describe("Titles", () => {
        describe("Create", () => {
            it('it should not POST a title without name', (done) => {
                var body = {
                    title: {}
                }
                chai.request(app)
                    .post('/title')
                    .set('Accept', 'text/json')
                    .send(body)
                    .end((err, res) => {
                        res.should.have.status(200)
                        res.body.should.be.a('object')
                        res.body.should.have.property('errors')
                        res.body.errors.should.have.property('name')
                        res.body.errors.name.should.have.property('kind').eql('required')
                        done();
                })
            }) 
            it("it should POST a title with a name", (done) => {
                var body = {
                    title: {
                        name: "Inception"    
                    }
                }
                chai.request(app)
                    .post("/title")
                    .set('Accept', 'text/json')
                    .send(body)
                    .end((err, res) => {
                        res.should.have.status(200)
                        res.body.should.be.a("object")
                        res.body.should.have.property("message").eql("Title successfully added!")
                        res.body.title.should.have.property("name")
                        res.body.title.should.have.property("_id")
                        res.body.title.should.have.property("createdAt")
                        done()
                })
            }) 
        })
        describe("Read", () => {
            it("it should GET the title list", (done) => {
                chai.request(app)
                    .get("/title")
                    .set('Accept', 'text/json')
                    .end((err, res) => {
                        res.should.have.status(200)
                        res.body.should.be.a('array');
                        res.body.length.should.be.eql(0);
                        done()
                })
            })
            it("it should GET the title from the list", (done) => {
                var title = {
                    name: "Inception"
                }
                var newTitle = new Title(title)
                newTitle.save((err, title) => {          
                    chai.request(app)
                    .get("/title")
                    .set('Accept', 'text/json')
                    .end((err, res) => {
                        res.should.have.status(200)
                        res.body.should.be.a('array');
                        res.body.length.should.not.be.eql(0);
                        res.body[0].should.have.property("name")
                        res.body[0].name.should.be.eql("Inception")
                        done()
                    })
                })     
            })
        })
    })
})