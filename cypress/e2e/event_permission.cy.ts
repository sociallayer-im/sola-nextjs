import { walletLogin } from '../../src/stories/mock'

describe.skip('Home Page', () => {
    it('未登录,首页顶部不显示切换栏', () => {
        window.localStorage.setItem('lang', 'en')

        cy.visit('/')
        cy.contains('Publish Events').should('not.exist')
    })

    it('登录,首页顶部显示切换栏', () => {
        walletLogin()

        cy.visit('/')
        cy.contains('zfd')
        cy.contains('Public Events').should('exist')
    })
})

describe.skip('Show "Publish Request"', () => {
    it('设置everyone', () => {
        walletLogin()
        cy.visit('/event/setting/seedaobeta')
        cy.contains('zfd')

        cy.contains('Event Permission').click()
        cy.contains('Everyone').click()
        cy.contains('Save').click()
        cy.contains('success')
    })


    it('everyone 时候不显示', () => {
        walletLogin()
        // 设置值为everyone

        cy.visit('/')
        cy.contains('Public Events').should('be.visible')
        cy.get('body').should('not.contain.text', 'Publish Request')
    })

    it('设置member', () => {
        walletLogin()
        cy.visit('/event/setting/seedaobeta')
        cy.contains('zfd')

        cy.contains('Event Permission').click()
        cy.get('div[data-test-id="member"]').click()
        cy.contains('Save').click()
        cy.contains('success')
    })

    it('member 非成员不展示', () => {
        window.localStorage.setItem('auth_sola', '[["0xB5c0eC17f2Ee4afaD3E6f16721cD8DEdD2FD4C82","eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MjE2OCwiYWRkcmVzc190eXBlIjoid2FsbGV0IiwiaHR0cHM6Ly9oYXN1cmEuaW8vand0L2NsYWltcyI6eyJ4LWhhc3VyYS1kZWZhdWx0LXJvbGUiOiJ1c2VyIiwieC1oYXN1cmEtYWxsb3dlZC1yb2xlcyI6WyJ1c2VyIl0sIngtaGFzdXJhLXVzZXItaWQiOiIyMTY4In19.dBiKzP1xc8vD52b3NQBn9LsvBYzcVJNMPRQh99atDSs"]]')
        window.localStorage.setItem('lastLoginType', 'wallet')
        window.localStorage.setItem('lang', 'en')

        cy.visit('/')
        cy.contains('Public Events').should('be.visible')
        cy.get('body').should('not.contain.text', 'Publish Request')
    })


    it('member 成员不展示', () => {
        window.localStorage.setItem('auth_sola', '[["0x30A9abde88f60d266b76D4E3E8484B101066c49C","eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MjE2OSwiYWRkcmVzc190eXBlIjoid2FsbGV0IiwiaHR0cHM6Ly9oYXN1cmEuaW8vand0L2NsYWltcyI6eyJ4LWhhc3VyYS1kZWZhdWx0LXJvbGUiOiJ1c2VyIiwieC1oYXN1cmEtYWxsb3dlZC1yb2xlcyI6WyJ1c2VyIl0sIngtaGFzdXJhLXVzZXItaWQiOiIyMTY5In19.v312dr-AFA31kOw3oXnEhpKxCLiDOj6m_6kG7FrSLiU"]]')
        window.localStorage.setItem('lastLoginType', 'wallet')
        window.localStorage.setItem('lang', 'en')
        cy.visit('/event/seedaobeta/create')
        cy.contains('account71')

        cy.visit('/')
        cy.contains('Public Events').should('be.visible')
        cy.get('body').should('not.contain.text', 'Publish Request')
    })

    it('member 管理员需要展示', () => {
        walletLogin()

        cy.visit('/')
        cy.contains('Public Events').should('be.visible')
        cy.get('body').should('contain.text', 'Publish Request')
    })

})

