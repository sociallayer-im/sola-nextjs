import fetch from "@/utils/fetch";

export const verifyAndChecking = async (props: {
    proof: string,
    auth_token: string,
}) => {
    if (!props.auth_token) {
        throw new Error('Please login first')
    }

    const verify = await fetch.post({
        url: '/api/nfc-verify',
        data: {
            proof: props.proof,
            auth_token: props.auth_token
        }
    })

    if (verify.data.result !== 'ok') {
        throw new Error(verify.data.message)
    }

    return {marker_id: verify.data.marker_id}
}
