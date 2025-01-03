import { useState } from 'react'

const useBearingWithMovingAverage = (windowSize: number) => {
  const [_, setBearingList] = useState<number[]>([])
  const [bearing, setBearing] = useState<number>(10)

  const smoothBearing = (bearingList: number[]): number => {
    const validBearings = bearingList.filter((b: number) => b !== 0)
    const sum = validBearings.reduce((acc: number, val: number) => acc + val, 0)
    return validBearings.length > 0 ? sum / validBearings.length : 0
  }

  const addBearing = (newBearing: number) => {
    setBearingList((prevList) => {
      const updatedList = [...prevList.slice(-windowSize + 1), newBearing]
      const averagdeBearing = smoothBearing(updatedList)
      setBearing(averagdeBearing)
      return updatedList
    })
  }
  return { bearing, addBearing }
}

export default useBearingWithMovingAverage
