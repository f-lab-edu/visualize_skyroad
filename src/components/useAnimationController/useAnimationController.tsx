import { useEffect, useRef, useState } from 'react'

const useAnimationController = (
    onUpdate: (deltaTime: number, additionalParam: any) => void,
    onStart: () => void,
    onStop: () => void,
    duration: number) => {
    const [isPlaying, setIsPlaying] = useState<boolean>(false)
    const [isPaused, setIsPaused] = useState<boolean>(false)
    const requestRef = useRef<number | null>(null)
    const previousTimeRef = useRef<number | null>(null)

    const play = () => {
        if (!isPlaying) {
            setIsPlaying(true)
            setIsPaused(false)
            onStart()
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
        onStop()
    }

    const animate = (time: number) => {
        if (previousTimeRef.current !== null) {
            onUpdate(requestRef.current!, { speed: 1 })
            console.log(requestRef.current!, duration)
        }
        previousTimeRef.current = time
        if (!isPaused) {
            requestRef.current = requestAnimationFrame(animate)
        }
        if (requestRef.current! >= duration) {
            cancelAnimationFrame(requestRef.current!)
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