import NextError from "next/error";
import {useEffect} from "react";
import {TrackJS, TrackJSInstall} from "./trackjs-loader";

TrackJSInstall();

export default function GlobalError({error, reset}: any) {
    useEffect(() => {
        !!error && TrackJS.track(error);
    }, [error]);

    return <div></div>
}
