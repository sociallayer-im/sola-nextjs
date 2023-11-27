import { walletLogin } from '../../src/stories/mock'

describe('创建Event', () => {
    beforeEach(() => {
        walletLogin()
    })

    it.skip('创建Event入口', () => {
        cy.visit('/event/playground2')

        cy.contains('Create Event')
            .click()

        cy.contains('Cover/Poster')
    })

    it('填写表单', () => {
        cy.visit('/event/playground2/create')

        cy.wait(1000)

        cy.contains('Cover/Poster')

        cy.get('input[placeholder="Event Name"]')
            .type('handle test event ' + new Date().toLocaleString())

        cy.get('.event-location-input div[data-baseweb="select"]')
            .click()

        cy.contains('广轻')
            .click()

        cy.get('.edit-box')
            .type(window.location.href)

        cy.get('textarea.editor.textarea')
            .type('handle test event des' + new Date().toLocaleString())

        cy.get('div[data-testid="input-event-participants"] label')
            .click()

        cy.contains('Select badge')
            .click()

        cy.contains('Choose from you Created')

        cy.get('.dialog-issue-prefill div[data-swiper-slide-index="0"]')
            .click()

        cy.contains('Create Event')
            .click()

        cy.contains('please upload cover')

        cy.wait(2000)

        cy.get('img[data-testid="upload-image"]')
            .click()

        cy.get('#choose-file')
            .selectFile('cypress/fixtures/test_img.png', {force: true})

        cy.get('img[data-testid="upload-image-uploaded"]')

        cy.contains('Create Event')
            .click()

        cy.contains('create success')
    })
})
