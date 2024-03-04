import {useContext, useEffect, useRef, useState} from 'react'
import styles from './rich-text.module.scss'

import {Command, EditorState, Plugin} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {Attrs, DOMParser, NodeSpec, Schema} from "prosemirror-model"
import {schema} from "prosemirror-schema-basic"
import {addListNodes, wrapInList} from "prosemirror-schema-list"
import {keymap} from 'prosemirror-keymap'
import {baseKeymap, lift, setBlockType, toggleMark, wrapIn} from 'prosemirror-commands'
import {defaultMarkdownSerializer} from 'prosemirror-markdown'

import DialogsContext from "@/components/provider/DialogProvider/DialogsContext";
import AppInput from "@/components/base/AppInput";
import AppButton from "@/components/base/AppButton/AppButton";
import {PLACEMENT, StatefulPopover} from "baseui/popover";
import {StatefulMenu} from "baseui/menu";
import chooseFile from "@/utils/chooseFile";
import solas from "@/service/solas";
import userContext from "@/components/provider/UserProvider/UserContext";

export interface MenuItemForm {
    name: string
    title: string
    command: Command
    icon?: string
    hide?: boolean
}

const videoNodeSpec: NodeSpec = {
    attrs: {type: {default: "video/mp4"}, src: {default: ""}},
    inline: true,
    group: "inline",
    draggable: true,
    toDOM: node => {
        const video = document.createElement("video")
        video.setAttribute('Controls', 'true')
        const source = document.createElement("source")
        source.setAttribute('src', node.attrs.src)
        source.setAttribute('type', 'video/mp4')
        video.appendChild(source)
        return {
            dom: video,
        }
    },
    parseDOM: [{
        tag: "video",
        getAttrs: (dom: HTMLElement | string) => {
            if (typeof dom === 'string') return null
            const type = dom.querySelector('source')?.getAttribute('type')
            const src = dom.querySelector('source')?.getAttribute('src')
            return {
                type,
                src
            } as Attrs
        }
    }]
}