describe.skip('Permission: everyone', () => {
    // everyone 所有用户创建的活动直接发布
    it('设置 everyone', () => {
        walletLogin()

        // 设置值为everyone
        cy.visit('/event/setting/seedaobeta')
        cy.contains('zfd')

        cy.contains('Event Permission').click()
        cy.contains('Everyone').click()
        cy.contains('Save').click()
        cy.contains('success')
    })

    it('非成员创建活动直接发布', () => {
        // window.localStorage.setItem('auth_sola', '[["0x30A9abde88f60d266b76D4E3E8484B101066c49C","eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MjE2OSwiYWRkcmVzc190eXBlIjoid2FsbGV0IiwiaHR0cHM6Ly9oYXN1cmEuaW8vand0L2NsYWltcyI6eyJ4LWhhc3VyYS1kZWZhdWx0LXJvbGUiOiJ1c2VyIiwieC1oYXN1cmEtYWxsb3dlZC1yb2xlcyI6WyJ1c2VyIl0sIngtaGFzdXJhLXVzZXItaWQiOiIyMTY5In19.v312dr-AFA31kOw3oXnEhpKxCLiDOj6m_6kG7FrSLiU"]]')
        // window.localStorage.setItem('lastLoginType', 'wallet')
        // window.localStorage.setItem('lang', 'en')
        // cy.visit('/event/seedaobeta/create')
        // cy.contains('account71')

        window.localStorage.setItem('auth_sola', '[["0xB5c0eC17f2Ee4afaD3E6f16721cD8DEdD2FD4C82","eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MjE2OCwiYWRkcmVzc190eXBlIjoid2FsbGV0IiwiaHR0cHM6Ly9oYXN1cmEuaW8vand0L2NsYWltcyI6eyJ4LWhhc3VyYS1kZWZhdWx0LXJvbGUiOiJ1c2VyIiwieC1oYXN1cmEtYWxsb3dlZC1yb2xlcyI6WyJ1c2VyIl0sIngtaGFzdXJhLXVzZXItaWQiOiIyMTY4In19.dBiKzP1xc8vD52b3NQBn9LsvBYzcVJNMPRQh99atDSs"]]')
        window.localStorage.setItem('lastLoginType', 'wallet')
        window.localStorage.setItem('lang', 'en')
        cy.visit('/event/seedaobeta/create')
        cy.contains('account70')

        const eventName = `cypress test event ${Date.now()}`
        cy.get('input[placeholder="Event Name"]').type(eventName)
        cy.contains('Create Event').click()
        cy.contains('Done').should('exist')

        cy.visit('/')
        cy.contains(eventName).should('exist')
    })
})

describe.skip('Permission: member', () => {
    // member : Member, Manager, Owner 创建的活动直接发布, 其他用户需要申请
    it('设置 member', () => {
        walletLogin()

        // 设置值为member
        cy.visit('/event/setting/seedaobeta')
        cy.contains('zfd')

        cy.contains('Event Permission').click()
        cy.get('div[data-test-id="member"]').click()
        cy.contains('Save').click()
        cy.contains('success')
    })

    it('非成员创建活动pending', () => {
        window.localStorage.setItem('auth_sola', '[["0xB5c0eC17f2Ee4afaD3E6f16721cD8DEdD2FD4C82","eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MjE2OCwiYWRkcmVzc190eXBlIjoid2FsbGV0IiwiaHR0cHM6Ly9oYXN1cmEuaW8vand0L2NsYWltcyI6eyJ4LWhhc3VyYS1kZWZhdWx0LXJvbGUiOiJ1c2VyIiwieC1oYXN1cmEtYWxsb3dlZC1yb2xlcyI6WyJ1c2VyIl0sIngtaGFzdXJhLXVzZXItaWQiOiIyMTY4In19.dBiKzP1xc8vD52b3NQBn9LsvBYzcVJNMPRQh99atDSs"]]')
        window.localStorage.setItem('lastLoginType', 'wallet')
        window.localStorage.setItem('lang', 'en')
        cy.visit('/event/seedaobeta/create')
        cy.contains('account70')

        const eventName = `cypress test event ${Date.now()}`
        cy.get('input[placeholder="Event Name"]').type(eventName)
        cy.contains('Create Event').click()
        cy.contains('reviewed by a manager')
        cy.contains('Confirm').click()
        cy.contains('Edit').should('exist')

        cy.visit('/')
        cy.contains('My Events').click()
        cy.contains('Created').click()
        cy.contains(eventName).should('be.visible')
        cy.contains(eventName).should('contain.text', 'Pending')
    })

    it('成员创建活动直接发布', () => {
        window.localStorage.setItem('auth_sola', '[["0x30A9abde88f60d266b76D4E3E8484B101066c49C","eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MjE2OSwiYWRkcmVzc190eXBlIjoid2FsbGV0IiwiaHR0cHM6Ly9oYXN1cmEuaW8vand0L2NsYWltcyI6eyJ4LWhhc3VyYS1kZWZhdWx0LXJvbGUiOiJ1c2VyIiwieC1oYXN1cmEtYWxsb3dlZC1yb2xlcyI6WyJ1c2VyIl0sIngtaGFzdXJhLXVzZXItaWQiOiIyMTY5In19.v312dr-AFA31kOw3oXnEhpKxCLiDOj6m_6kG7FrSLiU"]]')
        window.localStorage.setItem('lastLoginType', 'wallet')
        window.localStorage.setItem('lang', 'en')
        cy.visit('/event/seedaobeta/create')
        cy.contains('account71')

        const eventName = `cypress test event ${Date.now()}`
        cy.get('input[placeholder="Event Name"]').type(eventName)
        cy.contains('Create Event').click()
        cy.contains('Done').should('exist')

        cy.visit('/')
        cy.contains(eventName).should('be.visible')
    })
})

