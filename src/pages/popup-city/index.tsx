import {useEffect, useState} from 'react'
import styles from './popupcity.module.scss'
import Link from "next/link";
import CardPopupCity from "@/components/base/Cards/CardPopupCity/index.ts";
import {getEventGroup, memberCount, PopupCity, queryPopupCity} from "@/service/solas";
import Footer from "@/components/base/Footer";

function PopupCityPage({popupCities} : {popupCities: PopupCity[]}) {

    let topPopupCities: PopupCity[] = []
    let normalPopupCities: PopupCity[] = []
    let featuredPopupCities: PopupCity[] = []
    popupCities.forEach((item) => {
        if (item.group_tags?.includes(':featured')) {
            featuredPopupCities.push(item)
        } else if (item.group_tags?.includes(':top')) {
            topPopupCities.push(item)
        } else {
            normalPopupCities.push(item)
        }
    })

    const _sortedPopupCities = [...featuredPopupCities, ...topPopupCities, ...normalPopupCities]

    return (<div className={styles['popup-city-page']}>
        <div className={styles['center']}>
            <h2 className={styles['page-title']}>
                <div>Events of Pop-up Cities</div>
            </h2>

            <div className={styles['popup-city-list']}>
                {_sortedPopupCities.map(item => {
                    return <CardPopupCity key={item.id} popupCity={item}/>
                })}
            </div>

            <Footer />
        </div>
    </div>)
}

export default PopupCityPage

export const getServerSideProps: any  = async (context: any) => {
    const popupCities = await queryPopupCity({page: 1, page_size: 1000})
    console.log(popupCities.length)
    return {
        props: {
            popupCities: popupCities,
        }
    }
}

