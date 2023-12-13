import {useState, useContext, useEffect} from 'react'
import AppSubTabs from "@/components/base/AppSubTabs";
import {Tab, Tabs} from "baseui/tabs";
import {useSearchParams, useRouter} from "next/navigation";
import {Profile} from "@/service/solas";
import LangContext from "@/components/provider/LangProvider/LangContext";
import UserContext from "@/components/provider/UserProvider/UserContext";
import dynamic from 'next/dynamic'
import ListUserCurrency from "@/components/compose/ListUserCurrency/ListUserCurrency";
import ListNftAsset from "@/components/compose/ListNftAsset/ListNftAsset";

import UserRecognition from "@/components/compose/ListUserRecognition/ListUserRecognition";



function ComponentName({profile}: {profile: Profile}) {
    return <UserRecognition profile={profile} />
}

export default ComponentName
