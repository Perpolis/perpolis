"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'

interface TradingChartProps {
  tokenAddress: string
  tokenSymbol: string
  timeframe: string
}

function TradingChartInner({ tokenAddress, tokenSymbol, timeframe }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  const candleSeriesRef = useRef<any>(null)
  const volumeSeriesRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chartReady, setChartReady] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Initialize chart with dynamic import
  useEffect(() => {
    if (!mounted || !chartContainerRef.current) return

    // Dynamic import for client-side only
    import('lightweight-charts').then(({ createChart, ColorType }) => {
      if (!chartContainerRef.current) return
      
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0a0a0a' },
        textColor: '#666',
      },
      grid: {
        vertLines: { color: '#1a1a1a' },
        horzLines: { color: '#1a1a1a' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#333',
          width: 1,
          style: 2,
        },
        horzLine: {
          color: '#333',
          width: 1,
          style: 2,
        },
      },
      rightPriceScale: {
        borderColor: '#2a2a2a',
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
        autoScale: true,
      },
      localization: {
        priceFormatter: (price: number) => {
          const p = Number(price)
          if (!Number.isFinite(p)) return '0'
          if (p === 0) return '0'
          if (p < 0.00001) return p.toExponential(4)
          if (p < 0.0001) return p.toFixed(8)
          if (p < 0.001) return p.toFixed(6)
          if (p < 0.01) return p.toFixed(5)
          if (p < 1) return p.toFixed(4)
          if (p < 100) return p.toFixed(2)
          return p.toFixed(0)
        },
      },
      timeScale: {
        borderColor: '#2a2a2a',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    })

    // Add candlestick series with custom price formatting for small values
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#22c55e',
      wickDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      priceFormat: {
        type: 'custom',
        formatter: (price: number) => {
          const p = Number(price)
          if (!Number.isFinite(p)) return '0'
          if (p === 0) return '0'
          if (p < 0.00001) return p.toExponential(4)
          if (p < 0.0001) return p.toFixed(8)
          if (p < 0.001) return p.toFixed(6)
          if (p < 0.01) return p.toFixed(5)
          if (p < 1) return p.toFixed(4)
          if (p < 100) return p.toFixed(2)
          return p.toFixed(0)
        },
        minMove: 0.00000001,
      },
    })

    // Add volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#2a2a2a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    })

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.85,
        bottom: 0,
      },
    })

    chartRef.current = chart
    candleSeriesRef.current = candleSeries
    volumeSeriesRef.current = volumeSeries
    setChartReady(true)

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        })
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()
    
    }).catch(err => {
      console.error('Failed to load chart library:', err)
      setError('Failed to load chart')
    })
    
    return () => {
      window.removeEventListener('resize', () => {})
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
      }
      setChartReady(false)
    }
  }, [mounted])

  // Fetch and update data
  useEffect(() => {
    if (!chartReady || !candleSeriesRef.current || !volumeSeriesRef.current || !tokenAddress) return

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/ohlcv?address=${tokenAddress}&timeframe=${timeframe}`)
        const result = await response.json()

        if (result.data && result.data.length > 0) {
          // Sanitize: drop incomplete candles, coerce numerics, dedupe times, and
          // ensure ascending order — lightweight-charts crashes hard on bad rows
          // (undefined .toFixed inside its formatter).
          const seenTimes = new Set<number>()
          const cleaned = (result.data as any[])
            .filter((d) => d && typeof d.time === 'number' && Number.isFinite(d.time))
            .map((d) => ({
              time: d.time as number,
              open: Number(d.open) || 0,
              high: Number(d.high) || 0,
              low: Number(d.low) || 0,
              close: Number(d.close) || 0,
              volume: Number(d.volume) || 0,
            }))
            .filter((d) =>
              Number.isFinite(d.open) &&
              Number.isFinite(d.high) &&
              Number.isFinite(d.low) &&
              Number.isFinite(d.close) &&
              d.open > 0 && d.high > 0 && d.low > 0 && d.close > 0
            )
            .filter((d) => {
              if (seenTimes.has(d.time)) return false
              seenTimes.add(d.time)
              return true
            })
            .sort((a, b) => a.time - b.time)

          if (cleaned.length === 0) {
            setError('No chart data')
            return
          }

          const candleData = cleaned.map((d) => ({
            time: d.time as any,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
          }))

          const volumeData = cleaned.map((d) => ({
            time: d.time as any,
            value: d.volume,
            color: d.close >= d.open ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
          }))

          try {
            candleSeriesRef.current?.setData(candleData)
            volumeSeriesRef.current?.setData(volumeData)
            chartRef.current?.timeScale().fitContent()
          } catch (setDataErr) {
            console.error('Chart setData crash:', setDataErr)
            setError('Chart data invalid for this market')
          }
        }
      } catch (err) {
        console.error('Failed to fetch chart data:', err)
        setError('Failed to load chart data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [tokenAddress, timeframe, chartReady])

  return (
    <div className="relative w-full h-full">
      <div ref={chartContainerRef} className="w-full h-full" />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]/80">
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
            <span>Loading chart...</span>
          </div>
        </div>
      )}
      
      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]/80">
          <p className="text-gray-500">{error}</p>
        </div>
      )}
      
      {/* Chart watermark */}
      <div className="absolute bottom-12 left-4 text-gray-600 text-xs pointer-events-none">
        {tokenSymbol}-PERP
      </div>
    </div>
  )
}

// Wrapper component that handles SSR
export function TradingChart(props: TradingChartProps) {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  if (!isClient) {
    return (
      <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-400">
          <div className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
          <span>Loading chart...</span>
        </div>
      </div>
    )
  }
  
  return <TradingChartInner {...props} />
}
