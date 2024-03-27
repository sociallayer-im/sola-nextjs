import { walletLogin } from '../../src/stories/mock'

describe.skip('Who can create recurring event', () => {
    it('manager 可以创建 recurring event', () => {
        walletLogin()

        cy.visit('/event/seedaobeta/create')

        cy.contains('Does not Repeat').should('exist')
    })

    it('非 manager 不能创建 recurring event', () => {
        window.localStorage.setItem('auth_sola', '[["0x30A9abde88f60d266b76D4E3E8484B101066c49C","eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MjE2OSwiYWRkcmVzc190eXBlIjoid2FsbGV0IiwiaHR0cHM6Ly9oYXN1cmEuaW8vand0L2NsYWltcyI6eyJ4LWhhc3VyYS1kZWZhdWx0LXJvbGUiOiJ1c2VyIiwieC1oYXN1cmEtYWxsb3dlZC1yb2xlcyI6WyJ1c2VyIl0sIngtaGFzdXJhLXVzZXItaWQiOiIyMTY5In19.v312dr-AFA31kOw3oXnEhpKxCLiDOj6m_6kG7FrSLiU"]]')
        window.localStorage.setItem('lastLoginType', 'wallet')
        window.localStorage.setItem('lang', 'en')
        cy.visit('/event/seedaobeta/create')
        cy.contains('account71')

        cy.contains('Does not Repeat').should('not.exist')
    })
})

describe('Create recurring event', () => {
    const eventName = `cypress test recurring event ${Date.now()}`

    it('创建', () => {
        walletLogin()

        cy.visit('/event/seedaobeta/create')

        cy.contains('Does not Repeat').should('exist').click()
        cy.contains('Every Month').should('exist').click()

        cy.get('input[placeholder="Event Name"]').type(eventName)
        cy.contains('Create Event').click()


        cy.visit('/')
        cy.contains(eventName).should('exist')
    })

    it('修改/取消', () => {
        walletLogin()

        cy.visit('/')
        cy.contains('zfd')


        cy.contains(eventName).click()
        cy.contains('Edit').click()
        cy.contains('zfd')

        cy.get('input[placeholder="Event Name"]').should('have.value', eventName)
        cy.contains('Save').click()

        cy.contains('Edit repeat event').should('exist')
        cy.get('.dialog-confirm .btns button:first-child').should('exist').click()

        cy.contains('Cancel Event').click()
        cy.contains('Yes').click()
        cy.contains('Cancel repeat event')
        cy.contains('Not now').click()
    })
})
