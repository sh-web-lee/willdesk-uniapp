export function gtag (eventCategory, eventName, eventLabel, eventValue) {
  // console.log('event', eventCategory, eventName, eventLabel, eventValue)
  window._gtag('get', 'G-XC26FJYYSJ', eventLabel, (eventValue) => {
    window._gtag('event', eventName, {
      event_category: eventCategory,
      event_label: eventLabel,
      value: eventValue
    })
  })
}
