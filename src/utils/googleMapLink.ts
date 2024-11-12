 const genGoogleMapLink = (lat: string | number, lng: string | number, place_id?: null | string) => {
    let url = `https://www.google.com/maps/search/?api=1&query=${lat}%2C${lng}`
    if (place_id) {
        url = url + `&query_place_id=${place_id}`
    }
    return url
}

 export default genGoogleMapLink
