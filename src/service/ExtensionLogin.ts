type MyWindow = any

const myWindow: MyWindow = typeof window !== 'undefined' ? window : undefined

class SolaExtensionLogin {
    login(userId: string, userDomain: string, authToken: string, avatar: string) {
        myWindow.postMessage({
            type: 'SOLA_LOGIN',
            user_id: userId,
            user_domain: userDomain,
            auth_token: authToken,
            avatar: avatar
        }, '*')
    }

    logout() {
        if (myWindow) {
            myWindow.postMessage({type: 'SOLA_LOGOUT'}, '*')
        }
    }
}

const solaExtensionLogin = new SolaExtensionLogin()
export default solaExtensionLogin
