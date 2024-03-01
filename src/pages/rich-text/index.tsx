import {useEffect, useRef, useState} from 'react'
import styles from './rich-text.module.scss'

import {EditorState, Plugin} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {DOMParser, Schema} from "prosemirror-model"
import {schema} from "prosemirror-schema-basic"
import {addListNodes} from "prosemirror-schema-list"
import {keymap} from 'prosemirror-keymap'
import {baseKeymap, toggleMark} from 'prosemirror-commands'

class MenuView {
    items: {dom: any, command: any}[]
    editorView: any
    dom: any

    constructor(items, editorView) {
        this.items = items
        this.editorView = editorView

        this.dom = document.createElement("div")
        this.dom.className = "menubar"
        items.forEach(({dom}) => {
            this.dom.appendChild(dom)
        })

        this.update()

        this.dom.addEventListener("mousedown", e => {
            e.preventDefault()
            editorView.focus()
            items.forEach(({command, dom}) => {
                if (dom.contains(e.target))
                    command(editorView.state, editorView.dispatch, editorView)
            })
        })
    }

    update() {
        this.items.forEach(({command, dom}) => {
            let active = command(this.editorView.state, null, this.editorView)
            dom.classList.display = active ?  dom.classList.remove('disable') : dom.classList.add('disable')
        })
    }

   destroy() { this.dom.remove() }
}

function menuPlugin(items: {dom: any, command: any}[]) {
    return new Plugin({
        view(editorView) {
            let menuView = new MenuView(items, editorView)
            editorView.dom.parentNode.insertBefore(menuView.dom, editorView.dom)
            return menuView
        }
    })
}


function ComponentName() {
    const [a, seta] = useState('')
    const editor = useRef<any>(null)

    useEffect(() => {
        if (editor.current && typeof window !== 'undefined') {

            const mySchema = new Schema({
                nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
                marks: schema.spec.marks
            });

            const div = document.createElement('div')
            div.innerHTML = 'B'

            const menu = menuPlugin([
                {command: toggleMark(schema.marks.strong), dom: div}
            ]);


            (window as any).view = new EditorView(document.querySelector("#editor"), {
                state: EditorState.create({
                    doc: DOMParser.fromSchema(mySchema).parse(document.querySelector("#content")),
                    plugins: [keymap(baseKeymap), menu as any]
                })
            })
        }
    }, [editor])

    return (<div className={styles['page']}>
        <div ref={editor} className={styles['editor']} id={"editor"}/>

        <div id={"content"} style={{display: 'none'}}>
            <p>hello world 1</p>
            <p>hello world 2</p>
            <p>etting up a full editor ‘from scratch’, using only the core libraries, requires quite a lot of code. To
                be able to</p>
        </div>
    </div>)
}

export default ComponentName
