import '@/styles/index.sass'

import UserProvider from "@/components/provider/UserProvider/UserProvider";

function UserProviderTest(props: {children: any}) {

    return   <UserProvider>
        {props.children}
    </UserProvider>
}

export default UserProviderTest
