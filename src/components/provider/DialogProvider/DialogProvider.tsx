'use client'

import { ReactNode, useEffect, useState } from 'react'
import {
    Badge,
    Badgelet,
    Invite,
    Presend,
    Profile,
    Group,
    NftPass,
    Point,
    PointItem,
    NftPasslet
} from '@/service/solas'
import DialogsContext, { DialogsContextType } from './DialogsContext'
import DialogDomainConfirm, { DialogConfirmDomainProps } from '../../base/Dialog/DialogConfirmDomain/DialogConfirmDomain'
import DialogConfirm, { DialogConfirmProps } from '../../base/Dialog/DialogConfirm/DialogConfirm'
import Dialog from '../../base/Dialog/Dialog'
import Toast from '../../base/Toast'
import DialogConnectWallet from '../../base/Dialog/DialogConnectWallet/DialogConnectWallet'
import ToastLoading from '../../base/ToastLoading'
import DetailBadgelet from '../../compose/Detail/DetailBadgelet'
import DetailPresend from '../../compose/Detail/DetailPresend'
import DetailBadge from '../../compose/Detail/DetailBadge/DetailBadge'
import DialogAvatar from '../../base/Dialog/DialogAvatar'
import DialogCropper from '../../base/Dialog/DialogCropper/DialogCropper'
import DetailInvite from '../../compose/Detail/DetailInvite'
import DialogGroupSetting from '../../base/Dialog/DialogGroupSetting/DialogGroupSetting'
import DetailNftpass from "../../compose/Detail/DetailNftpass/DetailNftpass";
import DetailNftpasslet from "../../compose/Detail/DetailNftpasslet";
import DetailPoint from "../../compose/Detail/DetailPoint";
import DetailPointItem from "../../compose/Detail/DetailPointItem";
import DialogNftCheckIn from "../../base/Dialog/DialogNftCheckIn/DialogNftCheckIn";
import DetailGift from "../../compose/Detail/DetailGift/DetailGift";
import DialogGiftCheckIn from "../../base/Dialog/DialogGiftCheckIn/DialogGiftCheckIn";
import DetailGiftItem from "../../compose/Detail/DetailGiftItem/DetailGiftItem";
import DialogTransferAccept, {DialogTransferAcceptProps} from "../../base/Dialog/DialogTransferAccept/DialogTransferAccept";
import DialogRevoke from "../../base/Dialog/DialogBurn/DialogBurn";
import DialogEventCheckIn from "@/components/base/Dialog/DialogEventCheckIn/DialogEventCheckIn";

export interface DialogProviderProps {
    children: ReactNode
}

interface Dialog {
    id: number,
    content: () => ReactNode
    type?: string
    itemId?: number
}

export interface OpenDialogProps {
    content: (close: any) => ReactNode,
    size?: (number | string)[],
    position?: 'bottom' | 'center'
}

function genID () {
    return parseInt((Math.random()*(99999 - 10000 + 1) + 10000).toString())
}

