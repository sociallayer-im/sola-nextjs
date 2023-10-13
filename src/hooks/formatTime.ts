const formatTime = (dateString: string) => {
    const dateObject = new Date(dateString)
    const year = dateObject.getFullYear() + ''
    const mon = dateObject.getMonth() + 1 + ''
    const date = dateObject.getDate() + ''
    const hour = dateObject.getHours() + ''
    const min = dateObject.getMinutes() + ''
    return `${year}.${mon.padStart(2, '0')}.${date.padStart(2, '0')} ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`
}

function useTime () {
    return formatTime
}

export default useTime
