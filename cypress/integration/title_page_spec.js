//reset database
before(function () {
  cy.log("reset db")
  //clear all data before starting tests
  //cy.request('PUT', 'https://api.mlab.com/api/1/databases/title_uat/collections/titles?apiKey=' + Cypress.env('API_KEY'), {})
  cy.request({
    method: 'PUT',
    url: 'https://api.mlab.com/api/1/databases/title_uat/collections/titles?apiKey=' + Cypress.env('API_KEY'),
    body: {},
    headers: {
        'content-type': 'application/json'
    }
  })
})

describe('The Title Page', function() {
  it('successfully loads', function() {
    cy.visit('/title') // change URL to match your dev URL
  })
  //TODO: check version
})

describe('Adding a Title', function() {
  it('is aided by a suggestion from iMDB when typing', function() {
    cy.get('#newTitle').type('Inception', {delay: 1000}).wait(1000)
  })
  it('can be done by clicking +', function() {
      cy.get('#add').click()
  })
  it('shows a success flash message', function() {
      cy.get('.header').should('be.visible')
      cy.get('.header').should('contain', 'You\'ve added')
  })
  it('results in a new entry in the list', function() {
      cy.contains('Inception')
  })
})

//TODO: currently the suggestion call to omdb might fail, resulting in an exception which isn't caught
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false
})

describe('Marking a Title as seen', function() {
  it('can be done by clicking the checkmark symbol', function() {
      cy.get('#toggleSeenStatusButton').click()
  })
  it('shows the title in the binge history', function(){
      cy.get('div.history.content.name').should('contain', 'Inception')
  })
  it('can be put back to the list by clicking the reload symbol', function(){
      cy.get('#toggleSeenStatusButton').click()
      cy.get('h4').should('contain', 'Inception')
  })
})

describe('Deleting a Title', function() {
  it('can be triggered by clicking the trash symbol', function() {
      cy.get('#deleteButton').click()
      cy.get('#deleteModal').should('be.visible')
  })
  it('can be aborted by saying nope', function() {
      cy.get('#abortDeleteButton').click()
      cy.get('#deleteModal').should('not.be.visible')
      cy.get('.content').should('contain', 'Inception')
  })
  it('can be performed by saying delete', function() {
      //TODO: find out why delete doesn't open with second click in cypress (works manually)
      cy.reload()
      cy.get('#deleteButton').click()
      cy.get('#deleteModalButton').click()
  })
  it('shows a success flash message', function() {
      cy.get('.header').should('be.visible')
      cy.get('.header').should('contain', 'You\'ve deleted')
  })
  it('results in a deleted entry', function() {
      cy.get('.content').should('not.contain', 'Inception')
  })
})