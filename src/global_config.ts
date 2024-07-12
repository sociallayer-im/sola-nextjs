export const hideAddressGroup = [3409,3452]
export const isHideLocation = (group_id?: number | null) => {
    if (!group_id) return false
    return hideAddressGroup.includes(group_id)
}
