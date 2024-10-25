export const hideAddressGroup = [3409,3452]
export const isHideLocation = (group_id?: number | null) => {
    if (!group_id) return false
    return hideAddressGroup.includes(group_id)
}

export const edgeGroups = [3427, 3409, 3463, 3454]
export const showZupassTicket = [3409]
