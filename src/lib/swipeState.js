export const toSwipeMap = (swipes = []) => (
  swipes.reduce((actions, swipe) => {
    actions[String(swipe.house_id)] = swipe.action
    return actions
  }, {})
)

export const countSwipeActions = (actions = {}) => {
  const values = Object.values(actions)
  const liked = values.filter((action) => action === 'like').length
  const passed = values.filter((action) => action === 'pass').length

  return {
    liked,
    passed,
    total: liked + passed,
  }
}

export const saveSwipeToState = (actions, houseId, action) => ({
  ...actions,
  [String(houseId)]: action,
})

export const removeSwipeFromState = (actions, houseId) => {
  const nextActions = { ...actions }
  delete nextActions[String(houseId)]
  return nextActions
}
