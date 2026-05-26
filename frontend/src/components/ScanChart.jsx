import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement,
  LineElement, Filler, Tooltip, Legend
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

export default function ScanChart({ dates = [], counts = [] }) {
  const chartRef = useRef(null)

  const data = {
    labels: dates.map(d => {
      const dt = new Date(d)
      return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }),
    datasets: [{
      label: 'Scans',
      data: counts,
      fill: true,
      tension: 0.45,
      pointRadius: 5,
      pointHoverRadius: 8,
      pointBackgroundColor: '#6366f1',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      borderColor: '#6366f1',
      borderWidth: 2,
      backgroundColor: function(ctx) {
        const chart = ctx.chart
        const { ctx: c, chartArea } = chart
        if (!chartArea) return 'transparent'
        const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
        gradient.addColorStop(0, 'rgba(99,102,241,0.35)')
        gradient.addColorStop(1, 'rgba(99,102,241,0.01)')
        return gradient
      },
    }],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(12,15,26,0.95)',
        borderColor: 'rgba(99,102,241,0.4)',
        borderWidth: 1,
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8',
        padding: 12,
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y} scan${ctx.parsed.y !== 1 ? 's' : ''}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
        ticks: { color: '#64748b', font: { size: 11, family: 'Inter' } },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
        ticks: { color: '#64748b', font: { size: 11, family: 'Inter' }, stepSize: 1 },
        border: { display: false },
      },
    },
  }

  return (
    <div style={{ height: 220 }}>
      <Line ref={chartRef} data={data} options={options} />
    </div>
  )
}
