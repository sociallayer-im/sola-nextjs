import { walletLogin } from '../../src/stories/mock'

// 生成随机1-5的数字
function randomNum() {
    return Math.floor(Math.random() * 5) + 1
}

const eventSite = [
    '广轻',
    '深圳大学',
    '北京大学',
    '华南理工大学',
    '中大1',
    'beijjing1'
]

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

        cy.get('.time-input-start div[data-baseweb="select"]')
            .click()

        cy.contains('14:00')
            .click()

        cy.get('.time-input-ending div[data-baseweb="select"]')
            .click()

        cy.contains('14:15')
            .click()

        cy.get('.event-location-input div[data-baseweb="select"]')
            .click()

        cy.contains(eventSite[randomNum()])
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

        cy.contains('Share')
    })
})