function RichTextEditor() {
    const editorRef = useRef<any>(null)
    const editorViewRef = useRef<any>(null)
    const [editorState, setEditorState] = useState<any>(null)
    const [editorMenuCommand, setEditorMenuCommand] = useState<MenuItemForm[]>([])
    const {openDialog, showLoading, showToast} = useContext(DialogsContext)
    const {user} = useContext(userContext)
    const [result, setResult] = useState('')

    const selectFile = async (cb: (url: string) => any) => {
        try {
            const file = await chooseFile({accepts: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']})
            const reader = new FileReader()
            reader.readAsDataURL(file[0])
            reader.onload = async (file) => {
                const baseData = reader.result as string;

                //base64-->blob
                let byteString;
                if (baseData!.split(',')[0].indexOf('base64') >= 0)
                    byteString = atob(baseData.split(',')[1]);//base64 解码
                else {
                    byteString = unescape(baseData.split(',')[1]);
                }
                const mimeString = baseData.split(',')[0].split(':')[1].split(';')[0];//mime类型 -- image/png
                const ia = new Uint8Array(byteString.length);//创建视图
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                let blob = new Blob([ia], {type: 'image/png'});

                const unload = showLoading()
                try {
                    const newImage = await solas.uploadImage({
                        file: blob,
                        uploader: user.wallet || user.email || '',
                        auth_token: user.authToken || ''
                    })
                    unload()
                    cb(newImage);
                } catch (e: any) {
                    console.log('[selectFile]: ', e)
                    unload()
                    showToast(e.message || 'Upload fail')
                    cb('');
                }
            }
        } catch (e: any) {
            console.log('[selectFile]: ', e)
            showToast(e.message || 'Upload fail')
            cb('');
        }
    }

    useEffect(() => {
        if (editorRef.current && typeof window !== 'undefined') {

            const mySchema = new Schema({
                nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block").addBefore("image", "video", videoNodeSpec),
                marks: schema.spec.marks
            });


            const UpdateEditorView = new Plugin({
                view(editorView) {
                    return {
                        update(view, prevState) {
                            setEditorState(view.state)
                        }
                    }
                }
            })

            const menus: MenuItemForm[] = [
                {name: 'B', title: 'Bold', command: toggleMark(schema.marks.strong)},
                {name: 'I', title: 'Italic', command: toggleMark(schema.marks.em)},
                {name: 'Ordered List', title: 'Ordered List', command: wrapInList(mySchema.nodes.ordered_list)},
                {name: 'Bullet List', title: 'BulletList', command: wrapInList(mySchema.nodes.bullet_list)},
                {name: 'Quote', title: 'Quote', command: wrapIn(mySchema.nodes.blockquote)},
                {
                    name: 'Link', title: 'Link', command: (editorState, dispatch, editorView) => {
                        let {from, $from, to, empty} = editorState.selection
                        const enable = !empty && !editorState.doc.rangeHasMark(from, to, mySchema.marks.link)
                        if (enable && dispatch) {
                            openDialog({
                                size: [340, 'auto'],
                                position: 'bottom',
                                content: (close: () => any) => {
                                    return <DialogInsertLink close={close} onConfig={(href, title) => {
                                        toggleMark(mySchema.marks.link, {
                                            href,
                                            title
                                        })(editorState, dispatch, editorView)
                                        close()
                                        editorView?.focus()
                                    }}/>
                                }
                            })
                            return true
                        } else return enable && !dispatch;
                    }
                },
                {name: 'Code', title: 'Code', command: toggleMark(mySchema.marks.code)},
                {name: 'Code Block', title: 'CodeBlock', command: setBlockType(mySchema.nodes.code_block)},
                {name: 'Plant Text', title: 'PlantText', command: setBlockType(mySchema.nodes.paragraph)},
                {name: 'Lift out', title: 'Lift out of enclosing block', command: lift},
                {
                    name: 'Url Image', title: 'Url Image', command: (state, dispatch, view) => {
                        const canInsert = () => {
                            let $from = state.selection.$from
                            for (let d = $from.depth; d >= 0; d--) {
                                let index = $from.index(d)
                                if ($from.node(d).canReplaceWith(index, index, mySchema.nodes.image)) return true
                            }
                            return false
                        }

                        const available = canInsert()

                        if (view && dispatch && available) {
                            openDialog({
                                size: [340, 'auto'],
                                position: 'bottom',
                                content: (close: () => any) => <DialogInsertImage
                                    close={close}
                                    onConfig={(src, title) => {
                                        const attr = {
                                            src,
                                            title,
                                        }
                                        dispatch && dispatch(state.tr.replaceSelectionWith(mySchema.nodes.image.createAndFill(attr)!))
                                        view && view.focus()
                                        close()
                                    }}
                                />
                            })
                            return  true
                        } else {
                            return available
                        }
                    },
                    hide: true
                },
                {
                    name: 'Upload Image', title: 'Url Image', command: (state, dispatch, view) => {
                        const canInsert = () => {
                            let $from = state.selection.$from
                            for (let d = $from.depth; d >= 0; d--) {
                                let index = $from.index(d)
                                if ($from.node(d).canReplaceWith(index, index, mySchema.nodes.image)) return true
                            }
                            return false
                        }

                        const available = canInsert()

                        if (view && dispatch && available) {
                            selectFile(imgUrl => {
                                if (imgUrl) {
                                    const attr = {
                                        src: imgUrl,
                                        title: '',
                                    }
                                    dispatch && dispatch(state.tr.replaceSelectionWith(mySchema.nodes.image.createAndFill(attr)!))
                                    view && view.focus()
                                }
                            })
                            return true
                        } else {
                            return available
                        }
                    },
                    hide: true
                },
                {
                    name: 'Video', title: 'Video', command: (state, dispatch, view) => {
                        const canInsert = () => {
                            let $from = state.selection.$from
                            for (let d = $from.depth; d >= 0; d--) {
                                let index = $from.index(d)
                                if ($from.node(d).canReplaceWith(index, index, mySchema.nodes.image)) return true
                            }
                            return false
                        }

                        const available = canInsert()

                        if (view && dispatch && available) {
                            const attr = {
                                src: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Schlossbergbahn.webm',
                            }
                            dispatch && dispatch(state.tr.replaceSelectionWith(mySchema.nodes.video.createAndFill(attr)!))
                            view && view.focus()
                            return true
                        } else {
                            return available
                        }
                    }
                }
            ]

            editorViewRef.current = new EditorView(document.querySelector("#editor"), {
                state: EditorState.create({
                    doc: DOMParser.fromSchema(mySchema).parse(document.querySelector("#content") as Node),
                    plugins: [keymap(baseKeymap), UpdateEditorView],
                })
            })
            setEditorState(editorViewRef.current.state)
            setEditorMenuCommand(menus)
        }

        return () => {
            editorViewRef.current?.destroy()
        }
    }, [editorRef, user])

    return (<div className={styles['page']}>
        <div className={styles['editor-wrapper']}>
            <div className={'menubar'}>
                {
                    editorMenuCommand.filter(item => !item.hide).map((item, index) => {
                        return <MenuButton menuItemForm={item} key={index}
                                           editorView={editorViewRef.current || undefined}
                                           editorState={editorState || undefined}/>
                    })
                }
                <div className={'menu-item'}>
                    <StatefulPopover
                        autoFocus={false}
                        returnFocus={false}
                        popoverMargin={-115}
                        placement={PLACEMENT.topLeft}
                        content={({close}: any) => <StatefulMenu
                            onItemSelect={({item}: any) => {
                                const targetCommand = editorMenuCommand.find(i => i.name === item.name)
                                if (!!targetCommand && targetCommand.command(editorState, undefined, editorViewRef.current)) {
                                    targetCommand.command(editorState, editorViewRef.current?.dispatch, editorViewRef.current)
                                }
                                close()
                            }}
                            items={[
                                {
                                    label: "Url",
                                    name: 'Url Image'
                                },
                                {
                                    label: "Upload",
                                    name: 'Upload Image'
                                }
                            ]}/>}
                    >
                        <div>Image</div>
                    </StatefulPopover>
                </div>
            </div>
            <div ref={editorRef} id={"editor"}/>
        </div>
        <div id={"content"}>

        </div>
        <AppButton onClick={e => {
            const res = defaultMarkdownSerializer.serialize(editorState.doc)
            setResult(res)
        }}>Save</AppButton>
        <div>{result}</div>
    </div>)
}

export default RichTextEditor


function MenuButton({
                        menuItemForm,
                        editorState,
                        editorView
                    }: { menuItemForm: MenuItemForm, editorState?: EditorState, editorView?: EditorView }) {
    const [enable, setEnable] = useState<boolean>(false)

    useEffect(() => {
        if (editorState) {
            const isAvailable = menuItemForm.command(editorState, undefined, editorView)
            setEnable(isAvailable)
        } else {
            setEnable(false)
        }
    }, [editorState])

    return <div className={enable ? 'menu-item' : 'menu-item disable'} title={menuItemForm.title} onClick={() => {
        if (editorState && editorView) {
            editorView?.focus()
            menuItemForm.command(editorState, editorView.dispatch, editorView)
        }
    }}>{menuItemForm.name}</div>
}

function DialogInsertLink(props: { close?: () => any, onConfig?: (href: string, title: string) => any }) {
    const [href, setHref] = useState<string>('')
    const [title, setTitle] = useState<string>('')

    return <div className={styles['dialog-insert-link']}>
        <div className={styles['title']}>Insert Link</div>
        <div className={styles['sub-title']}>Href</div>
        <AppInput autoFocus value={href} onChange={e => {
            setHref(e.target.value)
        }}/>
        <div className={styles['sub-title']}>Tittle (Optional)</div>
        <AppInput value={title} onChange={e => {
            setTitle(e.target.value)
        }}/>
        <div className={styles['btns']}>
            <AppButton onClick={e => {
                props.close && props.close()
            }}>Cancel</AppButton>
            <AppButton
                disabled={!href}
                special onClick={e => {
                props.onConfig && props.onConfig(href, title)
            }}>Confirm</AppButton>
        </div>
    </div>
}

function DialogInsertImage(props: { close?: () => any, onConfig?: (src: string, title: string) => any }) {
    const [src, setSrc] = useState<string>('')
    const [title, setTitle] = useState<string>('')


    return <div className={styles['dialog-insert-link']}>
        <div className={styles['title']}>Insert Image</div>
        <div className={styles['sub-title']}>Url</div>
        <AppInput autoFocus value={src} onChange={e => {
            setSrc(e.target.value)
        }}/>
        <div className={styles['sub-title']}>Tittle (Optional)</div>
        <AppInput value={title} onChange={e => {
            setTitle(e.target.value)
        }}/>
        <div className={styles['btns']}>
            <AppButton onClick={e => {
                props.close && props.close()
            }}>Cancel</AppButton>
            <AppButton
                disabled={!src}
                special onClick={e => {
                props.onConfig && props.onConfig(src, title)
            }}>Confirm</AppButton>
        </div>
    </div>
}
