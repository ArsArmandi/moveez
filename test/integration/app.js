process.env.NODE_ENV = 'test'

var chai = require("chai"),
    chaitHttp = require("chai-http"),
    should = chai.should(),
    app = require("../../app/app.js"),
    mongoose = require("mongoose"),
    Title = require("../../app/models/title")
    
chai.use(chaitHttp)

describe("Moveez integration tests", () => {

    //TODO: should be beforeEach but then I'd need promises :S
    before((done) => {
        //clean database
        Title.collection.drop()
        //prepare database
        var newTitle = new Title({
            name: 'Inception'
        })
        newTitle.save({}, (err) => { 
           done()         
        })     
    })

    describe("Index", () => {
        it("it should show the welcome message", (done) => {
            chai.request(app)
                .get("/")
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
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
                        res.should.have.status(404)
                        res.should.be.json
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
                        res.should.have.status(201)
                        res.should.be.json
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
                        res.should.be.json
                        res.body.should.be.a('array')
                        res.body[0].should.have.property('_id')
                        res.body[0].should.have.property('name')
                        res.body[0].name.should.equal('Inception')
                        done()
                    })
            })
            it("it should GET a title", (done) => {
                var newTitle = new Title({
                    name:"Inception"
                })
                newTitle.save((err, title) => {          
                    chai.request(app)
                        .get("/title/"+title.id)
                        .set('Accept', 'text/json')
                        .end((err, res) => {
                            res.should.have.status(200)
                            res.should.be.json
                            res.body.should.be.a('object')
                            res.body.should.have.property('_id')
                            res.body.should.have.property('name');
                            res.body.name.should.equal('Inception');
                            res.body._id.should.equal(title.id);
                            done();
                        })
                })     
            })
        })
        describe("Update", () => {
            it("it should not PUT an update without name", (done) => {
                chai.request(app)
                    .get("/title")
                    .set('Accept', 'text/json')
                    .end((err, res) => {
                        var updateTitle = {
                            title: {
                                name:""
                            }
                        }
                        chai.request(app)
                            .put("/title/"+res.body[0]._id)
                            .set('Accept', 'text/json')
                            .send(updateTitle)
                            .end((err, res) => {
                                res.should.have.status(400)
                                res.body.should.be.a('object')
                                res.should.have.property('text')
                                res.text.should.be.equal("You need to specify a name and it can't be empty!")
                                done()
                            })
                    }) 
            })
            it("it should PUT an update with ID and name", (done) => {
                chai.request(app)
                    .get("/title")
                    .set('Accept', 'text/json')
                    .end((err, res) => {
                        var updateTitle = {
                            title: {
                                name:"Inception 2"
                            }
                        }
                        chai.request(app)
                            .put("/title/"+res.body[0]._id)
                            .set('Accept', 'text/json')
                            .send(updateTitle)
                            .end((err, res) => {
                                res.should.have.status(200)
                                res.should.be.json
                                res.body.should.be.a('object')
                                res.body.should.have.property("message")
                                res.body.message.should.be.equal("Title successfully updated!")
                                res.body.should.have.property('updatedTitle')
                                res.body.updatedTitle.should.be.a('object')
                                res.body.updatedTitle.should.have.property('name')
                                res.body.updatedTitle.should.have.property('_id')
                                res.body.updatedTitle.name.should.equal('Inception 2')
                                done()
                            })
                    })        
            })
        })
        describe("Delete", () => {
            it("it should DELETE an title with ID", (done) => {
                chai.request(app)
                    .get("/title")
                    .set("Accept", "text/json")
                    .end((err, res) => {
                        chai.request(app)
                            .delete("/title/"+res.body[0]._id)
                            .set("Accept", "text/json")
                            .end((err, res) => {
                                res.should.have.status(200)
                                res.should.be.json
                                res.should.be.a('object')
                                res.body.should.have.property("message")
                                res.body.message.should.be.equal("Title successfully deleted!")
                                res.body.should.have.property('deletedTitle')
                                res.body.deletedTitle.should.be.a('object')
                                res.body.deletedTitle.should.have.property('name')
                                res.body.deletedTitle.should.have.property('_id')
                                res.body.deletedTitle.name.should.equal('Inception 2')
                                done()
                            })
                    })
            })
        })
    })
})