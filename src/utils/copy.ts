import copyText from 'copy-to-clipboard'

export default function copy (text: string) {
    copyText(text)
}
