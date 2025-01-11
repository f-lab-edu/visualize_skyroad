import { useEffect, useState } from 'react'

interface Location {
  error: null | string
  latitude: null | number
  longitude: null | number
}

const useGetCurrentLocation = (): Location => {
  const [location, setLocation] = useState<Location>({
    latitude: null,
    longitude: null,
    error: null,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser.',
      }))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
        })
      },
      (error) => {
        setLocation((prev) => ({ ...prev, error: error.message }))
      }
    )
  }, [])

  return location
}

export default useGetCurrentLocation
