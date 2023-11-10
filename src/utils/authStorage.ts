export function setAuth (key: string, authToken: string) {
  const authStorage = window.localStorage.getItem('wa') || ''

  if (!authStorage) {
    window.localStorage.setItem('wa', JSON.stringify([[key, authToken]]))
    return
  }

  try {
    const jsonStorage: [string, string][] = JSON.parse(authStorage)
    const filterStorage = jsonStorage.filter((item) => {
      return key !== item[0]
    })

    const newStorage = [[key, authToken], ...filterStorage]
    window.localStorage.setItem('wa', JSON.stringify(newStorage))
  } catch (e) {
    window.localStorage.setItem('wa', JSON.stringify([[key, authToken]]))
  }
}

export function getAuth (account? : string) {
  const authStorage = window.localStorage.getItem('wa') || ''
  if (!authStorage) {
    return null
  }

  try {
    const jsonStorage: [string, string][] = JSON.parse(authStorage)
    let target
    if (account) {
      target = jsonStorage.find((item) => {
        return account === item[0]
      })
    } else {
      target = jsonStorage[0]
    }

    return target? { account: target[0], authToken: target[1] } : null
  } catch (e) {
    return null
  }
}

export function getLatestAuth () : null| [string, string] {
  const authStorage = window.localStorage.getItem('wa') || ''
  if (!authStorage) {
    return null
  }

  try {
    const jsonStorage: [string, string][] = JSON.parse(authStorage)
    return jsonStorage[0] || null
  } catch (e) {
    return null
  }
}

export function getEmailAuth (account? : string): {email: string, authToken: string} | null {
  const authStorage = window.localStorage.getItem('wa') || ''
  if (!authStorage) {
    return null
  }

  try {
    const jsonStorage: [string, string][] = JSON.parse(authStorage)
    let target
    if (account) {
      target = jsonStorage.find((item) => {
        return account === item[0]
      })
    } else {
      target = jsonStorage[0]
    }

    return target? { email: target[0], authToken: target[1] } : null
  } catch (e) {
    return null
  }
}

export function burnAuth (key: string) {
  if (!key) {
    // burn all history
    window.localStorage.removeItem('wa')
  } else {
    const authStorage = window.localStorage.getItem('wa') || ''
    if (!authStorage) return

    try {
      const jsonStorage: [string, string][] = JSON.parse(authStorage)
      const filterStorage = jsonStorage.filter((item) => {
        return key !== item[0]
      })

      window.localStorage.setItem('wa', JSON.stringify(filterStorage))
    } catch (e) {
      window.localStorage.removeItem('wa')
    }
  }
}

export type LoginType =  'wallet' | 'email' | 'phone' | 'zupass' | null

export function setLastLoginType (type: LoginType) {
  if (!type) {
    window.localStorage.removeItem('lastLoginType')
    return
  }

  window.localStorage.setItem('lastLoginType', type as string)
}

export function getLastLoginType (): LoginType {
  const type = window.localStorage.getItem('lastLoginType')
  return (type || null) as LoginType
}

export function setPlantLoginFallBack (value: string) {
  setCookie('platformLoginFallBack', value)
}

export function getPlantLoginFallBack () {
  return getCookie('platformLoginFallBack')
}

export function deleteFallback() {
  document.cookie = 'platformLoginFallBack' + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
}

function getCookie(key: string) {
  const name = key + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  for(let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return "";
}

function setCookie(key: string, value: string) {
  document.cookie = key + "=" + value;
}

export function getPhoneAuth (account? : string): {phone: string, authToken: string} | null {
  const authStorage = window.localStorage.getItem('wa') || ''
  if (!authStorage) {
    return null
  }

  try {
    const jsonStorage: [string, string][] = JSON.parse(authStorage)
    let target
    if (account) {
      target = jsonStorage.find((item) => {
        return account === item[0]
      })
    } else {
      target = jsonStorage[0]
    }

    return target? { phone: target[0], authToken: target[1] } : null
  } catch (e) {
    return null
  }
}


