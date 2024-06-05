export const TrackJS = (typeof window !== "undefined") ?
    require("trackjs").TrackJS :
    require("trackjs-node").TrackJS;

export function TrackJSInstall() {
    if (!TrackJS.isInstalled()) {
        TrackJS.install({
            token: "c5ca9d80b2074086a16eb7efd23034af",
        });
    }
}