describe('Permission: manager', () => {
    // member : Member, Manager, Owner 创建的活动直接发布, 其他用户需要申请
    it('设置 manager', () => {
        walletLogin()

        // 设置值为everyone
        cy.visit('/event/setting/seedaobeta')
        cy.contains('zfd')

        cy.contains('Event Permission').click()
        cy.get('div[data-test-id="manager"]').click()
        cy.contains('Save').click()
        cy.contains('success')
    })

    it('非成员创建活动pending', () => {
        window.localStorage.setItem('auth_sola', '[["0xB5c0eC17f2Ee4afaD3E6f16721cD8DEdD2FD4C82","eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MjE2OCwiYWRkcmVzc190eXBlIjoid2FsbGV0IiwiaHR0cHM6Ly9oYXN1cmEuaW8vand0L2NsYWltcyI6eyJ4LWhhc3VyYS1kZWZhdWx0LXJvbGUiOiJ1c2VyIiwieC1oYXN1cmEtYWxsb3dlZC1yb2xlcyI6WyJ1c2VyIl0sIngtaGFzdXJhLXVzZXItaWQiOiIyMTY4In19.dBiKzP1xc8vD52b3NQBn9LsvBYzcVJNMPRQh99atDSs"]]')
        window.localStorage.setItem('lastLoginType', 'wallet')
        window.localStorage.setItem('lang', 'en')
        cy.visit('/event/seedaobeta/create')
        cy.contains('account70')

        const eventName = `cypress test event ${Date.now()}`
        cy.get('input[placeholder="Event Name"]').type(eventName)
        cy.contains('Create Event').click()
        cy.contains('reviewed by a manager')
        cy.contains('Confirm').click()
        cy.contains('Edit').should('exist')

        cy.visit('/')
        cy.contains('My Events').click()
        cy.contains('Created').click()
        cy.contains(eventName).should('be.visible')
        cy.contains(eventName).should('contain.text', 'Pending')
    })

    it('成员创建活动pending', () => {
        window.localStorage.setItem('auth_sola', '[["0x30A9abde88f60d266b76D4E3E8484B101066c49C","eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MjE2OSwiYWRkcmVzc190eXBlIjoid2FsbGV0IiwiaHR0cHM6Ly9oYXN1cmEuaW8vand0L2NsYWltcyI6eyJ4LWhhc3VyYS1kZWZhdWx0LXJvbGUiOiJ1c2VyIiwieC1oYXN1cmEtYWxsb3dlZC1yb2xlcyI6WyJ1c2VyIl0sIngtaGFzdXJhLXVzZXItaWQiOiIyMTY5In19.v312dr-AFA31kOw3oXnEhpKxCLiDOj6m_6kG7FrSLiU"]]')
        window.localStorage.setItem('lastLoginType', 'wallet')
        window.localStorage.setItem('lang', 'en')
        cy.visit('/event/seedaobeta/create')
        cy.contains('account71')

        const eventName = `cypress test event ${Date.now()}`
        cy.get('input[placeholder="Event Name"]').type(eventName)
        cy.contains('Create Event').click()
        cy.contains('reviewed by a manager')
        cy.contains('Confirm').click()
        cy.contains('Edit').should('exist')

        cy.visit('/')
        cy.contains('My Events').click()
        cy.contains('Created').click()
        cy.contains(eventName).should('be.visible')
        cy.contains(eventName).should('contain.text', 'Pending')
    })

    it('Manager创建活动open', () => {
        walletLogin()
        cy.visit('/event/seedaobeta/create')
        cy.contains('zfd')
        cy.contains('seedaobeta')

        const eventName = `cypress test event ${Date.now()}`
        cy.get('input[placeholder="Event Name"]').type(eventName)
        cy.contains('Create Event').click()
        cy.contains('Done').should('exist')

        cy.visit('/')
        cy.contains(eventName).should('be.visible')
    })
})