function DialogProvider (props: DialogProviderProps) {
    const [dialogsGroup, setDialogsGroup] = useState<{dialogs: Dialog[]}>({ dialogs: [] })
    const [dialogsCount, setDialogsCount] = useState(0)

    useEffect(() => {
        document.body.style.overflow = dialogsGroup.dialogs[0] ? 'hidden' : 'auto'
        setDialogsCount(dialogsGroup.dialogs.length)

        return () => { document.body.style.overflow = 'auto' }
    }, [dialogsGroup])

    const checkDuplicate = (type: string, itemId: number) => {
        let duplicate = false
        dialogsGroup.dialogs.forEach((item) => {
            if (item.type === type && item.itemId === itemId) {
                duplicate = true
            }
        })

        return duplicate
    }

    const closeDialogByID = (dialogID: number) => {
        if (dialogsGroup.dialogs.length) {
            let targetIndex: null | number = null
            dialogsGroup.dialogs.forEach((item, index) => {
                if (item.id === dialogID) {
                    targetIndex = index
                }
            })

            if ( targetIndex === null ) return
            const copy = { ...dialogsGroup}
            copy.dialogs.splice(targetIndex, 1)
            setDialogsGroup(copy)
        }
    }

    const clean = (message?: string) => {
        console.log('clean:', message)
        return setTimeout(() => {
            const copy = { ...dialogsGroup }
            copy.dialogs = []
            setDialogsGroup(copy)
            setDialogsGroup(copy)
            setDialogsGroup(copy)
            setDialogsGroup(copy)
            setDialogsGroup(copy)
            setDialogsGroup(copy)
        }, 200)
    }

    const openDialog = (openDialogProps: OpenDialogProps ) => {
        const id = genID()
        dialogsGroup.dialogs.push({
            id: id,
            content: () => {
                const close = () => {
                    closeDialogByID(id)
                }

                const props = {
                    key: id.toString(),
                    size: openDialogProps.size || [320, 450],
                    position: openDialogProps.position || undefined,
                    handleClose: close
                }

                return (
                    <Dialog {...props} >
                        { (close) => openDialogProps.content(close) }
                    </Dialog>
                )
            }
        })
        setDialogsGroup({...dialogsGroup})
    }

    const openConnectWalletDialog = () => {
        const id = genID()
        dialogsGroup.dialogs.push({
            id,
            content: () => {
                const close = () => {
                    closeDialogByID(id)
                }

                const props = {
                    key: id.toString(),
                    size: [320, 'auto'],
                    handleClose: close,
                    position: 'bottom' as const
                }

                return (
                    <Dialog {...props} >
                        { (close) => <DialogConnectWallet  handleClose={close} />}
                    </Dialog>
                )
            }
        })

        setDialogsGroup({...dialogsGroup})
    }

    const showLoading = () => {
        const id = genID()
        dialogsGroup.dialogs.push({
            id,
            content: () => {
                const props = {
                    key: id.toString(),
                    size: [76, 76],
                    noShell: true
                }

                return (
                    <Dialog {...props} >
                        { (close) => <ToastLoading /> }
                    </Dialog>
                )
            }
        })

        setDialogsGroup({...dialogsGroup})
        return () => { closeDialogByID(id) }
    }

    const showToast = (text: string, duration?: number) => {
        const id = genID()
        let closeToast = () => {}
        let timeOut: any = null
        dialogsGroup.dialogs.push({
            id,
            content: () => {
                const close = () => {
                    !!timeOut && clearTimeout(timeOut)
                    closeDialogByID(id)
                }

                closeToast = close

                const props = {
                    key: id.toString(),
                    maxSize: ['300px', 'auto'],
                    noShell: true,
                    handleClose: close
                }

                return (
                    <Dialog { ...props } >
                        { (close) => <Toast text={ text }></Toast> }
                    </Dialog>
                )
            }
        })


        setDialogsGroup({...dialogsGroup})
        duration = duration || 3000
        try {
            timeOut = setTimeout(() => {
                closeToast()
            }, duration)
        } catch (e) { }
    }

    const openDomainConfirmDialog = (props: DialogConfirmDomainProps) => {
        const id = genID()
        dialogsGroup.dialogs.push({
            id,
            content: () => {
                const close = () => {
                    closeDialogByID(id)
                }

                const dialogProps = {
                    key: id.toString(),
                    size: [340, 'auto'],
                    handleClose: close
                }

                return (
                    <Dialog { ...dialogProps } >
                        { (close) => <DialogDomainConfirm { ...props }
                                                          onCancel={ ()=> { close(); props.onCancel &&  props.onCancel()} }/> }
                    </Dialog>
                )
            }
        })
        setDialogsGroup({ ...dialogsGroup })
    }

    const openConfirmDialog = (props: DialogConfirmProps) => {
        const id = genID()
        dialogsGroup.dialogs.push({
            id,
            content: () => {
                const close = () => {
                    closeDialogByID(id)
                }

                const dialogProps = {
                    key: id.toString(),
                    size: [340, 'auto'],
                    handleClose: close
                }

                return (
                    <Dialog { ...dialogProps } >
                        { (close) => <DialogConfirm { ...props }
                                                    onCancel={ ()=> { close(); props.onCancel &&  props.onCancel()} }/> }
                    </Dialog>
                )
            }
        })
        setDialogsGroup({ ...dialogsGroup })
    }

    const showBadgelet = (props: Badgelet) => {
        if (checkDuplicate('badgelet', props.id)) return

        const id = genID()
        dialogsGroup.dialogs.push({
            id,
            itemId: props.id,
            type: 'badgelet',
            content: () => {
                const close = () => {
                    closeDialogByID(id)
                }

                const dialogProps = {
                    key: id.toString(),
                    size: [460, 'auto'],
                    handleClose: close,
                    position: 'bottom' as const
                }

                return (
                    <Dialog { ...dialogProps } >
                        { (close) => <DetailBadgelet badgelet={ props } handleClose={ close } /> }
                    </Dialog>
                )
            }
        })
        setDialogsGroup({ ...dialogsGroup })
    }

    const showPointItem = (props: PointItem) => {
        if (checkDuplicate('pointItem', props.id)) return

        const id = genID()
        dialogsGroup.dialogs.push({
            id,
            itemId: props.id,
            type: 'pointItem',
            content: () => {
                const close = () => {
                    closeDialogByID(id)
                }

                const dialogProps = {
                    key: id.toString(),
                    size: [460, 'auto'],
                    handleClose: close,
                    position: 'bottom' as const
                }

                return (
                    <Dialog { ...dialogProps } >
                        { (close) => <DetailPointItem pointItem={ props } handleClose={ close } /> }
                    </Dialog>
                )
            }
        })
        setDialogsGroup({ ...dialogsGroup })
    }

    const showPoint = (props: Point) => {
        if (checkDuplicate('point', props.id)) return

        const id = genID()
        dialogsGroup.dialogs.push({
            id,
            itemId: props.id,
            type: 'point',
            content: () => {
                const close = () => {
                    closeDialogByID(id)
                }

                const dialogProps = {
                    key: id.toString(),
                    size: [460, 'auto'],
                    handleClose: close,
                    position: 'bottom' as const
                }

                return (
                    <Dialog { ...dialogProps } >
                        { (close) => <DetailPoint point={ props } handleClose={ close } /> }
                    </Dialog>
                )
            }
        })
        setDialogsGroup({ ...dialogsGroup })
    }

    const showNftpasslet = (props: NftPasslet) => {
        if (checkDuplicate('point', props.id)) return

        const id = genID()
        dialogsGroup.dialogs.push({
            id,
            itemId: props.id,
            type: 'nftpasslet',
            content: () => {
                const close = () => {
                    closeDialogByID(id)
                }

                const dialogProps = {
                    key: id.toString(),
                    size: [460, 'auto'],
                    handleClose: close,
                    position: 'bottom' as const
                }

                return (
                    <Dialog { ...dialogProps } >
                        { (close) => <DetailNftpasslet nftpasslet={ props } handleClose={ close } /> }
                    </Dialog>
                )
            }
        })
        setDialogsGroup({ ...dialogsGroup })
    }

    const showGiftItem = (props: NftPasslet) => {
        if (checkDuplicate('point', props.id)) return
        const id = genID()
        dialogsGroup.dialogs.push({
            id,
            itemId: props.id,
            type: 'giftItem',
            content: () => {
                const close = () => {
                    closeDialogByID(id)
                }

                const dialogProps = {
                    key: id.toString(),
                    size: [460, 'auto'],
                    handleClose: close,
                    position: 'bottom' as const
                }

                return (
                    <Dialog { ...dialogProps } >
                        { (close) => <DetailGiftItem giftItem={ props } handleClose={ close } /> }
                    </Dialog>
                )
            }
        })
        setDialogsGroup({ ...dialogsGroup })
    }

    const showInvite = (props: Invite) => {
        if (checkDuplicate('invite', props.id)) return
        const id = genID()
        dialogsGroup.dialogs.push({
            id,
            itemId: props.id,
            type: 'invite',
            content: () => {
                const close = () => {
                    closeDialogByID(id)
                }

                const dialogProps = {
                    key: id.toString(),
                    size: [460, 'auto'],
                    handleClose: close,
                    position: 'bottom' as const
                }

                return (
                    <Dialog { ...dialogProps } >
                        { (close) =>  <DetailInvite invite={ props } handleClose={ close } /> }
                    </Dialog>
                )
            }
        })
        setDialogsGroup({ ...dialogsGroup })
    }

    const showPresend = (props: Presend, code?: string) => {
        if (checkDuplicate('presend', props.id)) return

        const id = genID()
        dialogsGroup.dialogs.push({
            id,
            itemId: props.id,
            type: 'presend',
            content: () => {
                const close = () => {
                    closeDialogByID(id)
                }

                const dialogProps = {
                    key: id.toString(),
                    size: [460, 'auto'],
                    handleClose: close,
                    position: 'bottom' as const
                }

                return (
                    <Dialog { ...dialogProps } >
                        { (close) => <DetailPresend presend={ props } code={ code || '' } handleClose={ close } /> }
                    </Dialog>
                )
            }
        })
        setDialogsGroup({ ...dialogsGroup })
    }

    const showBadge = (props: Badge) => {
        if (checkDuplicate('badge', props.id)) return

        const id = genID()
        dialogsGroup.dialogs.push({
            id,
            itemId: props.id,
            type: 'badge',
            content: () => {
                const close = () => {
                    closeDialogByID(id)
                }

                const dialogProps = {
                    key: id.toString(),
                    size: [460, 'auto'],
                    handleClose: close,
                    position: 'bottom' as const
                }

                return (
                    <Dialog { ...dialogProps } >
                        { (close) => <DetailBadge badge={ props } handleClose={ close } /> }
                    </Dialog>
                )
            }
        })
        setDialogsGroup({ ...dialogsGroup })
    }

    const showGift = (props: Badge) => {
        if (checkDuplicate('gift', props.id)) return

        const id = genID()
        dialogsGroup.dialogs.push({
            id,
            itemId: props.id,
            type: 'gift',
            content: () => {
                const close = () => {
                    closeDialogByID(id)
                }

                const dialogProps = {
                    key: id.toString(),
                    size: [460, 'auto'],
                    handleClose: close,
                    position: 'bottom' as const
                }

                return (
                    <Dialog { ...dialogProps } >
                        { (close) => <DetailGift badge={ props } handleClose={ close } /> }
                    </Dialog>
                )
            }
        })
        setDialogsGroup({ ...dialogsGroup })
    }

    const showNftpass = (props: NftPass) => {
        if (checkDuplicate('nftpass', props.id)) return

        const id = genID()
        dialogsGroup.dialogs.push({
            id,
            itemId: props.id,
            type: 'nftpass',
            content: () => {
                const close = () => {
                    closeDialogByID(id)
                }

                const dialogProps = {
                    key: id.toString(),
                    size: [460, 'auto'],
                    handleClose: close,
                    position: 'bottom' as const
                }

                return (
                    <Dialog { ...dialogProps } >
                        { (close) => <DetailNftpass nftpass={ props } handleClose={ close } /> }
                    </Dialog>
                )
            }
        })
        setDialogsGroup({ ...dialogsGroup })
    }

    const showAvatar = (props: Profile) => {
        const id = genID()
        dialogsGroup.dialogs.push({
            id,
            itemId: props.id,
            type: 'avatar',
            content: () => {
                const close = () => {
                    closeDialogByID(id)
                }

                const dialogProps = {
                    key: id.toString(),
                    size: [316, 316],
                }

                return (
                    <Dialog { ...dialogProps } >
                        { (transitionClose) => <DialogAvatar profile={ props } handleClose={ close } /> }
                    </Dialog>
                )
            }
        })
        setDialogsGroup({ ...dialogsGroup })
    }

    const showCropper = (props: { imgURL: string, onConfirm: (data:Blob, close: () => any) => {} } ) => {
        const id = genID()
        dialogsGroup.dialogs.push({
            id,
            content: () => {
                const close = () => {
                    closeDialogByID(id)
                }

                const dialogProps = {
                    key: id.toString(),
                    size: ['343px', '388px'],
                }

                return (
                    <Dialog { ...dialogProps } >
                        { () => <DialogCropper
                            imgURL={ props.imgURL }
                            handleClose={ close }
                            handleConfirm={props.onConfirm} /> }
                    </Dialog>
                )
            }
        })
        setDialogsGroup({ ...dialogsGroup })
    }

    const showGroupSetting = (group: Group) => {
        const id = genID()
        dialogsGroup.dialogs.push({
            id,
            content: () => {
                const close = () => {
                    closeDialogByID(id)
                }

                const dialogProps = {
                    key: id.toString(),
                    size: ['100%', '100%'],
                    handleClose: close
                }

                return (
                    <Dialog { ...dialogProps } >
                        { (close) => <DialogGroupSetting group={group} handleClose={ close }/> }
                    </Dialog>
                )
            }
        })
        setDialogsGroup({ ...dialogsGroup })
    }

    const showNftCheckIn = (nftpassId: number) => {
        const id = genID()
        const width = window.innerWidth
        dialogsGroup.dialogs.push({
            id,
            content: () => {
                const close = () => {
                    closeDialogByID(id)
                }

                const dialogProps = {
                    key: id.toString(),
                    size: width < 768 ?  ['100%', '100%'] :  [500, 'auto'],
                    handleClose: close
                }

                return (
                    <Dialog { ...dialogProps } >
                        { (close) => <DialogNftCheckIn nftPassId={nftpassId} handleClose={close} /> }
                    </Dialog>
                )
            }
        })
        setDialogsGroup({ ...dialogsGroup })
    }

    const showGiftCheckIn = (giftId: number) => {
        const id = genID()
        const width = window.innerWidth
        dialogsGroup.dialogs.push({
            id,
            content: () => {
                const close = () => {
                    closeDialogByID(id)
                }

                const dialogProps = {
                    key: id.toString(),
                    size: width < 768 ?  ['100%', '100%'] :  [500, 'auto'],
                    handleClose: close
                }

                return (
                    <Dialog { ...dialogProps } >
                        { (close) => <DialogGiftCheckIn giftId={giftId} handleClose={close} /> }
                    </Dialog>
                )
            }
        })
        setDialogsGroup({ ...dialogsGroup })
    }

    const showEventCheckIn = (eventId: number, isCheckLog: boolean) => {
        const id = genID()
        const width = window.innerWidth
        dialogsGroup.dialogs.push({
            id,
            content: () => {
                const close = () => {
                    closeDialogByID(id)
                }

                const dialogProps = {
                    key: id.toString(),
                    size: width < 768 ?  ['100%', '100%'] :  [500, 'auto'],
                    handleClose: close
                }

                return (
                    <Dialog { ...dialogProps } >
                        { (close) => <DialogEventCheckIn
                            isCheckLog={isCheckLog}
                            eventId={eventId} handleClose={close} /> }
                    </Dialog>
                )
            }
        })
        setDialogsGroup({ ...dialogsGroup })
    }

    const showTransferAccept = (props: {badgelet?: Badgelet, PointItem: PointItem}) => {
        const id = genID()
        dialogsGroup.dialogs.push({
            id,
            content: () => {
                const close = () => {
                    closeDialogByID(id)
                }

                const dialogProps = {
                    key: id.toString(),
                    size: [300, 'auto'],
                    handleClose: close
                }

                return (
                    <Dialog { ...dialogProps } >
                        { (close) => <DialogTransferAccept
                            {...props}
                            handleClose={close} /> }
                    </Dialog>
                )
            }
        })
        setDialogsGroup({ ...dialogsGroup })
    }

    const showRevoke = async (props: {badge: Badge}) => {
        const id = genID()
        dialogsGroup.dialogs.push({
            id,
            content: () => {
                const close = () => {
                    closeDialogByID(id)
                }
                const dialogProps = {
                    key: id.toString(),
                    size: ['100%', '100%'],
                    handleClose: close
                }
                return (
                    <Dialog { ...dialogProps } >
                        { (close) => <DialogRevoke
                            {...props}
                            handleClose={close} /> }
                    </Dialog>
                )
            }
        })
        setDialogsGroup({ ...dialogsGroup })
    }

    const contextValue: DialogsContextType = {
        showRevoke,
        showEventCheckIn,
        dialogsCount,
        openConnectWalletDialog,
        showLoading,
        showToast,
        openDomainConfirmDialog,
        openDialog,
        showBadgelet,
        showPresend,
        showBadge,
        showAvatar,
        showCropper,
        clean,
        showInvite,
        showGroupSetting,
        openConfirmDialog,
        showNftpass,
        showNftpasslet,
        showPoint,
        showPointItem,
        showNftCheckIn,
        showGift,
        showGiftCheckIn,
        showGiftItem,
        showTransferAccept
    }

    return (
        <DialogsContext.Provider value={ contextValue }>
            { props.children }
            { dialogsGroup.dialogs.map((item: any, index) => {
                return item.content()
            }) }
        </DialogsContext.Provider>
    )
}

export default DialogProvider
