import { useEffect, useRef, useState } from 'react'

const useAnimationController = (
    onUpdate: (deltaTime: number, additionalParam: any) => void,
    onStarted: () => void,
    duration: number) => {
    const [isPlaying, setIsPlaying] = useState<boolean>(false)
    const [isPaused, setIsPaused] = useState<boolean>(false)
    const requestRef = useRef<number | null>(null)
    const previousTimeRef = useRef<number | null>(null)

    const play = () => {
        if (!isPlaying) {
            setIsPlaying(true)
            setIsPaused(false)
            onStarted()
        }
    }
    const pause = () => {
        if (isPlaying) {
            setIsPaused(true)
            setIsPlaying(false)
        }
    }
    const stop = () => {
        setIsPlaying(false)
        setIsPaused(false)
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current)
            requestRef.current = null
        }
        previousTimeRef.current = null
    }

    const animate = (time: number) => {
        if (previousTimeRef.current !== null) {
            onUpdate(requestRef.current!, { speed: 1 })
        }
        previousTimeRef.current = time
        if (!isPaused) {
            requestRef.current = requestAnimationFrame(animate)
        }
    }

    useEffect(() => {
        if (isPlaying && !isPaused)
            requestRef.current = requestAnimationFrame(animate)

        return () => {
            if (requestRef.current)
                cancelAnimationFrame(requestRef.current)
        }
    }, [isPlaying, isPaused])

    return { play, pause, stop, isPlaying, isPaused }
}

export default useAnimationController